import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (userId, username, name, lastname, email, res) => {
    const token = jwt.sign({userId, username, name, lastname, email}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })
    res.cookie("jwt",token,{
        maxAge: 7*24*3600*1000,
        httpOnly: true, 
        sameSite: "strict",
    })
    return token;
}