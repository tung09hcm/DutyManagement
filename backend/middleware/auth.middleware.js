import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const protectRoute = async (req,res, next) => {
    try {
        const token = req.cookies.accessToken;
        if(!token)
        {
            return res.status(401).json({message: "Unauthorized - No token provided"});
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if(!decoded){
            return res.status(401).json({message: "Unauthorized - Invalid token"});
        }

        const user = await User.findOne({
            where: { id: decoded.userId }
        });
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in auth middleware protectRoute: ", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}
