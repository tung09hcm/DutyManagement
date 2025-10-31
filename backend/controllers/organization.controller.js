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
        console.log("inviteToken: ", inviteToken);
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

        // Kiểm tra xem tổ chức có tồn tại không
        const organization = await Organization.findByPk(orgId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found." });
        }

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
        // {
        //     "id": "38aa35cb-78a1-48f8-9523-dd6628eddb0c",
        //     "role": "ADMIN",
        //     "createdAt": "2025-10-25T08:21:37.000Z",
        //     "updatedAt": "2025-10-25T08:21:37.000Z",
        //     "userId": "132438f2-d730-4a3b-83df-b0782f32da9c",
        //     "organizationId": "7b22280e-abfe-4a5b-8cb1-08094eff488b",
        //     "Organization": {
        //         "id": "7b22280e-abfe-4a5b-8cb1-08094eff488b",
        //         "name": "A20 - 206 ( KTX )",
        //         "description": "Phòng dọn KTX",
        //         "avatarLink": "https://api.dicebear.com/9.x/identicon/svg?seed=A20 - 206 ( KTX )"
        //     }
        // }
        res.status(200).json({ 
            role: "USER",
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt,
            userId: userId,
            organizationId: organization.id,
            Organization: {
                id: organization.id,
                name: organization.name,
                description: organization.description,
                avatarLink: organization.avatarLink
            }
        });
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
            console.log("User is not a member of this organization.");
            return res.status(404).json({ message: "User is not a member of this organization." });
        }

        if (membershipToEdit.role !== 'USER') {
            console.log("Can only change the role of a USER.");
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