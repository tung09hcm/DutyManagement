import { UserOrgTask } from '../model/index.js';

/**
 * Middleware để xác minh người dùng hiện tại có vai trò ADMIN trong một tổ chức.
 * Yêu cầu:
 * - Phải chạy sau middleware xác thực (để có req.user.id).
 * - Route phải có một parameter :orgId.
 */
export const verifyAdminRole = async (req, res, next) => {
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

        if (!membership || membership.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden: You must be an admin of this organization to perform this action." });
        }

        // Gắn thông tin membership vào request để có thể dùng ở controller nếu cần
        req.membership = membership; 
        next();

    } catch (error) {
        console.error("Error in verifyAdminRole middleware:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};