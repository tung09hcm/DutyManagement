import { UserOrgTask } from '../model/index.js'; // Đảm bảo đường dẫn đúng

export const verifyOrgMembership = async (req, res, next) => {
    try {
        console.log("verifyOrgMembership triggered");
        const userId = req.user.id;
        const { orgId } = req.params;

        // Kiểm tra xem orgId có được cung cấp trong URL không
        if (!orgId) {
            return res.status(400).json({ message: "Organization ID is missing from the request parameters." });
        }

        // Tìm một bản ghi trong bảng trung gian khớp với cả userId và orgId
        const membership = await UserOrgTask.findOne({
            where: {
                UserId: userId,
                OrganizationId: orgId
            }
        });

        // Nếu không tìm thấy bản ghi nào, nghĩa là user không phải thành viên
        if (!membership) {
            // 403 Forbidden: Đã xác thực nhưng không có quyền truy cập
            return res.status(403).json({ message: "Access Forbidden: You are not a member of this organization." });
        }

        // Nếu tìm thấy, người dùng là thành viên hợp lệ -> cho phép đi tiếp
        console.log("pass org membership middleware")
        next();

    } catch (error) {
        console.error("Error in verifyOrgMembership middleware:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};