import { Router } from "express";
import {
  createSport,
  getAllSports,
  getSportById,
  updateSport,
  deleteSport,
} from "../controllers/sport.controller";
import { upload } from "../middlewares/multer";
const router = Router();

router.route("/").post(upload.single("icon"), createSport).get(getAllSports);

router
  .route("/:id")
  .get(getSportById)
  .put(upload.single("icon"), updateSport)
  .delete(deleteSport);

export default router;
