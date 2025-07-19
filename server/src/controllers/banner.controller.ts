import { Request, RequestHandler, Response } from "express";
import Banner, { IBanner, BannerPosition, DisplayPage } from "../models/banner.model";
import { upload } from "../middlewares/multer";
import fs from "fs/promises";
import path from "path";
import { configURL } from "../configs/configURL";

// @desc    Create a new banner
// @route   POST /api/banners
export const createBanner: RequestHandler[] = [
    upload.single("imageUrl"),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const body = req.body;
            const file = req.file;
            let imageUrl: string | undefined;
            if (file) {
                imageUrl = `${configURL.baseURL}/images/${path.basename(file.path)}`;
            } else if (body.imageUrl) {
                imageUrl = body.imageUrl;
            }

            if (!imageUrl) {
                res.status(400).json({ message: "Image URL is required" });
                return;
            }

            const bannerData: Partial<IBanner> = {
                imageUrl,
                position: body.position,
                displayPage: body.displayPage,
                link: body.link,
                priority: body.priority ? Number(body.priority) : 0,
                isActive: body.isActive === "true" ? true : body.isActive === "false" ? false : true,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined,
            };

            const newBanner = new Banner(bannerData);
            await newBanner.save();

            res.status(201).json(newBanner);
        } catch (error: any) {
            console.error("Create banner error:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    },
];

// @desc    Get all banners with optional filters
// @route   GET /api/banners
export const getAllBanners = async (req: Request, res: Response): Promise<void> => {
    try {
        const { position, displayPage, isActive } = req.query;
        const filter: any = {};
        if (position) filter.position = position;
        if (displayPage) filter.displayPage = displayPage;
        if (isActive) filter.isActive = isActive === "true";

        const banners = await Banner.find(filter).sort({ priority: 1, createdAt: -1 });

        res.status(200).json(banners);
    } catch (error) {
        console.error("Get banners error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Get banners by display page
// @route   GET /api/banners/display/:displayPage
export const getBannersByDisplayPage = async (req: Request, res: Response): Promise<void> => {
    try {
        const displayPage = req.params.displayPage;
        if (!Object.values(DisplayPage).includes(displayPage as DisplayPage)) {
            res.status(400).json({ message: "Invalid display page" });
            return;
        }

        const banners = await Banner.find({
            displayPage,
            isActive: true,
            $and: [
                {
                    $or: [
                        { startDate: { $exists: false } },
                        { startDate: { $lte: new Date() } },
                    ],
                },
                {
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: { $gte: new Date() } },
                    ],
                },
            ],
        }).sort({ priority: 1 });

        res.status(200).json(banners);
    } catch (error) {
        console.error("Get banners by display page error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Get banner by ID
// @route   GET /api/banners/:id
export const getBannerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            res.status(404).json({ message: "Banner not found" });
            return;
        }
        res.status(200).json(banner);
    } catch (error) {
        console.error("Get banner by ID error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
export const updateBanner: RequestHandler[] = [
    upload.single("imageUrl"),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const banner = await Banner.findById(req.params.id);
            if (!banner) {
                res.status(404).json({ message: "Banner not found" });
                return;
            }

            const body = req.body;
            const file = req.file;

            let imageUrl: string | undefined;
            if (file) {
                imageUrl = `${configURL.baseURL}/images/${path.basename(file.path)}`;
                // Delete old image if it exists
                if (banner.imageUrl?.startsWith(`${configURL.baseURL}/images/`)) {
                    try {
                        await fs.unlink(path.join(__dirname, "../public/images", path.basename(banner.imageUrl)));
                    } catch (err) {
                        console.error(`Error deleting old image: ${banner.imageUrl}`, err);
                    }
                }
            } else if (body.imageUrl) {
                imageUrl = body.imageUrl;
            } else {
                imageUrl = banner.imageUrl;
            }

            const updateData: Partial<IBanner> = {
                imageUrl,
                position: body.position || banner.position,
                displayPage: body.displayPage || banner.displayPage,
                link: body.link !== undefined ? body.link : banner.link,
                priority: body.priority ? Number(body.priority) : banner.priority,
                isActive: body.isActive === "true" ? true : body.isActive === "false" ? false : banner.isActive,
                startDate: body.startDate ? new Date(body.startDate) : banner.startDate,
                endDate: body.endDate ? new Date(body.endDate) : banner.endDate,
            };

            const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            });

            if (!updatedBanner) {
                res.status(404).json({ message: "Banner not found" });
                return;
            }

            res.status(200).json(updatedBanner);
        } catch (error: any) {
            console.error("Update banner error:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    },
];

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) {
            res.status(404).json({ message: "Banner not found" });
            return;
        }

        // Delete associated image
        if (banner.imageUrl?.startsWith(`${configURL.baseURL}/images/`)) {
            try {
                await fs.unlink(path.join(__dirname, "../public/images", path.basename(banner.imageUrl)));
            } catch (err) {
                console.error(`Error deleting image: ${banner.imageUrl}`, err);
            }
        }

        res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
        console.error("Delete banner error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};