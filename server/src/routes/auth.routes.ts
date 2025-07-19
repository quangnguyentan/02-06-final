import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import {
  login,
  loginSuccess,
  loginSuccessMobile,
  refreshAccessToken,
  register,
} from "../controllers/auth.controller";
import User from "../models/user.model";
const router = Router();
import { upload } from "../middlewares/multer";
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      (
        err: Error | null,
        user: Express.User | false | null,
        info: object | undefined
      ) => {
        if (err) return next(err);
        if (!user)
          return res.redirect(`${process.env.CLIENT_URL}/login-failure`);
        req.user = user as Express.User;
        next();
      }
    )(req, res, next);
  },
  async (req: Request, res: Response) => {
    const { id, tokenLogin, _id } = req.user || {};
    const userDB = await User.findOne({ id: _id });
    if (!userDB) {
      return res.redirect(`${process.env.CLIENT_URL}/login-failure`);
    }

    res.cookie("refreshToken", userDB.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      path: "/",
    });
    res.redirect(`${process.env.CLIENT_URL}/login-success/${id}/${tokenLogin}`);
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    session: false,
    scope: ["email"],
  })
);
router.get(
  "/facebook/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "facebook",
      (
        err: Error | null,
        user: Express.User | false | null,
        info: object | undefined
      ) => {
        if (err) return next(err);
        if (!user)
          return res.redirect(`${process.env.CLIENT_URL}/login-failure`);
        req.user = user as Express.User;
        next();
      }
    )(req, res, next);
  },
  async (req: Request, res: Response) => {
    const { id, tokenLogin, _id } = req.user || {};
    const userDB = await User.findOne({ id: _id });
    if (!userDB) {
      return res.redirect(`${process.env.CLIENT_URL}/login-failure`);
    }

    res.cookie("refreshToken", userDB.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      path: "/",
    });
    res.redirect(`${process.env.CLIENT_URL}/login-success/${id}/${tokenLogin}`);
  }
);
// auth.routes.ts
router.get(
  "/mobile/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/mobile/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      (
        err: Error | null,
        user: Express.User | false | null,
        info: object | undefined
      ) => {
        if (err) return next(err);
        if (!user)
          return res.redirect(
            `${process.env.MOBILE_REDIRECT_URL}/login-failure`
          );
        req.user = user as Express.User;
        next();
      }
    )(req, res, next);
  },
  async (req: Request, res: Response) => {
    const { id, tokenLogin, _id } = req.user || {};
    const userDB = await User.findOne({ id: _id });
    if (!userDB) {
      return res.redirect(`${process.env.MOBILE_REDIRECT_URL}/login-failure`);
    }

    // ⚠️ Trả về mobile deep link (ví dụ myapp://login-success/...)
    return res.redirect(
      `${process.env.MOBILE_REDIRECT_URL}/login-success/${id}/${tokenLogin}?refreshToken=${userDB.refreshToken}`
    );
  }
);

// Facebook Mobile
router.get(
  "/mobile/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
    session: false,
  })
);

router.get(
  "/mobile/facebook/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "facebook",
      (
        err: Error | null,
        user: Express.User | false | null,
        info: object | undefined
      ) => {
        if (err) return next(err);
        if (!user)
          return res.redirect(
            `${process.env.MOBILE_REDIRECT_URL}/login-failure`
          );
        req.user = user as Express.User;
        next();
      }
    )(req, res, next);
  },
  async (req: Request, res: Response) => {
    const { id, tokenLogin, _id } = req.user || {};
    const userDB = await User.findOne({ id: _id });
    if (!userDB) {
      return res.redirect(`${process.env.MOBILE_REDIRECT_URL}/login-failure`);
    }

    return res.redirect(
      `${process.env.MOBILE_REDIRECT_URL}/login-success/${id}/${tokenLogin}?refreshToken=${userDB.refreshToken}`
    );
  }
);
router.post("/login-success", loginSuccess);
router.post("/login-success-mobile", loginSuccessMobile);
router.post("/refreshToken", refreshAccessToken);

export default router;
