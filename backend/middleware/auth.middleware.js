import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/user.model.js";
import RefreshToken from "../model/refreshToken.model.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  setTokenCookies,
} from "../lib/utils.js";
dotenv.config();

export const protectRoute = async (req, res, next) => {
    try {
        console.log("protectRoute triggered");
        const accessToken = req.cookies.accessToken;
        // if (!accessToken)
        //     return res.status(401).json({ message: "Unauthorized - No token provided" });

        let decoded;
        try {
            decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        } catch (err) {
            // Access token hết hạn hoặc sai → thử refresh
            if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
                const { refreshToken, refreshTokenId } = req.cookies;
                if (!refreshToken || !refreshTokenId)
                    return res.status(401).json({ message: "Missing refresh token" });

                const tokenRecord = await RefreshToken.findByPk(refreshTokenId);
                if (!tokenRecord)
                    return res.status(403).json({ message: "Invalid refresh token" });

                const isMatch = await bcrypt.compare(refreshToken, tokenRecord.hashtoken);
                if (!isMatch)
                    return res.status(403).json({ message: "Invalid refresh token" });

                if (new Date(tokenRecord.expiresAt) < new Date()) {
                    await tokenRecord.destroy();
                    return res.status(403).json({ message: "Refresh token expired" });
                }

                try {
                    const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                    const user = await User.findByPk(refreshDecoded.userId);
                    if (!user)
                        return res.status(404).json({ message: "User not found" });

                    const newAccessToken = generateAccessToken(user);
                    setTokenCookies(res, newAccessToken, refreshToken, tokenRecord.id);

                    req.user = user; // gắn user để middleware kế tiếp dùng
                    return next();
                } catch (refreshErr) {
                    return res.status(403).json({ message: "Expired or invalid refresh token" });
                }
            }

            // Nếu lỗi khác
            return res.status(403).json({ message: "Invalid token" });
        }

        // Nếu access token còn hạn → xử lý bình thường
        const user = await User.findByPk(decoded.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        req.user = user;
        next();

    } catch (error) {
        console.error("Error in protectRoute:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};