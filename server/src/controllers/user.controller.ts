import { Request, Response } from "express";
import cloudinary from "../configs/cloudinary";
import User, { IUser } from "../models/user.model";
import crypto from "crypto";
import dotenv from "dotenv";
import sendMail from "../utils/sendMail";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { splitName } from "../utils/helper";
import path from "path";
import { configURL } from "../configs/configURL";

dotenv.config();
interface FileUploadResult {
  url: string;
  id: string;
}
export const getCurrent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req?.user?._id;
  const user = await User.findById(userId).select(
    "-refreshToken -password -role"
  );
  res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "User not found",
  });
};
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await User.find();
  res.status(200).json({
    success: users ? true : false,
    rs: users ? users : "Users not found",
  });
};
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "User not found",
  });
};
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { phone, password, typeLogin, username, role } = req.body;
  const avatarFile = req.file;
  if (!id) throw new Error("Missing exercise id");
  const { firstName, lastName } = splitName(username);
  let logoUrl: string | undefined;
  if (avatarFile) {
    logoUrl = `${configURL.baseURL}/images/${path.basename(avatarFile.path)}`;
  }

  const user = await User.findByIdAndUpdate(
    id,
    {
      ...req?.body,
      firstname: firstName,
      lastname: lastName,
      avatar: logoUrl,
    },
    { new: true }
  );
  res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "User not found",
  });
};
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new Error("Missing exercise id");
  const user = await User.findByIdAndDelete(id);
  res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "Exercise not found",
  });
};
export const logout = async (req: Request, res: Response): Promise<void> => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken) {
    res
      .status(400)
      .json({ success: false, msg: "No refresh token in cookies" });
    return;
  }
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // chỉ secure trên production
    sameSite: "strict",
    path: "/", // phải khớp với path khi set cookie
  });
  res.status(200).json({
    success: true,
    mes: "Logout successful",
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  console.log(email);
  if (!email) throw new Error("Missing email");

  const user = ((await User.findOne({ email })) as IUser) ?? null;
  console.log(user);
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = user.createPasswordChangedToken(); // raw token
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
        <p>Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.</p>
        <p>Link này sẽ hết hạn sau 15 phút kể từ bây giờ.</p>
        <a href="${resetUrl}">Click here</a>
    `;

  const data = {
    email,
    html,
  };

  const rs = await sendMail(data);

  res.status(200).json({
    success: true,
    rs,
  });
};
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { password, token } = req.body;

  if (!password || !token) {
    throw new Error("Missing inputs");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = (await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })) as IUser | null;

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  user.password = password; // sẽ được hash lại trong pre-save hook
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date().toISOString();

  await user.save();

  res.status(200).json({
    success: true,
    mes: "Updated password",
  });
};

export const updateProfileOrPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req?.user?._id;
  if (!userId) {
    res.status(400).json({ success: false, rs: "User ID is missing" });
    return;
  }

  const {
    firstname,
    lastname,
    address,
    gender,
    password,
    phone,
    currentPassword,
  } = req.body;
  const files = req?.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  try {
    let user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, rs: "User not found" });
      return;
    }

    // Kiểm tra mật khẩu cũ nếu muốn đổi mật khẩu
    if (password) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          rs: "Current password is required to change password",
        });
        return;
      }

      const isValid = await user.isCorrectPassword(currentPassword);
      if (!isValid) {
        res
          .status(401)
          .json({ success: false, rs: "Current password is incorrect" });
        return;
      }

      user.password = password;
      user.passwordChangedAt = new Date().toISOString();
    }

    // Cập nhật các trường khác
    user.firstname = firstname ?? user.firstname;
    user.lastname = lastname ?? user.lastname;
    user.address = address ?? user.address;
    user.gender = gender ?? user.gender;
    user.phone = phone ?? user.phone;
    user.username =
      firstname && lastname
        ? `${firstname} ${lastname}`
        : user.username ?? `${user.firstname} ${user.lastname}`;
    // Xử lý avatar nếu có
    if (files && files["avatar"]?.length > 0) {
      const imageFile = files["avatar"][0];
      const resizedBuffer = await sharp(imageFile.buffer)
        .resize({ width: 300 })
        .toBuffer();

      const uploadResult = await new Promise<FileUploadResult>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { resource_type: "image", upload_preset: "speak-up" },
              (error, result) => {
                if (error || !result?.secure_url)
                  return reject(error || new Error("Upload failed"));
                resolve({ url: result.secure_url, id: result.public_id });
              }
            )
            .end(resizedBuffer);
        }
      );

      user.avatar = uploadResult.url;
    }

    // Lưu lại user
    await user.save();

    const updatedUser = await User.findById(userId)
      .select("-password -refreshToken -role")
      .lean();

    res.status(200).json({
      success: true,
      rs: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile or password:", error);
    res.status(500).json({
      success: false,
      rs: `Error updating profile or password: ${error}`,
    });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      phone,
      password,
      username,
      firstname,
      lastname,
      typeLogin,
      role,
      level,
      total_score,
      address,
      gender,
      enrolledCoursesCount,
      avatar,
      id,
      tokenLogin,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (
      !password ||
      !username ||
      !firstname ||
      !lastname ||
      !typeLogin ||
      !role ||
      level === undefined ||
      total_score === undefined ||
      !gender ||
      enrolledCoursesCount === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    // Validate typeLogin
    if (!["phone", "google", "facebook"].includes(typeLogin)) {
      res.status(400).json({
        success: false,
        message: "Invalid login type",
      });
      return;
    }

    // Validate role
    if (!["USER", "ADMIN"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role",
      });
      return;
    }

    // Validate gender
    if (!["MALE", "FEMALE", "OTHER"].includes(gender)) {
      res.status(400).json({
        success: false,
        message: "Invalid gender",
      });
      return;
    }

    // Validate phoneNumber nếu có
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
      return;
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ phone });
    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: "Phone already exists",
      });
      return;
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(409).json({
        success: false,
        message: "Username already exists",
      });
      return;
    }

    // Tạo user mới
    const newUser: Partial<IUser> = {
      id: id ?? uuidv4(), // Sử dụng id từ client hoặc tạo mới
      tokenLogin: tokenLogin ?? uuidv4(), // Sử dụng tokenLogin từ client hoặc tạo mới
      phone,
      password, // Sẽ được hash trong pre-save hook
      username,
      firstname,
      lastname,
      typeLogin,
      role,
      level: Number(level) || 0,
      address: address ?? "",
      gender,
      avatar: avatar ?? "",
      refreshToken: "", // Default
    };

    const user = await User.create(newUser);

    // Loại bỏ các trường nhạy cảm trước khi trả về
    const userResponse: Partial<IUser> = {
      _id: user._id,
      id: user.id,
      tokenLogin: user.tokenLogin,
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      typeLogin: user.typeLogin,
      role: user.role,
      level: user.level,
      address: user.address,
      gender: user.gender,
      phone: user.phone,
      avatar: user.avatar,
    };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
