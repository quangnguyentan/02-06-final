import passport from "passport";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.model";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from "passport-google-oauth20";
import {
  Strategy as FacebookStrategy,
  Profile as FacebookProfile,
} from "passport-facebook";
import { VerifyCallback } from "passport-oauth2";
import dotenv from "dotenv";
import { generateRefreshToken } from "../middlewares/jwt";

dotenv.config();

export interface GoogleUserProfile extends GoogleProfile {
  _id: string;
  tokenLogin: string;
  role: string;
  email: string;
  avatar: string;
  username: string;
  firstname: string;
  lastname: string;
  typeLogin: string;
}

export interface FacebookUserProfile extends FacebookProfile {
  _id: string;
  tokenLogin: string;
  role: string;
  email: string;
  avatar: string;
  username: string;
  firstname: string;
  lastname: string;
  typeLogin: string;
}

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      cb: VerifyCallback
    ) => {
      const tokenLogin = uuidv4();
      const newRefreshToken = generateRefreshToken(profile.id);
      try {
        if (profile.id && profile.emails?.[0]?.value) {
          // Check if a user with the same email already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If user exists but doesn't have this Google ID, link the account
            if (!user.id || user.id !== profile.id) {
              user = await User.findOneAndUpdate(
                { email: profile.emails[0].value },
                {
                  $set: {
                    id: profile.id,
                    typeLogin: profile.provider,
                    tokenLogin,
                    refreshToken: newRefreshToken,
                    avatar: profile.photos?.[0]?.value || user.avatar,
                    username: profile.displayName || user.username,
                    firstname: profile.name?.givenName || user.firstname,
                    lastname: profile.name?.familyName || user.lastname,
                  },
                },
                { new: true }
              );
            } else {
              // Update tokenLogin and refreshToken if user exists with the same Google ID
              user = await User.findOneAndUpdate(
                { id: profile.id },
                { $set: { tokenLogin, refreshToken: newRefreshToken } },
                { new: true }
              );
            }
          } else {
            // Create a new user if no user exists with this email
            user = await User.create({
              id: profile.id,
              email: profile.emails[0].value,
              typeLogin: profile.provider,
              avatar: profile.photos?.[0]?.value,
              username: profile.displayName,
              firstname: profile.name?.givenName,
              lastname: profile.name?.familyName,
              tokenLogin,
              role: "USER",
              refreshToken: newRefreshToken,
            });
          }

          // Create custom user profile
          const profileWithToken: GoogleUserProfile = {
            ...profile,
            tokenLogin,
            id: profile.id,
            _id: profile.id,
            role: user?.role ?? "USER",
            email: profile.emails[0].value,
            avatar: profile.photos?.[0]?.value || "",
            username: profile.displayName || "",
            firstname: profile.name?.givenName || "",
            lastname: profile.name?.familyName || "",
            typeLogin: profile.provider,
          };

          return cb(null, profileWithToken);
        } else {
          return cb(new Error("Google profile ID or email not provided"));
        }
      } catch (error) {
        console.error(error);
        return cb(error);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["email", "photos", "id", "displayName"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: FacebookProfile,
      cb: VerifyCallback
    ) => {
      const tokenLogin = uuidv4();
      const newRefreshToken = generateRefreshToken(profile.id);
      try {
        if (profile.id && profile.emails?.[0]?.value) {
          // Check if a user with the same email already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If user exists but doesn't have this Facebook ID, link the account
            if (!user.id || user.id !== profile.id) {
              user = await User.findOneAndUpdate(
                { email: profile.emails[0].value },
                {
                  $set: {
                    id: profile.id,
                    typeLogin: profile.provider,
                    tokenLogin,
                    refreshToken: newRefreshToken,
                    avatar: profile.photos?.[0]?.value || user.avatar,
                    username: profile.displayName || user.username,
                    firstname: profile.name?.givenName || user.firstname,
                    lastname: profile.name?.familyName || user.lastname,
                  },
                },
                { new: true }
              );
            } else {
              // Update tokenLogin and refreshToken if user exists with the same Facebook ID
              user = await User.findOneAndUpdate(
                { id: profile.id },
                { $set: { tokenLogin, refreshToken: newRefreshToken } },
                { new: true }
              );
            }
          } else {
            // Create a new user if no user exists with this email
            user = await User.create({
              id: profile.id,
              email: profile.emails[0].value,
              typeLogin: profile.provider,
              avatar: profile.photos?.[0]?.value,
              username: profile.displayName,
              firstname: profile.name?.givenName,
              lastname: profile.name?.familyName,
              tokenLogin,
              role: "USER",
              refreshToken: newRefreshToken,
            });
          }

          // Create custom user profile
          const profileWithToken: FacebookUserProfile = {
            ...profile,
            tokenLogin,
            id: profile.id,
            _id: profile.id,
            role: user?.role ?? "USER",
            email: profile.emails[0].value,
            avatar: profile.photos?.[0]?.value || "",
            username: profile.displayName || "",
            firstname: profile.name?.givenName || "",
            lastname: profile.name?.familyName || "",
            typeLogin: profile.provider,
          };

          return cb(null, profileWithToken);
        } else {
          return cb(new Error("Facebook profile ID or email not provided"));
        }
      } catch (error) {
        console.error(error);
        return cb(error);
      }
    }
  )
);
