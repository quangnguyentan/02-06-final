declare namespace Express {
    interface Request {
        // Add all the specific file field names that Multer handles for you
        files?: {
            videoUrl?: Multer.File[]; // From replay.controller
            thumbnail?: Multer.File[]; // From replay.controller

            // New fields from match.controller
            streamLinkImages?: Multer.File[];
            streamLinkVideos?: Multer.File[];
            streamLinkCommentatorImages?: Multer.File[];
            mainCommentatorImage?: Multer.File[];
            secondaryCommentatorImage?: Multer.File[];
        };
    }
}