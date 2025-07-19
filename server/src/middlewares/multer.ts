import multer from "multer";
import path from "path";
import fs from "fs/promises";

// const uploadDir = path.join(__dirname, "../../assets/images");
// const uploadDir = path.join("./assets/images");
const uploadDir = path.join("./public/images");
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error("Error creating upload directory:", err);
  }
};
ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "video/mp4",
    "video/mov",
    "video/avi",
  ];
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".mp4",
    ".mov",
    ".avi",
  ];

  const isValidMimetype = allowedTypes.includes(file.mimetype);
  const isValidExtension = allowedExtensions.includes(
    path.extname(file.originalname).toLowerCase()
  );

  if (isValidMimetype && isValidExtension) {
    cb(null, true);
  } else {
    const errorMessage =
      file.fieldname === "thumbnail"
        ? "Chỉ chấp nhận file ảnh (.jpg, .jpeg, .png, .gif, .bmp, .webp)"
        : "Chỉ chấp nhận file video (.mp4, .mov, .avi)";
    cb(new Error(errorMessage));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for all files
});
