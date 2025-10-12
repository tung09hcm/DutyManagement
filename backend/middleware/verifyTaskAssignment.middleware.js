import { Task } from '../model/index.js';

export const verifyTaskAssignment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { taskId } = req.params;

        if (!taskId) {
            return res.status(400).json({ message: "Task ID is missing from the request parameters." });
        }
        
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }
        
        // Sử dụng method đặc biệt của Sequelize để kiểm tra mối quan hệ
        const isAssigned = await task.hasUser(userId);

        if (!isAssigned) {
            return res.status(403).json({ message: "Forbidden: You are not assigned to this task." });
        }

        // Gắn task vào request để controller không cần tìm lại
        req.task = task;
        next();

    } catch (error) {
        console.error("Error in verifyTaskAssignment middleware:", error);
        return res.status(500).json({ message: "An internal server error occurred." });
    }
};