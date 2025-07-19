import { Request, RequestHandler, Response } from "express";
import { upload } from "../middlewares/multer";
import VideoReels, { IVideoReels } from "../models/videoReel.model";
import fs from "fs/promises";
import path from "path";
import { configURL } from "../configs/configURL";

// @desc    Create a new video reel
// @route   POST /api/video-reels
export const createVideoReel: RequestHandler[] = [
  upload.fields([
    { name: "videoUrl", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body;
      const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined;

      let videoUrl: string | undefined;
      let thumbnail: string | undefined;

      if (files?.videoUrl?.[0]) {
        videoUrl = `${configURL.baseURL}/images/${path.basename(
          files.videoUrl[0].path
        )}`;
      } else if (body.videoUrl) {
        videoUrl = body.videoUrl;
      }

      if (files?.thumbnail?.[0]) {
        thumbnail = `${configURL.baseURL}/images/${path.basename(
          files.thumbnail[0].path
        )}`;
      } else if (body.thumbnail) {
        thumbnail = body.thumbnail;
      }

      if (!videoUrl) {
        res.status(400).json({ message: "Video URL is required" });
        return;
      }

      const videoReelData: Partial<IVideoReels> = {
        title: body.title,
        slug: body.slug,
        description: body.description,
        videoUrl,
        thumbnail,
        sport: body.sport,
        commentator: body.commentator,
        views: body.views ? Number(body.views) : 0,
        duration: Number(body.duration),
        publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
        isFeatured: body.isFeatured === "true",
        order: body.order ? Number(body.order) : 1, // Default order to 1 if not provided
      };

      const newVideoReel = new VideoReels(videoReelData);
      await newVideoReel.save();

      const populatedVideoReel = await VideoReels.findById(newVideoReel._id)
        .populate("sport", "name icon slug")
        .populate("commentator", "username avatar");

      res.status(201).json(populatedVideoReel);
    } catch (error: any) {
      console.error("Create video reel error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

// @desc    Get all video reels with optional filters
// @route   GET /api/video-reels
export const getAllVideoReels = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sport, isFeatured } = req.query;
    const filter: any = {};
    if (sport) filter.sport = sport;
    if (isFeatured) filter.isFeatured = isFeatured === "true";

    const videoReels = await VideoReels.find(filter)
      .populate("sport", "name icon slug")
      .populate("commentator", "username avatar")
      .sort({ order: 1 });

    res.status(200).json(videoReels);
  } catch (error) {
    console.error("Get video reels error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Get video reels by sport slug
// @route   GET /api/video-reels/sport/:sportSlug
export const getVideoReelsBySportSlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sportSlug = req.params.sportSlug;
    const videoReels = await VideoReels.find()
      .populate({
        path: "sport",
        match: { slug: sportSlug },
        select: "name icon slug",
      })
      .populate("commentator", "username avatar")
      .sort({ order: 1 });

    // Filter out video reels where sport didn't match
    const filteredVideoReels = videoReels.filter((reel) => reel.sport !== null);

    if (filteredVideoReels.length === 0) {
      res.status(404).json({ message: "No video reels found for this sport" });
      return;
    }

    res.status(200).json(filteredVideoReels);
  } catch (error) {
    console.error("Get video reels by sport slug error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Get video reel by ID
// @route   GET /api/video-reels/:id
export const getVideoReelById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const videoReel = await VideoReels.findById(req.params.id)
      .populate("sport", "name icon slug")
      .populate("commentator", "username avatar");
    if (!videoReel) {
      res.status(404).json({ message: "Video reel not found" });
      return;
    }
    res.status(200).json(videoReel);
  } catch (error) {
    console.error("Get video reel by ID error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Get video reel by slug
// @route   GET /api/video-reels/slug/:slug
export const getVideoReelBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const videoReel = await VideoReels.findOne({ slug: req.params.slug })
      .populate("sport", "name icon slug")
      .populate("commentator", "username avatar");
    if (!videoReel) {
      res.status(404).json({ message: "Video reel not found" });
      return;
    }
    res.status(200).json(videoReel);
  } catch (error) {
    console.error("Get video reel by slug error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Update a video reel
// @route   PUT /api/video-reels/:id
export const updateVideoReel: RequestHandler[] = [
  upload.fields([
    { name: "videoUrl", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const videoReel = await VideoReels.findById(req.params.id);
      if (!videoReel) {
        res.status(404).json({ message: "Video reel not found" });
        return;
      }

      const body = req.body;
      const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined;

      let videoUrl: string | undefined;
      let thumbnail: string | undefined;

      if (files?.videoUrl?.[0]) {
        videoUrl = `${configURL.baseURL}/images/${path.basename(
          files.videoUrl[0].path
        )}`;
        if (videoReel.videoUrl?.startsWith(`${configURL.baseURL}/images/`)) {
          try {
            await fs.unlink(
              path.join(
                __dirname,
                "../public/images",
                path.basename(videoReel.videoUrl)
              )
            );
          } catch (err) {
            console.error(
              `Error deleting old video: ${videoReel.videoUrl}`,
              err
            );
          }
        }
      } else if (body.videoUrl) {
        videoUrl = body.videoUrl;
      } else {
        videoUrl = videoReel.videoUrl;
      }

      if (files?.thumbnail?.[0]) {
        thumbnail = `${configURL.baseURL}/images/${path.basename(
          files.thumbnail[0].path
        )}`;
        if (videoReel.thumbnail?.startsWith(`${configURL.baseURL}/images/`)) {
          try {
            await fs.unlink(
              path.join(
                __dirname,
                "../public/images",
                path.basename(videoReel.thumbnail)
              )
            );
          } catch (err) {
            console.error(
              `Error deleting old thumbnail: ${videoReel.thumbnail}`,
              err
            );
          }
        }
      } else if (body.thumbnail) {
        thumbnail = body.thumbnail;
      } else {
        thumbnail = videoReel.thumbnail;
      }

      const updateData: Partial<IVideoReels> = {
        title: body.title || videoReel.title,
        slug: body.slug || videoReel.slug,
        description:
          body.description !== undefined
            ? body.description
            : videoReel.description,
        videoUrl,
        thumbnail,
        sport: body.sport || videoReel.sport,
        commentator:
          body.commentator !== undefined
            ? body.commentator
            : videoReel.commentator,
        views: body.views ? Number(body.views) : videoReel.views,
        duration: body.duration ? Number(body.duration) : videoReel.duration,
        publishDate: body.publishDate
          ? new Date(body.publishDate)
          : videoReel.publishDate,
        isFeatured:
          body.isFeatured === "true"
            ? true
            : body.isFeatured === "false"
            ? false
            : videoReel.isFeatured,
        order: body.order ? Number(body.order) : videoReel.order,
      };

      const updatedVideoReel = await VideoReels.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("sport", "name icon slug")
        .populate("commentator", "username avatar");

      if (!updatedVideoReel) {
        res.status(404).json({ message: "Video reel not found" });
        return;
      }

      res.status(200).json(updatedVideoReel);
    } catch (error: any) {
      console.error("Update video reel error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
];

// @desc    Delete a video reel
// @route   DELETE /api/video-reels/:id
export const deleteVideoReel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const videoReel = await VideoReels.findByIdAndDelete(req.params.id);
    if (!videoReel) {
      res.status(404).json({ message: "Video reel not found" });
      return;
    }

    // Delete associated files
    const oldFiles: string[] = [];
    if (videoReel.videoUrl?.startsWith(`${configURL.baseURL}/images/`)) {
      oldFiles.push(
        path.join(
          __dirname,
          "../public/images",
          path.basename(videoReel.videoUrl)
        )
      );
    }
    if (videoReel.thumbnail?.startsWith(`${configURL.baseURL}/images/`)) {
      oldFiles.push(
        path.join(
          __dirname,
          "../public/images",
          path.basename(videoReel.thumbnail)
        )
      );
    }

    for (const filePath of oldFiles) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error(`Error deleting file: ${filePath}`, err);
      }
    }

    res.status(200).json({ message: "Video reel deleted successfully" });
  } catch (error) {
    console.error("Delete video reel error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
