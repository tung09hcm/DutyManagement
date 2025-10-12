import { UserOrgTask } from '../model/index.js';

export const verifyOrgEditorRole = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orgId } = req.params;

        if (!orgId) {
            return res.status(400).json({ message: "Organization ID is missing." });
        }

        const membership = await UserOrgTask.findOne({
            where: {
                UserId: userId,
                OrganizationId: orgId
            }
        });

        const hasPermission = membership && (membership.role === "ADMIN" || membership.role === "COLLABORATOR");

        if (!hasPermission) {
            return res.status(403).json({ message: "Forbidden: You must be an admin or collaborator to perform this action." });
        }
        
        next();

    } catch (error) {
        console.error("Error in verifyOrgEditorRole middleware:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};