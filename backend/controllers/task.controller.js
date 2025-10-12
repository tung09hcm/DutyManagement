import { Task, User, Penalty, sequelize } from "../model/index.js";

/**
 * POST /api/orgs/:orgId/tasks
 * Tạo một task mới trong một tổ chức và giao cho thành viên.
 * Yêu cầu quyền ADMIN hoặc COLLABORATOR.
 */
export const createTask = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { orgId } = req.params;
        const { name, description, penalty, deadline, assigneeIds } = req.body; // assigneeIds là một mảng các userId

        if (!name || !deadline || !assigneeIds || !assigneeIds.length) {
            return res.status(400).json({ message: "Name, deadline, and at least one assignee are required." });
        }

        // Bước 1: Tạo Task bên trong transaction
        const newTask = await Task.create({
            name,
            description,
            penalty,
            deadline,
            OrganizationId: orgId,
            proof: "", // Khởi tạo proof rỗng
        }, { transaction });

        // Bước 2: Giao task cho các user trong mảng assigneeIds
        await newTask.setUsers(assigneeIds, { transaction });

        // Nếu mọi thứ thành công, commit transaction
        await transaction.commit();

        res.status(201).json({ message: "Task created and assigned successfully.", task: newTask });

    } catch (error) {
        // Nếu có lỗi, rollback tất cả thay đổi
        await transaction.rollback();
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /api/orgs/:orgId/tasks/:taskId/penalties
 * Tạo penalty cho một user cụ thể của một task đã quá hạn.
 * Yêu cầu quyền ADMIN hoặc COLLABORATOR.
 */
export const createPenalty = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { userId, description } = req.body;

        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Kiểm tra xem deadline đã qua chưa
        if (new Date() < new Date(task.deadline)) {
            return res.status(400).json({ message: "Cannot create penalty before the deadline has passed." });
        }

        // Kiểm tra xem user có được giao task này không
        const isAssigned = await task.hasUser(userId);
        if (!isAssigned) {
            return res.status(400).json({ message: "This user is not assigned to the task." });
        }

        const newPenalty = await Penalty.create({
            description,
            UserId: userId,
            TaskId: taskId,
        });

        res.status(201).json({ message: "Penalty created successfully.", penalty: newPenalty });

    } catch (error) {
        console.error("Error creating penalty:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * DELETE /api/orgs/:orgId/penalties/:penaltyId
 * Xóa một penalty của một thành viên.
 * Yêu cầu quyền ADMIN hoặc COLLABORATOR.
 */
export const deletePenalty = async (req, res) => {
    try {
        const { penaltyId } = req.params;

        const deletedRows = await Penalty.destroy({
            where: { id: penaltyId }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: "Penalty not found." });
        }

        res.status(200).json({ message: "Penalty deleted successfully." });

    } catch (error) {
        console.error("Error deleting penalty:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /api/users/:userId/penalties
 * Lấy tất cả penalty của một người dùng.
 */
export const getUserPenalties = async (req, res) => {
    try {
        const { userId } = req.params;
        const requesterId = req.user.id;

        // Chỉ cho phép user tự xem penalty của mình (hoặc có thể mở rộng cho admin)
        if (userId !== requesterId) {
            return res.status(403).json({ message: "Forbidden: You can only view your own penalties." });
        }
        
        const penalties = await Penalty.findAll({
            where: { UserId: userId },
            include: [{ // Kèm theo thông tin task để biết penalty này của task nào
                model: Task,
                attributes: ['id', 'name', 'deadline']
            }]
        });

        res.status(200).json(penalties);

    } catch (error) {
        console.error("Error fetching user penalties:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /api/tasks/:taskId/proof
 * Người dùng được giao task nộp ảnh bằng chứng.
 */
export const submitTaskProof = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No proof image provided" });
        }
        
        // Middleware verifyTaskAssignment đã tìm và gắn task vào req
        const task = req.task; 
        
        // Upload ảnh lên Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: 'task_proofs'
        }, async (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ message: "Error uploading proof to cloud service." });
            }

            // Cập nhật link bằng chứng và chuyển status thành true (đã nộp)
            task.proof = result.secure_url;
            task.status = true; 
            await task.save();

            res.status(200).json({ message: "Task proof submitted successfully.", task });
        });

        uploadStream.end(req.file.buffer);

    } catch (error) {
        console.error("Error submitting task proof:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PATCH /api/orgs/:orgId/tasks/:taskId/status
 * ADMIN hoặc COLLABORATOR cập nhật trạng thái của task.
 */
export const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, penalty_status } = req.body;

        const taskToUpdate = await Task.findByPk(taskId);
        if (!taskToUpdate) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Chỉ cập nhật những trường được cung cấp
        if (typeof status === 'boolean') {
            taskToUpdate.status = status;
        }
        if (typeof penalty_status === 'boolean') {
            taskToUpdate.penalty_status = penalty_status;
        }

        await taskToUpdate.save();

        res.status(200).json({ message: "Task status updated successfully.", task: taskToUpdate });

    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};