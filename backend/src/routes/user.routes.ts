import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import authMiddleware from "../middleware/auth";
import User from "../models/user";

const router = Router();

const avatarUploadDir = path.resolve(
  process.cwd(),
  "..",
  "public",
  "uploads",
  "avatars"
);

fs.mkdirSync(avatarUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, avatarUploadDir);
  },
  filename: (req: any, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExtension = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)
      ? extension
      : ".jpg";
    callback(null, `avatar-${req.user.id}-${Date.now()}${safeExtension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Only image uploads are allowed."));
  },
});

router.post(
  "/update-avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Avatar image is required",
        });
      }

      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      user.avatar_url = avatarUrl;
      await user.save();

      return res.status(200).json({
        success: true,
        avatar_url: avatarUrl,
      });
    } catch (error: any) {
      console.error("UPDATE AVATAR ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update avatar",
      });
    }
  }
);

export default router;
