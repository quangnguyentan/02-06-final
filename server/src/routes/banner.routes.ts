import { Router } from "express";
import {
    createBanner,
    getAllBanners,
    getBannersByDisplayPage,
    getBannerById,
    updateBanner,
    deleteBanner,
} from "../controllers/banner.controller";

const router = Router();

// Banner routes
router.post("/banners", createBanner);
router.get("/banners", getAllBanners);
router.get("/banners/display/:displayPage", getBannersByDisplayPage);
router.get("/banners/:id", getBannerById);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);
export default router;