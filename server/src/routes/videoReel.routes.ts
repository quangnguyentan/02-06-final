import { Router } from "express";
import {

    createVideoReel,
    getAllVideoReels,
    getVideoReelsBySportSlug,
    getVideoReelById,
    getVideoReelBySlug,
    updateVideoReel,
    deleteVideoReel,
} from "../controllers/videoReel.controller";

const router = Router();
// VideoReels routes
router.post("/video-reels", createVideoReel);
router.get("/video-reels", getAllVideoReels);
router.get("/video-reels/sport/:sportSlug", getVideoReelsBySportSlug);
router.get("/video-reels/:id", getVideoReelById);
router.get("/video-reels/slug/:slug", getVideoReelBySlug);
router.put("/video-reels/:id", updateVideoReel);
router.delete("/video-reels/:id", deleteVideoReel);

export default router;