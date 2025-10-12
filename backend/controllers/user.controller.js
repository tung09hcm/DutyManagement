import bcrypt from "bcryptjs";
import { Op } from 'sequelize';
import dotenv from "dotenv";
import User from "../model/user.model.js";
import Organization from "../model/organization.model.js";
import UserOrgTask from "../model/userOrgTask.model.js"
import Task from "../model/task.model.js";
import cloudinary from "../lib/cloudinary.js";

dotenv.config();

/**
 * PUT /api/user/editProfile
 */
export const editProfile = async (req, res) => {
    try {
        const userId = req.user.id; 

        const { name, lastname, username: newUsername, email: newEmail, password } = req.body;

        const userToUpdate = await User.findByPk(userId);

        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        if (newUsername || newEmail) {
            const existingConflict = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: newUsername },
                        { email: newEmail }
                    ],
                    id: {
                        [Op.ne]: userId 
                    }
                }
            });

            if (existingConflict) {
                return res.status(409).json({ message: "Username or email already in use by another account" });
            }
        }

        if (name) userToUpdate.name = name;
        if (lastname) userToUpdate.lastname = lastname;
        if (newUsername) userToUpdate.username = newUsername;
        if (newEmail) userToUpdate.email = newEmail;
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            userToUpdate.password = hashedPassword;
        }

        await userToUpdate.save();
        
        const { password: _, ...userWithoutPassword } = userToUpdate.toJSON();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "An unexpected error occurred" });
    }
};

/**
 * POST /api/user/uploadAvatar
 */
export const editAvatarImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const userId = req.user.id;
        const userToUpdate = await User.findByPk(userId);

        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: 'image',
            folder: 'avatars' 
        }, async (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ message: "Error uploading image to cloud service." });
            }

            userToUpdate.avatarLink = result.secure_url;
            await userToUpdate.save();

            const { password: _, ...userWithoutPassword } = userToUpdate.toJSON();

            return res.status(200).json({
                message: "Avatar updated successfully",
                user: userWithoutPassword
            });
        });
        uploadStream.end(req.file.buffer);

    } catch (e) {
        console.error("Server error in editAvatarImage:", e);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
};

/**
 * GET /api/user/by-org/:orgId
 */
export const getUsersByOrg = async (req, res) => {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findByPk(orgId, {
            include: [{
                model: User,
                attributes: { exclude: ['password'] }, 
                through: { attributes: ['role'] } 
            }]
        });

        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        res.status(200).json(organization.Users);

    } catch (error) {
        console.error("Error fetching users by organization:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

/**
 * GET /api/user/role-in-org/:orgId
 */
export const getUserRoleInOrg = async (req, res) => {
    try {
        const { orgId } = req.params;
        const userId = req.user.id;

        const userOrgRole = await UserOrgTask.findOne({
            where: {
                UserId: userId,
                OrganizationId: orgId
            }
        });

        if (!userOrgRole) {
            return res.status(404).json({ message: "User is not a member of this organization or organization does not exist." });
        }

        res.status(200).json({ role: userOrgRole.role });

    } catch (error) {
        console.error("Error fetching user role in organization:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

/**
 * GET /api/user/:userId
 */
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] } 
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};


/**
 * GET /api/user/search/:name
 */
export const searchUserByName = async (req, res) => {
    try {
        const { name } = req.params;
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { username: { [Op.like]: `%${name}%` } },
                    { name: { [Op.like]: `%${name}%` } },
                    { lastname: { [Op.like]: `%${name}%` } }
                ]
            },
            attributes: { exclude: ['password'] }
        });

        res.status(200).json(users);

    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};

/**
 * GET /api/user/by-task/:taskId
 */
export const getUsersByTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findByPk(taskId, {
            include: [{
                model: User,
                attributes: { exclude: ['password'] },
                through: { attributes: [] }
            }]
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json(task.Users);

    } catch (error) {
        console.error("Error fetching users by task:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
};


