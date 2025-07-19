import { Request, RequestHandler, Response } from "express";
import Sport, { ISport } from "../models/sport.model";
import path from "path";
import fs from "fs/promises";
import { configURL } from "../configs/configURL";
import { upload } from "../middlewares/multer";
const createSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
// @desc    Tạo một môn thể thao mới
// @route   POST /api/sports

// @desc    Tạo một môn thể thao mới
// @route   POST /api/sports
export const createSport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, order, iconUrl } = req.body;
    const iconFile = req.file;

    // Validate required fields
    if (!name) {
      res.status(400).json({ message: "Tên môn thể thao là bắt buộc" });
      return;
    }

    // Generate slug from name
    const slug = createSlug(name);

    // Check if slug already exists
    const existingSport = await Sport.findOne({ slug });
    if (existingSport) {
      res.status(409).json({ message: "Slug đã tồn tại" });
      return;
    }

    // Handle icon (file or URL)
    let finalIconUrl: string | undefined;
    if (iconFile) {
      // Nếu có file được tải lên, sử dụng đường dẫn file
      finalIconUrl = `${configURL.baseURL}/images/${path.basename(
        iconFile.path
      )}`;
    } else if (iconUrl) {
      // Nếu có logoUrl từ input text, sử dụng nó
      finalIconUrl = iconUrl;
    }
    const newSport: Partial<ISport> = {
      name,
      slug,
      icon: finalIconUrl,
      order: order ? Number(order) : 1,
    };

    const createdSport = new Sport(newSport);
    await createdSport.save();

    res.status(201).json(createdSport);
  } catch (error: any) {
    console.error("Create Sport Error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// @desc    Lấy tất cả môn thể thao
// @route   GET /api/sports
export const getAllSports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sports = await Sport.find().sort({ order: 1 });
    res.status(200).json(sports);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// @desc    Lấy một môn thể thao theo ID
// @route   GET /api/sports/:id
export const getSportById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) {
      res.status(404).json({ message: "Không tìm thấy môn thể thao" });
      return;
    }
    res.status(200).json(sport);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// @desc    Cập nhật một môn thể thao
// @route   PUT /api/sports/:id
export const updateSport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, order } = req.body;
    const iconFile = req.file;

    // Find existing sport
    const existingSport = await Sport.findById(req.params.id);
    if (!existingSport) {
      res.status(404).json({ message: "Không tìm thấy môn thể thao" });
      return;
    }

    // Generate slug from name if provided
    let slug = existingSport.slug;
    if (name) {
      slug = createSlug(name);
      // Check if new slug already exists
      const slugExists = await Sport.findOne({
        slug,
        _id: { $ne: req.params.id },
      });
      if (slugExists) {
        res.status(409).json({ message: "Slug đã tồn tại" });
        return;
      }
    }

    // Collect old file path for deletion
    const oldFiles: string[] = [];

    // Handle icon
    let iconUrl: string | undefined;
    if (iconFile) {
      iconUrl = `${configURL.baseURL}/images/${path.basename(iconFile.path)}`;
      if (existingSport.icon?.startsWith(`${configURL.baseURL}/images/`)) {
        oldFiles.push(
          path.join(
            __dirname,
            "../public/images",
            path.basename(existingSport.icon)
          )
        );
      }
    } else if (req.body.icon) {
      // Validate URL
      try {
        new URL(req.body.icon);
        iconUrl = req.body.icon;
      } catch {
        res.status(400).json({ message: "URL ảnh không hợp lệ" });
        return;
      }
      if (existingSport.icon?.startsWith(`${configURL.baseURL}/images/`)) {
        oldFiles.push(
          path.join(
            __dirname,
            "../public/images",
            path.basename(existingSport.icon)
          )
        );
      }
    } else if (req.body.removeIcon === "true") {
      iconUrl = undefined;
      if (existingSport.icon?.startsWith(`${configURL.baseURL}/images/`)) {
        oldFiles.push(
          path.join(
            __dirname,
            "../public/images",
            path.basename(existingSport.icon)
          )
        );
      }
    } else {
      iconUrl = existingSport.icon;
    }

    // Prepare update data
    const updateData: Partial<ISport> = {
      name: name || existingSport.name,
      slug,
      icon: iconUrl,
      order: order ? Number(order) : existingSport.order,
    };

    // Update sport
    const updatedSport = await Sport.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedSport) {
      res.status(404).json({ message: "Không tìm thấy môn thể thao" });
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

    res.status(200).json(updatedSport);
  } catch (error: any) {
    console.error("Update Sport Error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// @desc    Xóa một môn thể thao
// @route   DELETE /api/sports/:id
export const deleteSport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) {
      res.status(404).json({ message: "Không tìm thấy môn thể thao" });
      return;
    }

    // Delete icon file if exists
    if (sport.icon?.startsWith(`${configURL.baseURL}/images/`)) {
      const filePath = path.join(
        __dirname,
        "../public/images",
        path.basename(sport.icon)
      );
      try {
        await fs.unlink(filePath);
      } catch (err: any) {
        if (err.code !== "ENOENT") {
          console.error(`Lỗi khi xóa file icon: ${filePath}`, err);
        }
      }
    }

    await Sport.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa môn thể thao thành công" });
  } catch (error: any) {
    console.error("Delete Sport Error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
