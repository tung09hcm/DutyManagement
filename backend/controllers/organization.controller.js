import bcrypt from "bcryptjs";
import { Op } from 'sequelize';
import dotenv from "dotenv";
import User from "../model/user.model.js";
import Organization from "../model/organization.model.js";
import UserOrgTask from "../model/userOrgTask.model.js"
import Task from "../model/task.model.js";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";

/**
 * POST /api/org/create
 */
export const createOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const org = await Organization.create({
      name,
      description,
      avatarLink: "https://api.dicebear.com/9.x/identicon/svg?seed=" + name,
      backgroundLink: "",
    });

    await UserOrgTask.create({
      userId,
      organizationId: org.id,
      role: "ADMIN",
    });

    res.status(201).json({ message: "Organization created", org });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * POST /api/org/:orgId/invite
 * (user nào nhấn vô link này đều thành thành viên của org với orgId này với role là USER)
 * (lưu ý authorization chỉ có ADMIN vào được endpoint này)
 */
export const generateInviteLink = async (req, res) => {
    try {
        const { orgId } = req.params;
        // Middleware verifyAdminRole đã xác nhận quyền, ta có thể tiến hành
        const payload = { orgId };
        const inviteToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Link này sẽ được gửi cho người dùng để họ tham gia

        res.status(200).json({ inviteToken });
    } catch (error) {
        console.error("Error generating invite link:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /api/org/join
 * Bất kỳ user nào có token mời hợp lệ đều có thể tham gia.
 */
export const joinOrganization = async (req, res) => {
    try {
        const { inviteToken } = req.body;
        const userId = req.user.id;

        if (!inviteToken) {
            return res.status(400).json({ message: "Invite token is required." });
        }

        const decoded = jwt.verify(inviteToken, process.env.JWT_SECRET);
        const { orgId } = decoded;

        const isAlreadyMember = await UserOrgTask.findOne({
            where: { UserId: userId, OrganizationId: orgId }
        });

        if (isAlreadyMember) {
            return res.status(409).json({ message: "You are already a member of this organization." });
        }

        await UserOrgTask.create({
            userId: userId,
            organizationId: orgId,
            role: "USER"
        });

        res.status(200).json({ message: "Successfully joined the organization." });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: "Invalid or expired invite token." });
        }
        console.error("Error joining organization:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


/**
 * PUT /api/org/:orgId/members/:userId/role
 * ADMIN đổi vai trò của một USER thành COLLABORATOR.
 */
export const editUserRole = async (req, res) => {
    try {
        const { orgId, userId } = req.params;
        
        const membershipToEdit = await UserOrgTask.findOne({
            where: { UserId: userId, OrganizationId: orgId }
        });

        if (!membershipToEdit) {
            return res.status(404).json({ message: "User is not a member of this organization." });
        }

        if (membershipToEdit.role !== 'USER') {
            return res.status(400).json({ message: "Can only change the role of a USER." });
        }
        
        membershipToEdit.role = "COLLABORATOR";
        await membershipToEdit.save();

        res.status(200).json({ message: "User role updated to COLLABORATOR successfully." });

    } catch (error) {
        console.error("Error editing user role:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /api/org/:orgId/details
 * ADMIN thay đổi name và description của tổ chức.
 */
export const editOrganizationDetails = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { name, description } = req.body;

        const organization = await Organization.findByPk(orgId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found." });
        }

        if (name) organization.name = name;
        if (description) organization.description = description;

        await organization.save();
        res.status(200).json({ message: "Organization details updated.", organization });

    } catch (error) {
        console.error("Error editing organization details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /api/org/:orgId/images
 * ADMIN thay đổi avatarLink và backgroundLink.
 */
export const editOrganizationImages = async (req, res) => {
    try {
        const { orgId } = req.params;
        const organization = await Organization.findByPk(orgId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found." });
        }
        
        const uploadPromises = [];
        
        // Hàm helper để upload lên Cloudinary
        const uploader = (file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: 'organizations' }, (error, result) => {
                    if (result) resolve(result);
                    else reject(error);
                });
                stream.end(file.buffer);
            });
        };
        
        if (req.files.avatar) {
            const avatarResult = await uploader(req.files.avatar[0]);
            organization.avatarLink = avatarResult.secure_url;
        }

        if (req.files.background) {
            const backgroundResult = await uploader(req.files.background[0]);
            organization.backgroundLink = backgroundResult.secure_url;
        }

        await organization.save();
        res.status(200).json({ message: "Organization images updated.", organization });

    } catch (error) {
        console.error("Error editing organization images:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * DELETE /api/org/:orgId/members/:userId
 * ADMIN kick một thành viên ra khỏi tổ chức.
 */
export const kickMember = async (req, res) => {
    try {
        const { orgId, userId: memberToKickId } = req.params;
        const adminId = req.user.id;

        // Ngăn admin tự kick chính mình
        if (adminId === memberToKickId) {
            return res.status(400).json({ message: "Admins cannot kick themselves." });
        }
        
        // Tìm và xóa bản ghi thành viên
        const deletedRows = await UserOrgTask.destroy({
            where: {
                userId: memberToKickId,
                organizationId: orgId
            }
        });

        // Nếu không có hàng nào được xóa, nghĩa là user đó không phải thành viên
        if (deletedRows === 0) {
            return res.status(404).json({ message: "Member not found in this organization." });
        }

        res.status(200).json({ message: "Member successfully removed from the organization." });

    } catch (error) {
        console.error("Error kicking member:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};