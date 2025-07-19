import { Application } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import sportRoutes from "./sport.routes";
import teamRoutes from "./team.routes";
import leagueRoutes from "./league.routes";
import replayRoutes from "./replay.routes";
import matchRoutes from "./match.routes";
import bannerRoutes from "./banner.routes"
import videoReelRoutes from "./videoReel.routes"
export const initRoutes = (app: Application) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/sports", sportRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/leagues", leagueRoutes);
  app.use("/api/replays", replayRoutes);
  app.use("/api/matches", matchRoutes);
  app.use("/api", bannerRoutes);
  app.use("/api", videoReelRoutes);
};
