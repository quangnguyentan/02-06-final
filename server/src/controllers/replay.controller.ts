import { Request, RequestHandler, Response } from "express";
import Replay, { IReplay } from "../models/replay.model";
import Match from "../models/match.model";
import Sport from "../models/sport.model";
import { upload } from "../middlewares/multer";
import fs from "fs/promises";
import path from "path";
import { configURL } from "../configs/configURL";

// REMEMBER: Your global type definition in src/types/express.d.ts is crucial for this to work.
// Ensure it contains:
/*
declare namespace Express {
  interface Request {
    files?: {
      videoUrl?: Multer.File[];
      thumbnail?: Multer.File[];
      // ... ensure all other fields from match.controller are also here if applicable
      // Example:
      // streamLinkImages?: Multer.File[];
      // streamLinkVideos?: Multer.File[];
      // streamLinkCommentatorImages?: Multer.File[];
      // mainCommentatorImage?: Multer.File[];
      // secondaryCommentatorImage?: Multer.File[];
    };
  }
}
*/

// Middleware to handle file uploads
export const uploadFiles = upload.fields([
  { name: "videoUrl", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

// @desc    Create a new replay video
// @route   POST /api/replays
export const createReplay: RequestHandler[] = [
  uploadFiles,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body;
      const files = req.files as
        | {
            videoUrl?: Express.Multer.File[];
            thumbnail?: Express.Multer.File[];
          }
        | undefined;

      // Validate match and sport
      const matchExists = await Match.findById(body.match);
      if (!matchExists) {
        res.status(400).json({ message: "ID trận đấu không hợp lệ" });
        return;
      }
      const sportExists = await Sport.findById(body.sport);
      if (!sportExists) {
        res.status(400).json({ message: "ID môn thể thao không hợp lệ" });
        return;
      }

      // Validate video (file or URL)
      let videoUrl: string | undefined;
      if (files?.videoUrl?.[0]) {
        videoUrl = `${configURL.baseURL}/images/${path.basename(
          files.videoUrl[0].path
        )}`;
      } else if (body.videoUrl) {
        videoUrl = body.videoUrl;
      } else {
        res
          .status(400)
          .json({ message: "Phải cung cấp file video hoặc URL video" });
        return;
      }

      // Handle thumbnail (optional)
      let thumbnailUrl: string | undefined;
      if (files?.thumbnail?.[0]) {
        thumbnailUrl = `${configURL.baseURL}/images/${path.basename(
          files.thumbnail[0].path
        )}`;
      } else if (body.thumbnail) {
        thumbnailUrl = body.thumbnail;
      }

      // Prepare replay data
      const replayData: Partial<IReplay> = {
        title: body.title,
        slug: body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        description: body.description || undefined,
        videoUrl,
        thumbnail: thumbnailUrl || undefined,
        match: body.match,
        sport: body.sport,
        duration: body.duration ? Number(body.duration) : undefined,
        views: body.views ? Number(body.views) : 0,
        commentator: body.commentator || undefined,
        publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
        isShown: body.isShown === "true",
      };

      const newReplay = new Replay(replayData);
      await newReplay.save();
      const populatedReplay = await Replay.findById(newReplay._id)
        .populate({
          path: "match",
          populate: [
            { path: "homeTeam", select: "name logo" },
            { path: "awayTeam", select: "name logo" },
            { path: "league", select: "name" },
          ],
        })
        .populate({
          path: "sport",
          select: "name icon slug",
        });

      res.status(201).json(populatedReplay);
    } catch (error: any) {
      console.error("Create Replay Error:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
];

// @desc    Lấy tất cả video xem lại
// @route   GET /api/replays
export const getAllReplays = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { excludeId } = req.query;
    const filter: any = {};
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const replays = await Replay.find(filter)
      // Populate lồng nhau để lấy thông tin chi tiết của trận đấu
      .populate({
        path: "match",
        populate: [
          { path: "homeTeam", select: "name logo" },
          { path: "awayTeam", select: "name logo" },
          { path: "league", select: "name" },
        ],
      })
      .populate({
        path: "sport",
        select: "name icon slug",
      })
      .sort({ createdAt: -1 }); // Sắp xếp video mới nhất lên đầu

    res.status(200).json(replays);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// @desc    Lấy một video xem lại theo ID
// @route   GET /api/replays/:id
export const getReplayById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const replay = await Replay.findById(req.params.id)
      .populate("match")
      .populate("sport");
    if (!replay) {
      res.status(404).json({ message: "Không tìm thấy video" });
      return;
    }
    res.status(200).json(replay);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

export const getReplayBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log(req.params?.slug);
    const replay = await Replay.findOne({ slug: req.params.slug })
      .populate("match")
      .populate("sport");
    if (!replay) {
      res.status(404).json({ message: "Không tìm thấy video" });
      return;
    }
    res.status(200).json(replay);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// @desc    Update a replay video
// @route   PUT /api/replays/:id
export const updateReplay: RequestHandler[] = [
  uploadFiles,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body;
      const files = req.files as
        | {
            videoUrl?: Express.Multer.File[];
            thumbnail?: Express.Multer.File[];
          }
        | undefined;

      // Find existing replay
      const existingReplay = await Replay.findById(req.params.id);
      if (!existingReplay) {
        res.status(404).json({ message: "Không tìm thấy video" });
        return;
      }

      // Validate match and sport if provided
      if (body.match) {
        const matchExists = await Match.findById(body.match);
        if (!matchExists) {
          res.status(400).json({ message: "ID trận đấu không hợp lệ" });
          return;
        }
      }
      if (body.sport) {
        const sportExists = await Sport.findById(body.sport);
        if (!sportExists) {
          res.status(400).json({ message: "ID môn thể thao không hợp lệ" });
          return;
        }
      }

      // Collect old file paths for deletion
      const oldFiles: string[] = [];

      // Handle video
      let videoUrl: string | undefined;
      if (files?.videoUrl?.[0]) {
        videoUrl = `${configURL.baseURL}/images/${path.basename(
          files.videoUrl[0].path
        )}`;
        if (
          existingReplay.videoUrl?.startsWith(`${configURL.baseURL}/images/`)
        ) {
          oldFiles.push(
            path.join(
              __dirname,
              "../public/images",
              path.basename(existingReplay.videoUrl)
            )
          );
        }
      } else if (body.videoUrl) {
        videoUrl = body.videoUrl;
      } else {
        videoUrl = existingReplay.videoUrl;
      }

      // Handle thumbnail
      let thumbnailUrl: string | undefined;
      if (files?.thumbnail?.[0]) {
        thumbnailUrl = `${configURL.baseURL}/images/${path.basename(
          files.thumbnail[0].path
        )}`;
        if (
          existingReplay.thumbnail?.startsWith(`${configURL.baseURL}/images/`)
        ) {
          oldFiles.push(
            path.join(
              __dirname,
              "../public/images",
              path.basename(existingReplay.thumbnail)
            )
          );
        }
      } else if (body.thumbnail === "") {
        thumbnailUrl = undefined;
        if (
          existingReplay.thumbnail?.startsWith(`${configURL.baseURL}/images/`)
        ) {
          oldFiles.push(
            path.join(
              __dirname,
              "../public/images",
              path.basename(existingReplay.thumbnail)
            )
          );
        }
      } else if (body.thumbnail) {
        thumbnailUrl = body.thumbnail;
      } else {
        thumbnailUrl = existingReplay.thumbnail;
      }

      // Validate videoUrl
      if (!videoUrl) {
        res
          .status(400)
          .json({ message: "Phải cung cấp file video hoặc URL video" });
        return;
      }

      // Prepare update data
      const updateData: Partial<IReplay> = {
        title: body.title || existingReplay.title,
        slug: body.title
          ? body.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
          : existingReplay.slug,
        description:
          body.description !== undefined
            ? body.description
            : existingReplay.description,
        videoUrl,
        thumbnail: thumbnailUrl,
        match: body.match || existingReplay.match,
        sport: body.sport || existingReplay.sport,
        duration: body.duration
          ? Number(body.duration)
          : existingReplay.duration,
        views: body.views ? Number(body.views) : existingReplay.views,
        commentator:
          body.commentator !== undefined
            ? body.commentator
            : existingReplay.commentator,
        publishDate: body.publishDate
          ? new Date(body.publishDate)
          : existingReplay.publishDate,
        isShown:
          body.isShown === "true"
            ? true
            : body.isShown === "false"
            ? false
            : existingReplay.isShown,
      };

      // Update replay
      const updatedReplay = await Replay.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate({
          path: "match",
          populate: [
            { path: "homeTeam", select: "name logo" },
            { path: "awayTeam", select: "name logo" },
            { path: "league", select: "name" },
          ],
        })
        .populate({
          path: "sport",
          select: "name icon slug",
        });

      if (!updatedReplay) {
        res.status(404).json({ message: "Không tìm thấy video" });
        return;
      }

      // Delete old files
      for (const filePath of oldFiles) {
        try {
          await fs.unlink(filePath);
        } catch (err: any) {
          if (err.code !== "ENOENT") {
            console.error(`Lỗi khi xóa file cũ: ${filePath}`, err);
          }
        }
      }

      res.status(200).json(updatedReplay);
    } catch (error: any) {
      console.error("Update Replay Error:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
];

// @desc    Xóa một video xem lại
// @route   DELETE /api/replays/:id
export const deleteReplay = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedReplay = await Replay.findById(req.params.id);
    if (!deletedReplay) {
      res.status(404).json({ message: "Không tìm thấy video" });
      return;
    }

    // Delete video file
    if (deletedReplay.videoUrl?.startsWith(`${configURL.baseURL}/images/`)) {
      const videoPath = path.join(
        __dirname,
        "../public/images",
        path.basename(deletedReplay.videoUrl)
      );
      try {
        await fs.unlink(videoPath);
      } catch (err: any) {
        if (err.code !== "ENOENT") {
          console.error(`Lỗi khi xóa file video: ${videoPath}`, err);
        }
      }
    }

    // Delete thumbnail file
    if (deletedReplay.thumbnail?.startsWith(`${configURL.baseURL}/images/`)) {
      const thumbnailPath = path.join(
        __dirname,
        "../public/images",
        path.basename(deletedReplay.thumbnail)
      );
      try {
        await fs.unlink(thumbnailPath);
      } catch (err: any) {
        if (err.code !== "ENOENT") {
          console.error(`Lỗi khi xóa file thumbnail: ${thumbnailPath}`, err);
        }
      }
    }

    await Replay.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa video thành công" });
  } catch (error: any) {
    console.error("Delete Replay Error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
