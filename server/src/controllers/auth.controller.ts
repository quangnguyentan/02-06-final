import { Request, Response } from "express";
import User from "../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../middlewares/jwt";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { splitName } from "../utils/helper";
import path from "path";
import { configURL } from "../configs/configURL";
dotenv.config();
//method post = path(delele, post, put,get )
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password, typeLogin, username, role } = req.body;
    const avatarFile = req.file;
    if (!phone || !password || !username) {
      res.status(400).json({
        success: false,
        mes: "Missing inputs",
      });
      return;
    }
    const { firstName, lastName } = splitName(username);
    if (typeLogin === "phone" && !password) {
      res.status(400).json({
        success: false,
        mes: "Password is required for phone login",
      });
      return;
    }
    const existingUser = await User.findOne({ phone, typeLogin });
    if (existingUser) {
      res.status(409).json({
        err: 0,
        msg: "Số điện thoại đã được đăng ký",
      });
      return;
    }
    let logoUrl: string | undefined;
    if (avatarFile) {
      logoUrl = `${configURL.baseURL}/images/${path.basename(avatarFile.path)}`;
    }

    const newUser = await User.create({
      ...req.body,
      firstname: firstName,
      lastname: lastName,
      avatar: logoUrl,
    });
    await newUser.save();
    res.status(200).json({
      success: newUser ? true : false,
      newUser,
      mes: newUser
        ? "Register is successfully. Please go login~"
        : "Something went wrong",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    res.status(400).json({
      success: false,
      mes: "Missing inputs",
    });
    return;
  }
  // plain object
  const response = await User.findOne({ phone });
  if (response && (await response.isCorrectPassword(password))) {
    // Tách password và role ra khỏi response
    const { password, role, refreshToken, ...userData } = response.toObject();

    // Tạo access token
    const accessToken = generateAccessToken(response._id, role);
    // Tạo refresh token
    const newRefreshToken = generateRefreshToken(response._id);
    // Lưu refresh token vào database
    await User.findByIdAndUpdate(
      response._id,
      { refreshToken: newRefreshToken },
      { new: true }
    );
    // Lưu refresh token vào cookie
    res.cookie("refreshToken", newRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      path: "/",
    });
    res.status(200).json({
      success: true,
      accessToken,
      role,
      userData,
    });
  } else {
    res.status(400).json({
      err: 0,
      msg: "Số điện thoại hoặc mật khẩu không đúng",
    });
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    res.status(401).json({ success: false, msg: "No refresh token" });
    return;
  }
  let payload: JwtPayload;
  try {
    payload = jwt.verify(
      cookie.refreshToken,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      // refresh token đã hết hạn → clear cookie + báo lỗi
      res.clearCookie("refreshToken", { path: "/" });
      res.status(401).json({ success: false, msg: "Refresh token expired" });
      return;
    }
    // các lỗi khác
    res.status(401).json({ success: false, msg: "Invalid refresh token" });
    return;
  }
  const user = await User.findOne({
    _id: payload._id,
    refreshToken: cookie?.refreshToken,
  });
  if (!user) {
    res.status(401).json({ success: false, msg: "Token không khớp" });
    return;
  }
  const newAccessToken = generateAccessToken(user._id, user.role as string);
  res.status(200).json({ success: true, newAccessToken });
};

export const loginSuccess = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id, tokenLogin } = req?.body;
  try {
    if (!id || !tokenLogin) {
      res.status(400).json({
        err: 1,
        msg: "missing input",
      });
    }
    const newTokenLogin = uuidv4();
    let response = await User.findOne({
      id,
      tokenLogin,
    });
    console.log(response);
    const token =
      response &&
      jwt.sign(
        {
          id: response.id,
          email: response.email,
          _id: response._id,
          role: response.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "5d" }
      );
    if (response) {
      await User.updateOne(
        {
          id: response?.id,
        },
        {
          $set: {
            tokenLogin: newTokenLogin,
          },
        }
      );
    }
    res.status(200).json({
      err: token ? 0 : 3,
      msg: token ? "OK" : "User not found",
      token,
      role: response?.role,
    });
  } catch (error) {
    res.status(500).json({
      err: -1,
      msg: "Failed at auth controller" + error,
    });
  }
};

export const loginSuccessMobile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.body;

  try {
    if (!id) {
      res.status(400).json({
        err: 1,
        msg: "missing input",
      });
      return;
    }

    // ✅ Tìm user chỉ theo ID
    const user = await User.findOne({ id });

    if (!user) {
      res.status(404).json({
        err: 3,
        msg: "User not found",
        token: null,
      });
      return;
    }

    // ✅ Sau khi login thành công mới cập nhật tokenLogin
    const newTokenLogin = uuidv4();
    await User.updateOne({ id }, { $set: { tokenLogin: newTokenLogin } });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        _id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "5d" }
    );

    res.status(200).json({
      err: 0,
      msg: "OK",
      token,
      role: user.role,
      firstname: user.firstname,
      lastname: user.lastname,
      avatar: user.avatar,
      email: user.email,
      address: user.address,
      gender: user.gender,
    });
  } catch (error) {
    res.status(500).json({
      err: -1,
      msg: "Failed at auth controller: " + error,
    });
  }
};
