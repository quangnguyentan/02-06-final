import { Router } from "express";
import {
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
} from "../controllers/team.controller";
import { upload } from "../middlewares/multer";
const router = Router();

router.route("/").post(upload.single("logo"), createTeam).get(getAllTeams);

router
  .route("/:id")
  .get(getTeamById)
  .put(upload.single("logo"), updateTeam)
  .delete(deleteTeam);

export default router;
