import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/user.model.js";
import RefreshToken from "../model/refreshToken.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
} from "../lib/utils.js";

dotenv.config();

/**
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "This email already exists" });

    const existingUserName = await User.findOne({ where: { username } });
    if (existingUserName)
      return res.status(400).json({ message: "This username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      username, 
      email, 
      password: hashedPassword,
      name: "",
      lastname: "",
      avatarLink: ""
    });

    const userObject = user.toJSON();
    delete userObject.password;
    delete userObject.id;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const tokenRecord = await RefreshToken.create({
      hashtoken: hashedToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });

    // Gửi refreshTokenId trong cookie
    setTokenCookies(res, accessToken, refreshToken, tokenRecord.id);
    res.status(201).json({ user: userObject, accessToken, refreshTokenId: tokenRecord.id });
  } catch (error) {
    console.error("Error in register controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Wrong email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Wrong email or password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const tokenRecord = await RefreshToken.create({
      hashtoken: hashedToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });

    setTokenCookies(res, accessToken, refreshToken, tokenRecord.id);

    const userObject = user.toJSON();
    delete userObject.password;
    delete userObject.id;

    res.status(200).json({ user: userObject, accessToken, refreshTokenId: tokenRecord.id });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * POST /api/auth/refresh
 */
export const refresh = async (req, res) => {
  try {
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

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err)
          return res.status(403).json({ message: "Expired or invalid refresh token" });

        const user = await User.findByPk(decoded.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newAccessToken = generateAccessToken(user);
        setTokenCookies(res, newAccessToken, refreshToken, tokenRecord.id);
        res.status(200).json({ message: "Refresh Token Complete" });
      }
    );
  } catch (error) {
    console.error("Error in refresh controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    const { refreshTokenId } = req.cookies;

    if (refreshTokenId) {
      const tokenRecord = await RefreshToken.findByPk(refreshTokenId);
      if (tokenRecord) await tokenRecord.destroy();
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("refreshTokenId");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = async (req,res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller: ", error.message);
    return res.status(500).json({message: "Internal server error"});
  }
};