// SelectedPageProvider.tsx
import { ReactNode, useState } from "react";
import { SelectedPageContext } from "@/hooks/use-context";
import { Sport } from "@/types/sport.types";
import { Match } from "@/types/match.types";
import { Team } from "@/types/team.types";
import { Replay } from "@/types/replay.types";
import { League } from "@/types/league.types";
import { User } from "@/types/user.types";
import { VideoReels } from "@/types/videoReel.type";
import { Banner } from "@/types/banner.types";

export const SelectedPageProvider = ({
  children,
  initialPage = "Người dùng",
  inititalSportsNavbarPage = "eSports",
}: {
  children: ReactNode;
  initialPage?: string;
  inititalSportsNavbarPage?: string;
}) => {
  const [selectedPage, setSelectedPage] = useState(initialPage);
  const [selectedSportsNavbarPage, setSelectedSportsNavbarPage] = useState(
    inititalSportsNavbarPage
  );

  // User
  const [user, setUser] = useState<User[]>([]);
  const addUser = (newUser: User) => {
    setUser((prev) => [newUser, ...prev]);
  };
  // Sport
  const [sports, setSports] = useState<Sport[]>([]);
  const addSport = (newSport: Sport) => {
    setSports((prev) => [newSport, ...prev]);
  };

  // Match
  const [match, setMatch] = useState<Match[]>([]);
  const addMatch = (newMatch: Match) => {
    setMatch((prev) => [newMatch, ...prev]);
  };

  // Team
  const [team, setTeam] = useState<Team[]>([]);
  const addTeam = (newTeam: Team) => {
    setTeam((prev) => [newTeam, ...prev]);
  };

  // Replay
  const [replay, setReplay] = useState<Replay[]>([]);
  const addReplay = (newReplay: Replay) => {
    setReplay((prev) => [newReplay, ...prev]);
  };

  // League
  const [league, setLeague] = useState<League[]>([]);
  const addLeague = (newLeague: League) => {
    setLeague((prev) => [newLeague, ...prev]);
  };
  const [videoReel, setVideoReel] = useState<VideoReels[]>([]);
  const addVideoReel = (newVideoReel: VideoReels) => {
    setVideoReel((prev) => [newVideoReel, ...prev]);
  };
  const [banner, setBanner] = useState<Banner[]>([]);
  const addBanner = (newBanner: Banner) => {
    setBanner((prev) => [newBanner, ...prev]);
  };
  return (
    <SelectedPageContext.Provider
      value={{
        user,
        setUser,
        addUser,
        selectedPage,
        setSelectedPage,
        selectedSportsNavbarPage,
        setSelectedSportsNavbarPage,
        sports,
        setSports,
        addSport,
        match,
        setMatch,
        addMatch,
        team,
        setTeam,
        addTeam,
        replay,
        setReplay,
        addReplay,
        league,
        setLeague,
        addLeague,
        banner,
        addBanner,
        setBanner,
        videoReel,
        setVideoReel,
        addVideoReel,
      }}
    >
      {children}
    </SelectedPageContext.Provider>
  );
};
