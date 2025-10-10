import { Op } from "sequelize";
import { Organization, User, UserOrganization } from "../model/index.js";
import { checkRole } from "../middleware/checkRole.middleware.js";

export const createOrganization = async (req, res) => {
  try {
    const { name, description, avatarLink, backgroundLink } = req.body;
    const userId = req.user.userId;

    const org = await Organization.create({
      name,
      description,
      avatarLink,
      backgroundLink,
    });

    await UserOrganization.create({
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