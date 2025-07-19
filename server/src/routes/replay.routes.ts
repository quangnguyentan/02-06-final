import { Router } from "express";
import {
  createReplay,
  deleteReplay,
  getAllReplays,
  getReplayById,
  getReplayBySlug,
  updateReplay,
} from "../controllers/replay.controller";

const router = Router();

router.route("/").post(createReplay).get(getAllReplays);
router.route("/getReplay/:slug").get(getReplayBySlug);
router.route("/:id").get(getReplayById).put(updateReplay).delete(deleteReplay);

export default router;
