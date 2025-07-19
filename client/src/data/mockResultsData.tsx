import {
  DateTabInfo,
  LeagueSchedule,
  Match,
  MatchStatusType,
} from "@/types/match.types";
import {
  GlobeAltIcon,
  ShieldCheckIcon,
  FootballIcon,
} from "@/components/layout/Icon";
import * as React from "react";

// Set today to current system time (dynamic)
const today = new Date();

export const formatDate = (date: Date, offsetDays: number = 0): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatSuffix = (date: Date, offsetDays: number = 0): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + offsetDays);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${month}`; // e.g., 17/06
};

export const dayOfWeekLabel = (date: Date): string => {
  const d = new Date(date);
  if (d.toDateString() === today.toDateString()) return "Hôm Nay";
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[d.getDay()];
};

// Mock matches for past results (including a live match for today)
export const mockPastMatches: Match[] = [
  {
    _id: "m1",
    title: "Việt Nam vs Thái Lan",
    slug: "vietnam-vs-thailand",
    homeTeam: {
      _id: "t1",
      name: "Việt Nam",
      logo: "https://via.placeholder.com/32/FF0000/FFFFFF?text=VN",
    },
    awayTeam: {
      _id: "t2",
      name: "Thái Lan",
      logo: "https://via.placeholder.com/32/0000FF/FFFFFF?text=TH",
    },
    league: {
      _id: "l1",
      name: "Giao hữu",
    },
    sport: {
      _id: "s1",
      name: "Football",
      slug: "football",
    },
    startTime: new Date(formatDate(today, -2)), // 2 days ago
    status: MatchStatusType.FINISHED,
    scores: {
      homeScore: 2,
      awayScore: 1,
    },
    streamLinks: [
      {
        url: "https://example.com/stream1",
        label: "HD Stream",
        commentator: "BLV Anh Ngọc",
        commentatorImage:
          "https://via.placeholder.com/24/4A5568/E2E8F0?text=AN",
        priority: 1,
      },
    ],
    isHot: true,
  },
  {
    _id: "m2",
    title: "Hà Nội FC vs TP.HCM FC",
    slug: "hanoi-fc-vs-tphcm-fc",
    homeTeam: {
      _id: "t3",
      name: "Hà Nội FC",
      logo: "https://via.placeholder.com/32/FFD700/000000?text=HN",
    },
    awayTeam: {
      _id: "t4",
      name: "TP.HCM FC",
      logo: "https://via.placeholder.com/32/FF4500/FFFFFF?text=HCM",
    },
    league: {
      _id: "l2",
      name: "VLeague2",
    },
    sport: {
      _id: "s1",
      name: "Football",
      slug: "football",
    },
    startTime: new Date(formatDate(today, -1)), // Yesterday
    status: MatchStatusType.FINISHED,
    scores: {
      homeScore: 3,
      awayScore: 0,
    },
    streamLinks: [],
    isHot: false,
  },
  {
    _id: "m3",
    title: "Khánh Hòa vs PVF-CAND",
    slug: "khanh-hoa-vs-pvf-cand",
    homeTeam: {
      _id: "t5",
      name: "Khánh Hòa",
      logo: "https://via.placeholder.com/32/00FF00/000000?text=KH",
    },
    awayTeam: {
      _id: "t6",
      name: "PVF-CAND",
      logo: "https://via.placeholder.com/32/FF00FF/000000?text=PV",
    },
    league: {
      _id: "l2",
      name: "VLeague2",
    },
    sport: {
      _id: "s1",
      name: "Football",
      slug: "football",
    },
    startTime: new Date("2025-06-17T14:00:00+07:00"), // Current time, 17/06/2025
    status: MatchStatusType.LIVE,
    scores: {
      homeScore: 1,
      awayScore: 0,
    },
    streamLinks: [
      {
        url: "https://example.com/live",
        label: "Live Stream",
        commentator: "Moon Knight",
        commentatorImage:
          "https://via.placeholder.com/24/4A5568/E2E8F0?text=MK",
        priority: 1,
      },
    ],
    isHot: true,
  },
  {
    _id: "m4",
    title: "Live Match Today",
    slug: "live-match-today",
    homeTeam: {
      _id: "t7",
      name: "Team X",
      logo: "https://via.placeholder.com/32/00FF00/000000?text=TX",
    },
    awayTeam: {
      _id: "t8",
      name: "Team Y",
      logo: "https://via.placeholder.com/32/FF00FF/000000?text=TY",
    },
    league: {
      _id: "l3",
      name: "Premier League",
    },
    sport: {
      _id: "s1",
      name: "Football",
      slug: "football",
    },
    startTime: new Date(), // Current time, 17/06/2025
    status: MatchStatusType.LIVE,
    scores: {
      homeScore: 1,
      awayScore: 1,
    },
    streamLinks: [
      {
        url: "https://example.com/live",
        label: "Live Stream",
        commentator: "BLV Minh Đức",
        commentatorImage:
          "https://via.placeholder.com/24/4A5568/E2E8F0?text=MD",
        priority: 1,
      },
    ],
    isHot: true,
  },
];

// Generate fixed 7-day tabs including "Live" and "Hôm Nay"
export const generateFixedDateTabs = (matches: Match[]): DateTabInfo[] => {
  const tabs: DateTabInfo[] = [];
  const liveMatches = matches?.filter(
    (match) => match.status === MatchStatusType.LIVE
  );
  const liveCount = liveMatches?.length;

  // Add "Live" tab
  tabs.push({
    id: "live",
    label: "Live",
    dateSuffix: liveCount > 0 ? `(${liveCount})` : "",
    isToday: false,
    hasLive: true,
  });

  // Add 7 days (today and 6 days back)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateId = formatDate(date);
    const hasMatches = matches?.some(
      (match) =>
        formatDate(new Date(match.startTime ?? "")) === dateId &&
        (match.status === MatchStatusType.FINISHED ||
          match.status === MatchStatusType.LIVE)
    );
    tabs.push({
      id: dateId,
      label: dayOfWeekLabel(date),
      dateSuffix: formatSuffix(date),
      isToday: date.toDateString() === today.toDateString(),
      hasLive: matches.some(
        (match) =>
          formatDate(new Date(match.startTime ?? "")) === dateId &&
          match.status === MatchStatusType.LIVE
      ),
    });
  }

  return tabs.reverse(); // Reverse to show newest first (today on the right)
};

// Transform matches to results data
const transformMatchesToResults = (
  matches: Match[]
): { [dateId: string]: LeagueSchedule[] } => {
  const resultsByDate: { [dateId: string]: LeagueSchedule[] } = {};
  const validMatches = Array.isArray(matches) ? matches : [];

  validMatches.forEach((match) => {
    // Include both FINISHED and LIVE matches
    if (
      match.status !== MatchStatusType.FINISHED &&
      match.status !== MatchStatusType.LIVE
    )
      return;

    // Handle "Live" tab separately
    if (match.status === MatchStatusType.LIVE) {
      const leagueId = match.league?._id || match.league?.name || "live_league";
      const leagueName = match.league?.name || "Live Matches";
      const liveIcon = React.createElement(FootballIcon, {
        className: "w-5 h-5 text-red-500",
      });

      if (!resultsByDate["live"]) {
        resultsByDate["live"] = [];
      }

      const liveLeagueSchedule = resultsByDate["live"].find(
        (ls) => ls.id === leagueId
      );
      const matchData: Match = {
        _id: match._id || `m_${Date.now()}`,
        title:
          match.title || `${match.homeTeam?.name} vs ${match.awayTeam?.name}`,
        slug: match.slug || `${match._id || Date.now()}`,
        homeTeam: {
          _id: match.homeTeam?._id,
          name: match.homeTeam?.name || "Unknown",
          logo:
            match.homeTeam?.logo ||
            "https://via.placeholder.com/32/CCCCCC/000000?text=UK",
        },
        awayTeam: {
          _id: match.awayTeam?._id,
          name: match.awayTeam?.name || "Unknown",
          logo:
            match.awayTeam?.logo ||
            "https://via.placeholder.com/32/CCCCCC/000000?text=UK",
        },
        league: match.league,
        sport: match.sport,
        startTime: match.startTime,
        status: match.status,
        scores: match.scores,
        streamLinks: match.streamLinks,
        isHot: match.isHot,
      };

      if (liveLeagueSchedule) {
        liveLeagueSchedule.matches.push(matchData);
      } else {
        resultsByDate["live"].push({
          id: leagueId,
          name: leagueName,
          icon: liveIcon,
          matches: [matchData],
        });
      }
    }

    // Handle date-based results (FINISHED or LIVE)
    const dateId = formatDate(new Date(match.startTime || today));
    const leagueId =
      match.league?._id || match.league?.name || "unknown_league";
    const leagueName = match.league?.name || "Unknown League";
    const iconMap: { [key: string]: React.ReactNode } = {
      "Giao hữu": React.createElement(GlobeAltIcon, {
        className: "w-5 h-5 text-teal-300",
      }),
      VLeague2: React.createElement(ShieldCheckIcon, {
        className: "w-5 h-5 text-green-400",
      }),
      "Premier League": React.createElement(FootballIcon, {
        className: "w-5 h-5 text-purple-400",
      }),
    };
    const icon = iconMap[leagueName] || null;

    if (!resultsByDate[dateId]) {
      resultsByDate[dateId] = [];
    }

    const leagueSchedule = resultsByDate[dateId].find(
      (ls) => ls.id === leagueId
    );
    const matchData: Match = {
      _id: match._id || `m_${Date.now()}`,
      title:
        match.title || `${match.homeTeam?.name} vs ${match.awayTeam?.name}`,
      slug: match.slug || `${match._id || Date.now()}`,
      homeTeam: {
        _id: match.homeTeam?._id,
        name: match.homeTeam?.name || "Unknown",
        logo:
          match.homeTeam?.logo ||
          "https://via.placeholder.com/32/CCCCCC/000000?text=UK",
      },
      awayTeam: {
        _id: match.awayTeam?._id,
        name: match.awayTeam?.name || "Unknown",
        logo:
          match.awayTeam?.logo ||
          "https://via.placeholder.com/32/CCCCCC/000000?text=UK",
      },
      league: match.league,
      sport: match.sport,
      startTime: match.startTime,
      status: match.status,
      scores: match.scores,
      streamLinks: match.streamLinks,
      isHot: match.isHot,
    };

    if (leagueSchedule) {
      leagueSchedule.matches.push(matchData);
    } else {
      resultsByDate[dateId].push({
        id: leagueId,
        name: leagueName,
        icon,
        matches: [matchData],
      });
    }
  });

  return resultsByDate;
};

// Hook for results data
export const useScheduleDataForResults = (
  matches: Match[] = []
): {
  dateTabs: DateTabInfo[];
  scheduleData: { [dateId: string]: LeagueSchedule[] };
} => {
  const dateTabs = generateFixedDateTabs(matches);
  const scheduleData = transformMatchesToResults(matches);
  return { dateTabs, scheduleData };
};

export const mockDateTabsForResults = generateFixedDateTabs(mockPastMatches);
export const mockResultsData = transformMatchesToResults(mockPastMatches);
