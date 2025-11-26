import { Task, User, Penalty, sequelize, UserOrgTask, UserTask } from "../model/index.js";
import cloudinary from "../lib/cloudinary.js";
import { Op } from "sequelize";

/**
 * POST /api/orgs/:orgId/tasks
 * Tạo một task mới trong một tổ chức và giao cho thành viên.
 * Yêu cầu quyền ADMIN hoặc COLLABORATOR.
 */
export const createTask = async (req, res) => {
    const transaction = await sequelize.transaction();
    const who_assign_id = req.user.id;
    try {
        const { orgId } = req.params;
        const { name, description, penalty, deadline, assigneeIds } = req.body; // assigneeIds là một mảng các userId
        console.log("assigneeIds type:", typeof assigneeIds, assigneeIds);
        console.log("assigneeIds: " + assigneeIds);
        if (!name || !deadline || !assigneeIds || !assigneeIds.length) {
            return res.status(400).json({ message: "Name, deadline, and at least one assignee are required." });
        }
        const d = new Date(deadline);
        d.setHours(23, 59, 59, 999);
        // Bước 1: Tạo Task bên trong transaction
        const newTask = await Task.create({
            name,
            description,
            penalty,
            deadline: d,
            organizationId: orgId,
            proof: "", // Khởi tạo proof rỗng
            id_assign: who_assign_id
        }, { transaction });

        // Bước 2: Giao task cho các user trong mảng assigneeIds
        await newTask.addUsers(assigneeIds, {
            through: { organizationId: orgId },
            transaction
        });


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

export const autoAssign = async (req, res) => {
  const who_assign_id = req.user.id;
  const transaction = await sequelize.transaction();

  try {
    const { orgId } = req.params;
    const { tasks, begin, end, includeAdmin } = req.body;

    // --- Lấy danh sách user trong org ---
    let users = [];

    if (includeAdmin) {
      users = await UserOrgTask.findAll({
        where: { organizationId: orgId },
      });
    } else {
      users = await UserOrgTask.findAll({
        where: { organizationId: orgId, role: "USER" },
      });
    }

    if (users.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "No users in this organization to assign tasks." });
    }

    let userIndex = 0;

    // Chuyển begin/end
    const startDate = new Date(begin);
    const endDate = new Date(end);

    // --- Lặp qua từng task mẫu ---
    for (const sampleTask of tasks) {
      let cursorDate = new Date(startDate);

      const interval = sampleTask.frequent === 7 ? 7 : 1;

      // --- Lặp ngày theo frequent ---
      while (cursorDate <= endDate) {
        // Deadline = cuối ngày
        const deadline = new Date(cursorDate);
        deadline.setHours(23, 59, 59, 999);

        // --- Gán cho user (xoay vòng) ---
        const assignedUser = users[userIndex];
        userIndex = (userIndex + 1) % users.length;

        // --- Tạo task thật ---
        const createdTask = await Task.create(
          {
            name: sampleTask.name,
            description: sampleTask.description,
            penalty: sampleTask.penalty,
            organizationId: orgId,
            deadline,
            proof: "",
            status: false,
            id_assign: who_assign_id
          },
          { transaction }
        );

        // --- Gắn user thực hiện ---
        await UserTask.create(
          {
            userId: assignedUser.userId,
            taskId: createdTask.id,
            organizationId: orgId
          },
          { transaction }
        );

        // --- Tiến ngày ---
        cursorDate.setDate(cursorDate.getDate() + interval);
      }
    }

    await transaction.commit();
    return res.status(200).json({ message: "Tasks auto-assigned successfully." });

  } catch (error) {
    await transaction.rollback();
    console.error("Error auto assign task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTask = async (req,res) => {
  try{
    const { taskId } = req.params;
    const deletedRows = await Task.destroy({
      where: { 
        id: taskId,
        status: false
      }
    });
    if (deletedRows === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(200).json({ message: "Task deleted successfully." });
  }catch(error){
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
/**
 * POST /api/orgs/:orgId/tasks/:taskId/penalties
 * Tạo penalty cho một user cụ thể của một task đã quá hạn.
 * Yêu cầu quyền ADMIN hoặc COLLABORATOR.
 */
export const createPenalty = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userIds, description } = req.body;

    console.log("userIds: ", userIds);

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Kiểm tra xem deadline đã qua chưa
    if (new Date() < new Date(task.deadline)) {
      return res.status(400).json({ message: "Cannot create penalty before the deadline has passed." });
    }

    // Duyệt qua từng user trong danh sách
    const createdPenalties = [];

    for (const u of userIds) {
      const userId = u.id;

      // Kiểm tra xem user có được giao task này không
      const isAssigned = await task.hasUser(userId);
      if (!isAssigned) {
        console.warn(`User ${userId} is not assigned to task ${taskId}, skipping...`);
        continue;
      }

      const penalty = await Penalty.create({
        description,
        userId,
        taskId,
        organizationId: task.organizationId,
      });

      createdPenalties.push(penalty);
    }

    // Cập nhật trạng thái task
    task.penalty_status = true;
    await task.save();

    res.status(201).json({
      message: "Penalties created successfully.",
      penalties: createdPenalties,
    });

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

export const getTasksForThreeMonths = async (req, res) => {
  try {
    const { orgId } = req.params;

    // Ngày đầu tháng hiện tại
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfNextNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 1);

    // 🔹 Lấy task trong 3 tháng có kèm danh sách user được assign
    const tasks = await Task.findAll({
      where: {
        organizationId: orgId,
        deadline: {
          [Op.gte]: startOfPrevMonth,
          [Op.lt]: startOfNextNextMonth,
        },
      },
      include: [
        {
          model: User,
          through: { attributes: [] }, // bỏ cột trung gian
          attributes: ["id", "username", "avatarLink"],
        },
      ],
      order: [["deadline", "ASC"]],
    });

    // 🔹 Chuẩn hoá dữ liệu trả về
    const formattedTasks = tasks.map((t) => {
      const dateObj = new Date(t.deadline);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const mi = String(dateObj.getMinutes()).padStart(2, "0");
      if(t.name === "28-10-1"){
        console.log(t.name + " " + t.deadline);
      }
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        penalty: t.penalty,
        status: t.status,
        penalty_status: t.penalty_status,
        deadline: t.deadline,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        proof: t.proof,
        date: `${yyyy}-${mm}-${dd} ${hh}:${mi}`,
        time: `${hh}:${mi}`,
        color: "#3b82f6",
        assignedBy: t.id_assign, // người giao
        assignees: t.Users || [], // danh sách người được giao từ UserTasks
      };
    });

    return res.status(200).json({ tasks: formattedTasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPenalties = async (req, res) => {
  try {
    const { orgId } = req.params;
    console.log("orgId: ", orgId);
    const penalties = await Penalty.findAll({
      where: {
        organizationId: orgId
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "email", "avatarLink", "name", "lastname"],
        },
        {
          model: Task,
          attributes: ["description", "name"],
        },
      ],
      order: [["updatedAt", "ASC"]],
    })
    console.log("penalties: ", penalties);
    return res.status(200).json({penalties: penalties});
  } catch (error) {
    console.error("Error fetching penalties:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const editTask = async (req,res) => {
//   try{
//     const { taskId } = req.params;
//     const who_assign_id = req.user.id;
//     const { name, description, penalty, assigneeIds } = req.body;
//     // Vào UserTask để xóa hết các mối liên hệ nếu có trong assigneeIds


//   }catch(error){
//     console.error("Error edit task: ", error);
//     return res.status(500).json({message: "Internal server error"});
//   }
// }