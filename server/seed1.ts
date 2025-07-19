import mongoose from "mongoose";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Sport from "./src/models/sport.model";
import League from "./src/models/league.model";
import Team from "./src/models/team.model";
import Match, { MatchStatus } from "./src/models/match.model";
import User from "./src/models/user.model";
import Replay from "./src/models/replay.model";

// Định nghĩa interface cho dữ liệu API để dễ xử lý
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
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  streams: Array<{
    id: number;
    name: string;
    sourceType: string;
    sourceUrl: string;
    createdAt: string;
    updatedAt: string;
  }>;
  articleUrl: string;
  isHot: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hàm tạo slug từ tên
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

// Hàm ánh xạ trạng thái API sang MatchStatus enum
const mapStatus = (startTime: string): MatchStatus => {
  const now = new Date();
  const matchTime = new Date(startTime);
  if (matchTime > now) return MatchStatus.UPCOMING;
  if (
    matchTime < now &&
    now < new Date(matchTime.getTime() + 2 * 60 * 60 * 1000)
  ) {
    return MatchStatus.LIVE;
  }
  return MatchStatus.FINISHED;
};

// Hàm seed dữ liệu
const seedData = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(
      "mongodb+srv://tanquanga6k10:CpdAVLjkbtX5chAq@shopdientu.l5fgtvm.mongodb.net/hoiquantv?retryWrites=true&w=majority",
      {
        dbName: "hoiquantv",
      }
    );
    console.log("Connected to MongoDB");

    // Gọi API
    const response = await axios.get(
      "https://sv.bugiotv.xyz/internal/api/matches"
    );
    const matches: ApiMatch[] = response.data.data;

    // 1. Tạo Sport (mặc định là Football)
    let sport = await Sport.findOne({ slug: "football" });
    if (!sport) {
      sport = await Sport.create({
        name: "Football",
        slug: "football",
        icon: "http://localhost:8080/static/1750393380140-735399985.png",
        order: 1,
      });
      console.log("Created Sport: Football");
    }

    // 2. Tạo Users (Commentators)
    const commentators = new Set(
      matches
        .filter((match) => match.commentator)
        .map((match) => ({
          id: match.commentator.id,
          username: match.commentator.username,
          nickname: match.commentator.nickname,
          gender: match.commentator.gender,
          avatar: match.commentator.avatarUrl,
          password: match.commentator.password,
          createdAt: match.commentator.createdAt,
          updatedAt: match.commentator.updatedAt,
        }))
    );

    for (const commentator of commentators) {
      let user = await User.findOne({ username: commentator.username });
      if (!user) {
        user = await User.create({
          typeLogin: "phone",
          id: commentator.id.toString(),
          tokenLogin: "",
          username: commentator.username,
          firstname: commentator.nickname.split(" ").slice(0, -1).join(" "),
          lastname: commentator.nickname.split(" ").pop(),
          phone: "",
          password: commentator.password, // Mật khẩu đã được mã hóa từ API
          refreshToken: "",
          avatar: commentator.avatar,
          role: "COMMENTATOR",
          level: 0,
          address: "",
          gender: commentator.gender,
          createdAt: new Date(commentator.createdAt),
          updatedAt: new Date(commentator.updatedAt),
        });
        console.log(`Created User: ${commentator.username}`);
      }
    }

    // 3. Tạo Leagues
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
          sport: sport._id,
        });
        console.log(`Created League: ${leagueData.name}`);
      }
    }

    // 4. Tạo Teams
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
          sport: sport._id,
        });
        console.log(`Created Team: ${teamData.name}`);
      }
    }

    // 5. Tạo Matches
    for (const matchData of matches) {
      const league = await League.findOne({
        slug: createSlug(matchData.tournamentName),
      });
      const homeTeam = await Team.findOne({
        slug: createSlug(matchData.homeClub.name),
      });
      const awayTeam = await Team.findOne({
        slug: createSlug(matchData.awayClub.name),
      });
      const commentator = await User.findOne({
        username: matchData.commentator?.username,
      });

      let match = await Match.findOne({ slug: matchData.slug });
      if (!match) {
        match = await Match.create({
          title: matchData.title,
          slug: matchData.slug,
          homeTeam: homeTeam?._id,
          awayTeam: awayTeam?._id,
          league: league?._id,
          sport: sport._id,
          startTime: new Date(matchData.startTime),
          status: mapStatus(matchData.startTime),
          scores: {
            homeScore: 0,
            awayScore: 0,
          },
          streamLinks: matchData.streams.map((stream) => ({
            label: stream.name,
            url: stream.sourceUrl,
            image: `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`,
            commentator: commentator?._id,
            commentatorImage: commentator?.avatar,
            priority: 1,
          })),
          isHot: matchData.isHot,
        });
        console.log(`Created Match: ${matchData.title}`);
      } else {
        match.status = mapStatus(matchData.startTime);
        match.streamLinks = matchData?.streams?.map((stream) => ({
          label: stream.name,
          url: stream.sourceUrl,
          image: `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`,
          commentator: commentator?._id as mongoose.Types.ObjectId | undefined,
          commentatorImage: commentator?.avatar,
          priority: 1,
        }));
        match.isHot = matchData.isHot;
        await match.save();
        console.log(`Updated Match: ${matchData.title}`);
      }

      // 6. Tạo Replay (giả lập dữ liệu replay cho mỗi match)
      let replay = await Replay.findOne({ slug: `${matchData.slug}-replay` });
      if (!replay) {
        replay = await Replay.create({
          title: `${matchData.title} - Replay`,
          slug: `${matchData.slug}-replay`,
          description: `Replay of the match between ${matchData.homeClub.name} and ${matchData.awayClub.name}`,
          videoUrl: `https://example.com/replays/${matchData.slug}.mp4`,
          thumbnail: `https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/gjam3n7jvltkpo5wxktb.webp`,
          match: match._id,
          sport: sport._id,
          commentator: matchData.commentator?.nickname,
          views: 0,
          duration: 7200, // Giả lập thời lượng 2 giờ
          publishDate: new Date(matchData.startTime),
          isShown: true,
        });
        console.log(`Created Replay: ${matchData.title} - Replay`);
      }
    }

    console.log("Seeding completed!");
  } catch (error: any) {
    console.error("Error seeding data:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Chạy hàm seed
seedData();
