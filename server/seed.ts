import mongoose, { Types } from "mongoose";
import axios from "axios";
import cron from "node-cron";
import Sport, { ISport } from "./src/models/sport.model";
import League, { ILeague } from "./src/models/league.model";
import Team, { ITeam } from "./src/models/team.model";
import Match, { MatchStatus } from "./src/models/match.model";
import User from "./src/models/user.model";
import Replay from "./src/models/replay.model";
import { connectDB } from "./src/configs/connectDB";

// Định nghĩa interface cho dữ liệu API
interface ApiMatch {
  id: number;
  type: string;
  referenceId: string;
  slug: string;
  title: string;
  tournamentName: string;
  homeClub: { name: string; logoUrl: string };
  awayClub: { name: string; logoUrl: string };
  startTime: string;
  commentator: {
    id: number;
    username: string;
    email: string | null;
    phoneNumber: string;
    password: string;
    fullName: string;
    nickname: string;
    gender: string;
    avatarUrl: string;
    coverUrl: string | null;
    bio: string | null;
    status: string;
    role: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  streams: Array<{
    id: number;
    name: string;
    sourceType: string;
    sourceUrl: string;
    createdAt: string;
    updatedAt: string;
  }>;
  articleUrl: string;
  // isHot: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hàm tạo slug từ tên
const createSlug = (name: string): string => {
  if (!name || typeof name !== "string" || name.trim() === "") {
    console.error(`Invalid team name: ${name}`);
    return `${name}`; // Fallback slug to avoid validation error
  }
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return slug || `${name}`; // Ensure slug is never empty
};

// Hàm ánh xạ trạng thái API sang MatchStatus enum
const mapStatus = (
  startTime: string,
  streams: Array<{ sourceUrl: string }>
): MatchStatus => {
  const now = new Date();
  const matchTime = new Date(startTime);

  // Kiểm tra nếu trận đấu đã qua 6 tiếng
  if (now >= new Date(matchTime.getTime() + 6 * 60 * 60 * 1000)) {
    return MatchStatus.FINISHED;
  }

  // Kiểm tra nếu có sourceUrl không rỗng
  const hasLiveStream = streams.some((stream) => stream?.sourceUrl?.length > 0);
  if (hasLiveStream) {
    return MatchStatus.LIVE;
  }

  // Nếu không có sourceUrl, đặt trạng thái là UPCOMING
  return MatchStatus.UPCOMING;
};

// Hàm xử lý dữ liệu từ API
const processApiData = async (matches: ApiMatch[]) => {
  try {
    // Collect all slugs from API matches
    const apiMatchSlugs = matches.map((match) => match.slug);
    const apiMatchTitles = matches.map((match) => match.title); // Thu thập danh sách title từ API
    let footballSport: ISport | null = await Sport.findOne({
      slug: "football",
    });
    if (!footballSport) {
      footballSport = await Sport.create({
        name: "Bóng đá",
        slug: "football",
        icon: "http://localhost:8080/static/1750393380140-735399985.png",
        order: 2,
      });
      console.log("Created Sport: Football");
    }

    const commentators = new Set(
      matches
        .filter((match) => match.commentator)
        .map((match) => ({
          id: match.commentator!.id,
          username: match.commentator!.username,
          nickname: match.commentator!.nickname,
          gender: match.commentator!.gender,
          avatar: match.commentator!.avatarUrl,
          password: match.commentator!.password,
        }))
    );

    for (const commentator of commentators) {
      let user = await User.findOne({ username: commentator.nickname });
      if (!user) {
        user = await User.create({
          typeLogin: "phone",
          id: commentator.id.toString(),
          tokenLogin: "",
          username: commentator.nickname,
          firstname: commentator.nickname.split(" ").slice(0, -1).join(" "),
          lastname: commentator.nickname.split(" ").pop(),
          phone: "",
          password: commentator.password,
          refreshToken: "",
          avatar: commentator.avatar,
          role: "COMMENTATOR",
          level: 0,
          address: "",
          gender: commentator.gender,
        });
        console.log(`Created User: ${commentator.nickname}`);
      }
    }

    const leagues = new Set(
      matches.map((match) => ({
        name: match.tournamentName,
        slug: createSlug(match.tournamentName),
      }))
    );

    for (const leagueData of leagues) {
      let league = await League.findOne({ slug: leagueData.slug });
      if (!league) {
        league = await League.create({
          name: leagueData.name,
          slug: leagueData.slug,
          logo: "",
          sport: footballSport._id,
        });
        console.log(`Created League: ${leagueData.name}`);
      }
    }

    const teams = new Set(
      matches.flatMap((match) => [
        { name: match.homeClub.name, logo: match.homeClub.logoUrl },
        { name: match.awayClub.name, logo: match.awayClub.logoUrl },
      ])
    );

    for (const teamData of teams) {
      let team = await Team.findOne({ slug: createSlug(teamData.name) });
      if (!team) {
        team = await Team.create({
          name: teamData.name,
          slug: createSlug(teamData.name),
          logo: teamData.logo,
          sport: footballSport._id,
        });
        console.log(`Created Team: ${teamData.name}`);
      }
    }

    for (const matchData of matches) {
      console.log(
        `Processing match: ${matchData.title}, slug: ${matchData.slug}`
      );
      const league: ILeague | null = await League.findOne({
        slug: createSlug(matchData.tournamentName),
      });
      const homeTeam: ITeam | null = await Team.findOne({
        slug: createSlug(matchData.homeClub.name),
      });
      const awayTeam: ITeam | null = await Team.findOne({
        slug: createSlug(matchData.awayClub.name),
      });
      const commentator = matchData.commentator
        ? await User.findOne({ username: matchData.commentator.nickname })
        : null;
      console.log(
        `Commentator for ${matchData.title}: ${
          commentator ? commentator.username : "None"
        }`
      );

      if (!league || !homeTeam || !awayTeam) {
        console.log(
          `Skipping match: ${matchData.title} due to missing league or teams`
        );
        continue;
      }

      let match = await Match.findOne({ slug: matchData.slug });

      // Create streamLinks based on commentator and multiple streams
      const newStreamLinks = [];
      if (commentator) {
        // Add stream links for each stream associated with the match
        matchData.streams.forEach((stream, index) => {
          newStreamLinks.push({
            label: `${matchData?.commentator?.nickname} - Stream ${index + 1}`, // Unique label for each stream
            url: stream.sourceUrl,
            image:
              commentator.avatar ||
              `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`,
            commentator: commentator._id,
            commentatorImage: commentator.avatar,
            priority: 1,
          });
        });
        if (matchData.streams.length === 0) {
          newStreamLinks.push({
            label: matchData?.commentator?.nickname,
            url: "",
            image:
              commentator.avatar ||
              `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`,
            commentator: commentator._id,
            commentatorImage: commentator.avatar,
            priority: 1,
          });
        }
      } else if (matchData.streams.length > 0) {
        // Fallback to create streamLinks from streams if no commentator
        newStreamLinks.push(
          ...matchData.streams.map((stream, index) => ({
            label: `Stream ${index + 1}`,
            url: stream.sourceUrl,
            image: `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`,
            commentator: undefined,
            commentatorImage: undefined,
            priority: 1,
          }))
        );
      }

      if (!match) {
        match = await Match.create({
          title: matchData.title,
          slug: matchData.slug,
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          league: league._id,
          sport: footballSport._id,
          startTime: new Date(matchData.startTime),
          status: mapStatus(matchData.startTime, matchData.streams), // Corrected from startTime to matchData.startTime
          scores: { homeScore: 0, awayScore: 0 },
          streamLinks: newStreamLinks,
          // isHot: matchData.isHot,
          source: "BUGIO", // Set source to BUGIO
        });
        console.log(
          `Created Match: ${matchData.title} with slug: ${matchData.slug}`
        );
      } else {
        if (match.source === "BUGIO") {
          const newStatus = mapStatus(matchData.startTime, matchData.streams);
          const currentStreamLinks = match.streamLinks.map((link) => ({
            label: link.label,
            url: link.url,
            image: link.image,
            commentator: link.commentator?._id,
            commentatorImage: link.commentatorImage,
            priority: link.priority,
          }));

          const hasChanged =
            match.title !== matchData.title ||
            match.slug !== matchData.slug ||
            !match.homeTeam.equals(homeTeam._id as any) ||
            !match.awayTeam.equals(awayTeam._id as any) ||
            !match.league.equals(league._id as any) ||
            match.startTime.getTime() !==
              new Date(matchData.startTime).getTime() ||
            match.status !== newStatus ||
            JSON.stringify(currentStreamLinks) !==
              JSON.stringify(newStreamLinks);

          if (hasChanged) {
            match.title = matchData.title;
            match.slug = matchData.slug;
            match.homeTeam = homeTeam._id as any;
            match.awayTeam = awayTeam._id as any;
            match.league = league._id as any;
            match.startTime = new Date(matchData.startTime);
            match.status = newStatus;
            match.streamLinks = newStreamLinks as any;
            // match.isHot = matchData.isHot;
            await match.save();
            console.log(
              `Updated Match: ${matchData.title} (Status: ${match.status} -> ${newStatus})`
            );
          } else {
            console.log(`No changes for Match: ${matchData.title}`);
          }
        } else {
          console.log(
            `Skipping update for manual match: ${matchData.title} (slug: ${matchData.slug})`
          );
        }
      }

      let replay = await Replay.findOne({ slug: `${matchData.slug}-replay` });
      if (!replay) {
        replay = await Replay.create({
          title: `${matchData.title} - Replay`,
          slug: `${matchData.slug}-replay`,
          description: `Replay of the match between ${matchData.homeClub.name} and ${matchData.awayClub.name}`,
          videoUrl: `https://example.com/replays/${matchData.slug}.mp4`,
          thumbnail: `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`,
          match: match._id,
          sport: footballSport._id,
          commentator: commentator?._id,
          commentatorNickname: matchData.commentator?.nickname,
          views: 0,
          duration: 7200,
          publishDate: new Date(matchData.createdAt),
          isShown: true,
        });
        console.log(`Created Replay: ${matchData.title} - Replay`);
      }
    }

    // Delete matches not present in the API response, only for football sport
    const matchesToDelete = await Match.find({
      slug: { $nin: apiMatchSlugs },
      sport: footballSport._id,
      source: "BUGIO", // Chỉ xóa các trận từ BUGIO
    });
    for (const match of matchesToDelete) {
      if (match.isHot) {
        match.isHot = false;
        await match.save();
        console.log(
          `Set isHot to false for match: ${match.title} (slug: ${match.slug})`
        );
      }
    }

    // Thu thập ID của các trận cần xóa
    const deleteMatchIds = matchesToDelete.map((match) => match._id);

    // Xóa các trận đấu được chọn
    const deletedMatches = await Match.deleteMany({
      _id: { $in: deleteMatchIds },
    });
    if (deletedMatches.deletedCount > 0) {
      console.log(
        `Deleted ${deletedMatches.deletedCount} stale football matches`
      );

      // Delete associated replays for deleted matches, only for football sport
      const deletedReplays = await Replay.deleteMany({
        slug: { $nin: apiMatchSlugs.map((slug) => `${slug}-replay`) },
        sport: footballSport._id,
      });
      console.log(
        `Deleted ${deletedReplays.deletedCount} stale football replays`
      );
    } else {
      console.log("No stale football matches to delete");
    }
  } catch (error: any) {
    console.error("Error processing API data:", error.message);
  }
};
// Hàm gọi API định kỳ
export async function startPolling() {
  try {
    await connectDB();
    console.log("Polling started");

    const response = await axios.get(
      "https://sv.bugiotv.xyz/internal/api/matches"
    );
    const matches: ApiMatch[] = response.data.data;
    await processApiData(matches);

    cron.schedule("*/30 * * * * *", async () => {
      try {
        console.log("Polling API...");
        const response = await axios.get(
          "https://sv.bugiotv.xyz/internal/api/matches"
        );
        const matches: ApiMatch[] = response.data.data;
        await processApiData(matches);
      } catch (error: any) {
        console.error("Error polling API:", error.message);
      }
    });
  } catch (error: any) {
    console.error("Error starting polling:", error.message);
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// import mongoose, { Types } from "mongoose";
// import axios from "axios";
// import cron from "node-cron";
// import Sport, { ISport } from "./src/models/sport.model";
// import League, { ILeague } from "./src/models/league.model";
// import Team, { ITeam } from "./src/models/team.model";
// import Match, { MatchStatus } from "./src/models/match.model";
// import User from "./src/models/user.model";
// import Replay from "./src/models/replay.model";
// import { connectDB } from "./src/configs/connectDB";

// // Định nghĩa interface cho dữ liệu API
// interface ApiMatch {
//   id: number;
//   type: string;
//   referenceId: string;
//   slug: string;
//   title: string;
//   tournamentName: string;
//   homeClub: { name: string; logoUrl: string };
//   awayClub: { name: string; logoUrl: string };
//   startTime: string;
//   commentator: {
//     id: number;
//     username: string;
//     email: string | null;
//     phoneNumber: string;
//     password: string;
//     fullName: string;
//     nickname: string;
//     gender: string;
//     avatarUrl: string;
//     coverUrl: string | null;
//     bio: string | null;
//     status: string;
//     role: string | null;
//     createdAt: string;
//     updatedAt: string;
//   } | null;
//   streams: Array<{
//     id: number;
//     name: string;
//     sourceType: string;
//     sourceUrl: string;
//     createdAt: string;
//     updatedAt: string;
//   }>;
//   articleUrl: string;
//   isHot: boolean;
//   isPinned: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// // Hàm tạo slug từ tên
// const createSlug = (name: string): string => {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .trim()
//     .replace(/\s+/g, "-");
// };

// // Hàm ánh xạ trạng thái API sang MatchStatus enum
// const mapStatus = (startTime: string): MatchStatus => {
//   const now = new Date();
//   const matchTime = new Date(startTime);
//   if (matchTime > now) return MatchStatus.UPCOMING;
//   if (
//     matchTime < now &&
//     now < new Date(matchTime.getTime() + 6 * 60 * 60 * 1000)
//   ) {
//     return MatchStatus.LIVE;
//   }
//   return MatchStatus.FINISHED;
// };

// // Hàm xử lý dữ liệu từ API
// // Hàm xử lý dữ liệu từ API
// const processApiData = async (matches: ApiMatch[]) => {
//   try {
//     // Collect all slugs from API matches
//     const apiMatchSlugs = matches.map((match) => match.slug);

//     let footballSport: ISport | null = await Sport.findOne({
//       slug: "football",
//     });
//     if (!footballSport) {
//       footballSport = await Sport.create({
//         name: "Bóng đá",
//         slug: "football",
//         icon: "http://localhost:8080/static/1750393380140-735399985.png",
//         order: 2,
//       });
//       console.log("Created Sport: Football");
//     }

//     const commentators = new Set(
//       matches
//         .filter((match) => match.commentator)
//         .map((match) => ({
//           id: match.commentator!.id,
//           username: match.commentator!.username,
//           nickname: match.commentator!.nickname,
//           gender: match.commentator!.gender,
//           avatar: match.commentator!.avatarUrl,
//           password: match.commentator!.password,
//         }))
//     );

//     for (const commentator of commentators) {
//       let user = await User.findOne({ username: commentator.nickname });
//       if (!user) {
//         user = await User.create({
//           typeLogin: "phone",
//           id: commentator.id.toString(),
//           tokenLogin: "",
//           username: commentator.nickname,
//           firstname: commentator.nickname.split(" ").slice(0, -1).join(" "),
//           lastname: commentator.nickname.split(" ").pop(),
//           phone: "",
//           password: commentator.password,
//           refreshToken: "",
//           avatar: commentator.avatar,
//           role: "COMMENTATOR",
//           level: 0,
//           address: "",
//           gender: commentator.gender,
//         });
//         console.log(`Created User: ${commentator.nickname}`);
//       }
//     }

//     const leagues = new Set(
//       matches.map((match) => ({
//         name: match.tournamentName,
//         slug: createSlug(match.tournamentName),
//       }))
//     );

//     for (const leagueData of leagues) {
//       let league = await League.findOne({ slug: leagueData.slug });
//       if (!league) {
//         league = await League.create({
//           name: leagueData.name,
//           slug: leagueData.slug,
//           logo: "",
//           sport: footballSport._id,
//         });
//         console.log(`Created League: ${leagueData.name}`);
//       }
//     }

//     const teams = new Set(
//       matches.flatMap((match) => [
//         { name: match.homeClub.name, logo: match.homeClub.logoUrl },
//         { name: match.awayClub.name, logo: match.awayClub.logoUrl },
//       ])
//     );

//     for (const teamData of teams) {
//       let team = await Team.findOne({ slug: createSlug(teamData.name) });
//       if (!team) {
//         team = await Team.create({
//           name: teamData.name,
//           slug: createSlug(teamData.name),
//           logo: teamData.logo,
//           sport: footballSport._id,
//         });
//         console.log(`Created Team: ${teamData.name}`);
//       }
//     }

//     for (const matchData of matches) {
//       console.log(
//         `Processing match: ${matchData.title}, slug: ${matchData.slug}`
//       );
//       const league: ILeague | null = await League.findOne({
//         slug: createSlug(matchData.tournamentName),
//       });
//       const homeTeam: ITeam | null = await Team.findOne({
//         slug: createSlug(matchData.homeClub.name),
//       });
//       const awayTeam: ITeam | null = await Team.findOne({
//         slug: createSlug(matchData.awayClub.name),
//       });
//       const commentator = matchData.commentator
//         ? await User.findOne({ username: matchData.commentator.nickname })
//         : null;
//       console.log(
//         `Commentator for ${matchData.title}: ${
//           commentator ? commentator.username : "None"
//         }`
//       );

//       if (!league || !homeTeam || !awayTeam) {
//         console.log(
//           `Skipping match: ${matchData.title} due to missing league or teams`
//         );
//         continue;
//       }

//       let match = await Match.findOne({ slug: matchData.slug });

//       // Create streamLinks based on commentator, independent of streams
//       const newStreamLinks = [];
//       if (commentator) {
//         newStreamLinks.push({
//           label: matchData?.commentator?.nickname, // Use nickname as label
//           url:
//             matchData.streams.length > 0 ? matchData.streams[0].sourceUrl : "", // Use first stream URL if available, otherwise empty
//           image:
//             commentator.avatar ||
//             `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`, // Use commentator avatar or default image
//           commentator: commentator._id,
//           commentatorImage: commentator.avatar,
//           priority: 1,
//         });
//       } else if (matchData.streams.length > 0) {
//         // Fallback to create streamLinks from streams if no commentator
//         newStreamLinks.push(
//           ...matchData.streams.map((stream) => ({
//             label: stream.name,
//             url: stream.sourceUrl,
//             image: `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`,
//             commentator: undefined,
//             commentatorImage: undefined,
//             priority: 1,
//           }))
//         );
//       }

//       if (!match) {
//         match = await Match.create({
//           title: matchData.title,
//           slug: matchData.slug,
//           homeTeam: homeTeam._id,
//           awayTeam: awayTeam._id,
//           league: league._id,
//           sport: footballSport._id,
//           startTime: new Date(matchData.startTime),
//           status: mapStatus(matchData.startTime),
//           scores: { homeScore: 0, awayScore: 0 },
//           streamLinks: newStreamLinks,
//           isHot: matchData.isHot,
//         });
//         console.log(
//           `Created Match: ${matchData.title} with slug: ${matchData.slug}`
//         );
//       } else {
//         const newStatus = mapStatus(matchData.startTime);
//         const currentStreamLinks = match.streamLinks.map((link) => ({
//           label: link.label,
//           url: link.url,
//           image: link.image,
//           commentator: link.commentator?._id,
//           commentatorImage: link.commentatorImage,
//           priority: link.priority,
//         }));

//         const hasChanged =
//           match.title !== matchData.title ||
//           match.slug !== matchData.slug ||
//           !match.homeTeam.equals(homeTeam._id as any) ||
//           !match.awayTeam.equals(awayTeam._id as any) ||
//           !match.league.equals(league._id as any) ||
//           match.startTime.getTime() !==
//             new Date(matchData.startTime).getTime() ||
//           match.status !== newStatus ||
//           match.isHot !== matchData.isHot ||
//           JSON.stringify(currentStreamLinks) !== JSON.stringify(newStreamLinks);

//         if (hasChanged) {
//           match.title = matchData.title;
//           match.slug = matchData.slug;
//           match.homeTeam = homeTeam._id as any;
//           match.awayTeam = awayTeam._id as any;
//           match.league = league._id as any;
//           match.startTime = new Date(matchData.startTime);
//           match.status = newStatus;
//           match.streamLinks = newStreamLinks as any;
//           match.isHot = matchData.isHot;
//           await match.save();
//           console.log(
//             `Updated Match: ${matchData.title} (Status: ${match.status} -> ${newStatus})`
//           );
//         } else {
//           console.log(`No changes for Match: ${matchData.title}`);
//         }
//       }

//       let replay = await Replay.findOne({ slug: `${matchData.slug}-replay` });
//       if (!replay) {
//         replay = await Replay.create({
//           title: `${matchData.title} - Replay`,
//           slug: `${matchData.slug}-replay`,
//           description: `Replay of the match between ${matchData.homeClub.name} and ${matchData.awayClub.name}`,
//           videoUrl: `https://example.com/replays/${matchData.slug}.mp4`,
//           thumbnail: `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`,
//           match: match._id,
//           sport: footballSport._id,
//           commentator: commentator?._id,
//           commentatorNickname: matchData.commentator?.nickname,
//           views: 0,
//           duration: 7200,
//           publishDate: new Date(matchData.createdAt),
//           isShown: true,
//         });
//         console.log(`Created Replay: ${matchData.title} - Replay`);
//       }
//     }

//     // Delete matches not present in the API response, only for football sport
//     const deletedMatches = await Match.deleteMany({
//       slug: { $nin: apiMatchSlugs },
//       sport: footballSport._id,
//     });

//     if (deletedMatches.deletedCount > 0) {
//       console.log(
//         `Deleted ${deletedMatches.deletedCount} stale football matches`
//       );

//       // Delete associated replays for deleted matches, only for football sport
//       const deletedReplays = await Replay.deleteMany({
//         slug: { $nin: apiMatchSlugs.map((slug) => `${slug}-replay`) },
//         sport: footballSport._id,
//       });
//       console.log(
//         `Deleted ${deletedReplays.deletedCount} stale football replays`
//       );
//     } else {
//       console.log("No stale football matches to delete");
//     }
//   } catch (error: any) {
//     console.error("Error processing API data:", error.message);
//   }
// };
// // Hàm gọi API định kỳ
// export async function startPolling() {
//   try {
//     await connectDB();
//     console.log("Polling started");

//     const response = await axios.get(
//       "https://sv.bugiotv.xyz/internal/api/matches"
//     );
//     const matches: ApiMatch[] = response.data.data;
//     await processApiData(matches);

//     cron.schedule("*/30 * * * * *", async () => {
//       try {
//         console.log("Polling API...");
//         const response = await axios.get(
//           "https://sv.bugiotv.xyz/internal/api/matches"
//         );
//         const matches: ApiMatch[] = response.data.data;
//         await processApiData(matches);
//       } catch (error: any) {
//         console.error("Error polling API:", error.message);
//       }
//     });
//   } catch (error: any) {
//     console.error("Error starting polling:", error.message);
//     await mongoose.connection.close();
//     console.log("MongoDB connection closed");
//   }
// }
