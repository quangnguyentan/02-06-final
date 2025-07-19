import { Router } from "express";
import multer from 'multer'
import { deleteUser, forgotPassword, getCurrent, getUser, getUsers, logout, resetPassword, updateProfileOrPassword, updateUser } from "../controllers/user.controller";

import { verifyAccessToken } from "../middlewares/verifyToken";
const router = Router();
const storage = multer.memoryStorage()
const upload = multer({ storage })
import { upload as uploadImage } from "../middlewares/multer";

router.get("/current", verifyAccessToken, getCurrent);
router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/logout", logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put(
    "/profile",
    verifyAccessToken,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    updateProfileOrPassword
);
router.put("/:id", verifyAccessToken, uploadImage.single("avatar"), updateUser);
router.delete("/:id", verifyAccessToken, deleteUser);

export default router;