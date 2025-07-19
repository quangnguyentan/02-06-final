import { Router } from "express";
import {
  createMatch,
  deleteMatch,
  getAllMatches,
  getMatchById,
  getMatchBySlug,
  updateMatch,
} from "../controllers/match.controller";

const router = Router();

router.route("/").post(createMatch).get(getAllMatches);
router.route("/getMatch/:slug").get(getMatchBySlug);
router.route("/:id").get(getMatchById).put(updateMatch).delete(deleteMatch);

export default router;
