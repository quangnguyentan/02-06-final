import { Router } from "express";
import {
  createLeague,
  deleteLeague,
  getAllLeagues,
  getLeagueById,
  updateLeague,
} from "../controllers/league.controller";
import { upload } from "../middlewares/multer";
const router = Router();

router.route("/").post(upload.single("logo"), createLeague).get(getAllLeagues);

router
  .route("/:id")
  .get(getLeagueById)
  .put(upload.single("logo"), updateLeague)
  .delete(deleteLeague);

export default router;
