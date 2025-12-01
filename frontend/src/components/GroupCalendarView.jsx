import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Settings, User, Trash} from "lucide-react";
import { useTaskStore} from "../store/useTaskStore";
import { useUserStore } from "../store/useUserStore";
import { useGroupStore } from "../store/useGroupStore";
import AssigneeSelect from "./AssigneeSelect";
import toast from "react-hot-toast";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const generateMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startDay);

  const weeks = [];
  for (let i = 0; i < 6; i++) {
    const days = [];
    for (let j = 0; j < 7; j++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * 7 + j);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
      });
    }
    weeks.push(days);
  }
  return weeks;
};

const GroupCalendarView = ({ group, onBack, manageUser  }) => {
  // Thêm 1 task trống
  const addEmptyTask = () => {
    setAutoAssignData((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          name: "",
          description: "",
          penalty: 0,
          status: false,
          frequent: 1,
          proof: "",
          penalty_status: false,
        },
      ],
    }));
  };
  // function fallbackCopyToClipboard(text) {
  //   const textarea = document.createElement("textarea");
  //   textarea.value = text;
  //   document.body.appendChild(textarea);
  //   textarea.select();
  //   try {
  //     document.execCommand("copy");
  //     toast.success("Copied invite link to clipboard! - FALLBACK");
  //   } catch (err) {
  //     console.log(err);
  //     toast.info("Invite token created, please copy manually. - FALLBACK");
  //   }
  //   document.body.removeChild(textarea);
  // }

  // Update field trong tasks[index]
  const updateTaskField = (index, field, value) => {
    setAutoAssignData((prev) => {
      const updatedTasks = [...prev.tasks];
      updatedTasks[index] = { ...updatedTasks[index], [field]: value };
      return { ...prev, tasks: updatedTasks };
    });
  };

  const today = new Date();
  const [viewDate, setViewDate] = useState(today);
  const [autoAssignFormOpen, setAutoAssignFormOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null);

  const [addTaskForm, setAddTaskForm] = useState(null);
  const { users, fetchUsers } = useUserStore();
  const { tasks, isLoading, fetchTasks, addTask, submitTaskProof, applyPenalty,autoAssign,deleteTask } = useTaskStore();
  const { createInviteToken } = useGroupStore();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    penalty: "",
    deadline: "",
    assigneeIds: []
  });
  // const handleCreateInviteToken = async(orgId) => {
  //   try {
  //     const res = await createInviteToken(orgId);

  //     if (res?.inviteToken) {
  //       // Copy token vào clipboard
  //       await navigator.clipboard.writeText(res.inviteToken);

  //       toast.success("Copied invite link to clipboard!");
  //     } else {
  //       toast.error("No invite token returned!");
  //     }
  //   } catch (error) {
  //     console.error("Error creating invite token:", error);
  //     const message =
  //       error?.response?.data?.message ||
  //       error?.message ||
  //       "Something went wrong!";

  //     toast.error(message);
  //   }
  // }
  const handleSubmitEvidence = async (orgId, task_id, task) => {
    if (!file) return toast.error("Please choose an image!");
    
    const res = await submitTaskProof(orgId, task_id, file);
    await fetchTasks(group.Organization.id); 
    setFile(null);
    task.proof = res.proof;
    task.status = true;
  };
  const [autoAssignData, setAutoAssignData] = useState({
    tasks: [
      {
        name: "",
        description: "",
        penalty: 0,
        status: false,
        frequent: 1,
        proof: "",
        penalty_status: false,
      },
    ],
    begin: "",
    end: "",
    includeAdmin: false,
  });
  const handleAutoAssignSubmit = async (e) => {
    e.preventDefault();
    const orgId = group.organizationId;

    try {
      await autoAssign(orgId, autoAssignData);

      // Reset form
      setAutoAssignData({
        tasks: [
          {
            name: "",
            description: "",
            penalty: 0,
            status: false,
            frequent: 1,
            proof: "",
            penalty_status: false,
          },
        ],
        begin: "",
        end: "",
        includeAdmin: false,
      });
    } catch (err) {
      console.error("Auto assign failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("formData: ", formData);
      await addTask(formData, group.organizationId);
      await fetchTasks(group.Organization.id); 
      setAddTaskForm(null);
      setSelectedDay(null);
      setFormData(
        {
          name: "",
          description: "",
          penalty: "",
          deadline: "",
          assigneeIds: []
        }
      );
    } catch (err) {
      console.error("Add task failed:", err);
    }
  };
  // handleApplyPenalty(group.organizationId,task.id,a.id,task.penalty)
  const handleApplyPenalty = async( orgId, taskId, userIds, taskPenalty,task) => {
    try {

      console.log("userId: ", userIds);
      task.penalty_status = 1;
      await applyPenalty(orgId, taskId, userIds, taskPenalty);


    } catch (error) {
      console.error("Apply penalty failed:", error);
    }
  }

  useEffect(() => {
    if (group?.Organization?.id) {
      fetchTasks(group.Organization.id);
    }
  }, [group]);

  useEffect(
    () => {
      if (group?.Organization?.id) {
        fetchUsers(group.Organization.id);
      }
    }, []
  );

  const calendar = useMemo(() => generateMonthDays(viewDate.getFullYear(), viewDate.getMonth()), [viewDate]);

  // Gán tasks vào từng ngày
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const date = new Date(t.date); 
      const key = date.toLocaleDateString("en-CA");
      console.log("t.date: " + t.date + "key: " + key + "t.name: " + t.name);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    console.log("map: ", map);
    return map;
  }, [tasks]);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="col-span-5 grid grid-cols-5 bg-base-100 relative">
      {/* Calendar */}
      <div className="col-span-4 p-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="btn btn-sm btn-outline">← Back</button>
          <h2 className="text-2xl font-bold text-primary">
            {group.Organization?.name} – {monthName}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="btn btn-sm btn-outline"><ChevronLeft /></button>
            <button onClick={nextMonth} className="btn btn-sm btn-outline"><ChevronRight /></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border border-base-300 rounded-md overflow-hidden">
          {DAYS.map((d) => (
            <div key={d} className="border border-base-300 p-2 text-center font-semibold bg-base-200/80 text-base-content/90">
              {d}
            </div>
          ))}

          {calendar.flat().map((day) => {
            const key = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`;
            // console.log("key: ", key , " day: ", day);
            const dayTasks = tasksByDate[key] || [];
            return (
              <div
                key={key}
                onClick={() => setSelectedDay({ ...day, tasks: dayTasks })}
                className={`border border-base-300 h-36 relative p-1 flex flex-col text-xs rounded-sm hover:bg-base-300/40 transition-colors`}
              >
                <div className="font-semibold text-right pr-1 text-[11px]">
                  {day.date.getDate()}
                </div>
                <div className="flex-1 cursor-pointer">
                  {dayTasks.length === 0 ? (
                    <p className="text-center italic text-base-content/40 mt-3">—</p>
                  ) : (
                    <>
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="rounded-md px-1 py-[2px] mb-1 text-white text-[11px] truncate shadow-sm"
                          style={{ backgroundColor: task.color || "#3b82f6" }}
                          title={`${task.time} – ${task.name}`}
                        >
                          {task.time} {task.name}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <button className="text-[11px] text-primary font-medium hover:underline mt-1">
                          +{dayTasks.length - 3} more
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isLoading && <p className="text-center text-sm text-base-content/60 mt-2">Loading tasks...</p>}
      </div>

      {/* Member list */}
      <div className="col-span-1 border-l border-base-300 p-4 bg-base-200/40 flex flex-col">
        <h3 className="font-semibold mb-3 text-base-content/80">Members</h3>

        {/* Danh sách users có scroll */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {users?.length ? (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-base-300/60 transition-colors"
              >
                <img
                  src={u.avatarLink}
                  alt={u.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <p className="text-sm truncate">{u.username}</p>

                <span
                  className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-md
                    ${
                      u.UserOrgTask.role === "ADMIN"
                        ? "bg-red-100 text-red-700 border border-red-400"
                        : u.UserOrgTask.role === "COLLABORATOR"
                        ? "bg-blue-100 text-blue-700 border border-blue-400"
                        : "bg-green-100 text-green-700 border border-green-400"
                    }`}
                >
                  {u.UserOrgTask.role}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm italic text-base-content/60">No members</p>
          )}
        </div>

        {/* Thanh hành động cuối cùng */}
        <div className="border-t border-base-300 mt-3 pt-3 flex flex-col gap-2">
          <button 
            onClick={manageUser}
            className="cursor-pointer flex gap-2 items-center w-full justify-center py-2 rounded-lg bg-base-300 hover:bg-base-200 transition-colors mb-2">
            Group info
          </button>
          {
            group.role == "ADMIN" ? (
              <button 
                onClick={() => setAutoAssignFormOpen(true)}
                className="cursor-pointer flex gap-2 items-center w-full justify-center py-2 rounded-lg bg-base-300 hover:bg-base-200 transition-colors mb-2">
                Auto assignment
              </button>
            ) : (
              <div></div>
            )
          }
          <button 
            onClick={
              async () => {
                const res = await createInviteToken(group.organizationId);
                try {
                  if (res?.inviteToken) {
                    // Clipboard phải được gọi trực tiếp từ click
                    await navigator.clipboard.writeText(res.inviteToken);
                    toast.success("Copied invite link to clipboard!");
                  } else {
                    toast.error("No invite token returned!");
                  }
                } catch (error) {
                  console.error("Error creating invite token:", error);
                  const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong!";

                  const textarea = document.createElement("textarea");
                  textarea.value = res.inviteToken;
                  document.body.appendChild(textarea);
                  textarea.select();
                  try {
                    document.execCommand("copy");
                    toast.success(res.inviteToken, { autoClose: 15000 });
                  } catch (err) {
                    console.log(err);
                    toast.error(message);
                    toast.info("Invite token created, please copy manually. - FALLBACK");
                  }
                  document.body.removeChild(textarea);

                  
                }
              }
            }
            className="cursor-pointer flex gap-2 items-center w-full justify-center py-2 rounded-lg bg-base-300 hover:bg-base-200 transition-colors mb-2">
            Create Invite Link
          </button>
        </div>
      </div>


      {/* Popup Tasks*/}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-base-100 rounded-lg shadow-lg w-240 max-h-[70vh] overflow-y-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-base-content/90">
                Tasks – {selectedDay.date.toDateString()}
              </h4>
              <button onClick={() => setSelectedDay(null)} className="btn btn-xs btn-circle">
                <X size={14} />
              </button>
            </div>
            {
              selectedDay.tasks.length === 0 ? (
                <div>
                  There are no tasks here
                </div>
              ) : null
            }
            {selectedDay.tasks.map((task) => (
              <div key={task.id} className="relative p-3 mb-3 rounded-lg text-white text-sm shadow-md" style={{ backgroundColor: task.color }}>
                {group.role === "ADMIN" ? (
                  <button
                    type="button"
                    className="btn btn-xs btn-error absolute top-2 right-2"
                    onClick={async () => {
                      await deleteTask(group.organizationId, task.id);
                      setSelectedDay((prev) => ({
                        ...prev,
                        tasks: prev.tasks.filter((t) => t.id !== task.id),
                      }));
                    }}
                  >
                    Delete
                  </button>
                ) : null}

                
                <div className="font-semibold mb-2">
                  {task.time} – {task.name}
                </div>
                <div className="mb-2">
                  <strong>Description: </strong>
                  {task.description || "No description"}
                </div>
                <div className="mb-2">
                  <strong>Penalty: </strong>
                  {task.penalty || "No description"}
                </div>
                <div className="mb-2 flex gap-2">
                  {new Date(task.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) && !task.status ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-400 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Not done
                      </span>
                    ) : task.status ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-400 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-400 rounded-full">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        Pending
                      </span>
                  )}
                  {
                    task.proof != "" ? (
                      <a href={task.proof} target = "_blank" className="cursor-pointer bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500 transition-colors text-xs">
                        Watch Evidence
                      </a>
                    ) : (
                      // <div className="cursor-pointer bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500 transition-colors text-xs">
                      //   No Evidence Found !!!
                      // </div>
                      <div>

                      </div>
                    )
                  }
                  {
                    new Date(task.date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
                    && task.assignees.some(u => u.id === group.userId) 
                    && task.proof == ""
                    ? (
                      <div className="flex gap-2">
                        {/* Nút chọn ảnh */}
                        <label className="cursor-pointer flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors">
                          Choose Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                          />
                        </label>

                        {/* Hiển thị tên file nếu có */}
                        {file && (
                          <p className="text-xs text-white/80 truncate max-w-[180px]">
                            📎 {file.name}
                          </p>
                        )}

                        {/* Nút tải lên */}
                        <button
                          disabled={!file}
                          onClick={() => handleSubmitEvidence(group.organizationId, task.id, task)}
                          className={`btn btn-xs ${
                            file ? "btn-primary" : "btn-disabled opacity-50 cursor-not-allowed"
                          }`}
                        >
                          Upload Proof
                        </button>
                      </div>
                    ) : null
                  }
                  {
                    !task.penalty_status &&
                    task.proof == "" &&
                    new Date(selectedDay.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? (
                      <button
                      onClick={() => handleApplyPenalty(group.organizationId,task.id,task.assignees,task.penalty,task)} 
                      className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded-lg transition">
                        Apply Penalty
                      </button>
                    ):null
                  }
                </div>
                <div className="flex flex-col gap-1 bg-white/10 p-2 rounded-md">
                  {task.assignees.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-white/90">
                      <img src={a.avatarLink} alt={a.username} className="w-6 h-6 rounded-full border border-white/50" />
                      <span className="font-medium">{a.username}</span>
                      <div className="ml-auto flex gap-2">
                        
                        {
                          task.penalty_status ? (
                            <div className="bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-500 transition-colors text-xs">
                              Penalty Applied !!!
                            </div>
                          ) : (
                            <div >
                              
                            </div>
                          )
                        }
                        


                      </div>
                      
                      
                    </div>
                  ))}
                </div>
                
                
              </div>
            ))}

            {
              new Date(selectedDay.date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)
              && (group.role == "ADMIN" || group.role == "COLLABORATOR" ) ? (
                <button onClick={() => {
                  setSelectedDay(null);
                  setAddTaskForm(selectedDay);
                }} 
                  className="ml-auto px-3 py-1 border border-white text-white bg-transparent rounded-lg hover:bg-white/10 transition-colors"
                >Add Task</button>
              ) : (
                <div></div>
              )
            }
          </div>
        </div>
      )}

      {/* Popup Form*/}
      { addTaskForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
            <div className="bg-base-100 rounded-lg shadow-lg w-240 max-h-[70vh] overflow-y-auto p-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-base-content/90">
                  Tasks – {addTaskForm.date.toDateString()}
                </h4>
                <button onClick={() => setAddTaskForm(null)} className="btn btn-xs btn-circle">
                  <X size={14} />
                </button>
              </div>
              {/* Body */}
              <form
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                {/* Task Name */}
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Task Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full input input-bordered input-sm"
                    placeholder="Enter task name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full textarea textarea-bordered textarea-sm"
                    placeholder="Enter task description"
                    rows="3"
                  />
                </div>

                {/* Penalty */}
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Penalty</label>
                  <input
                    type="text"
                    value={formData.penalty}
                    onChange={(e) => setFormData({ ...formData, penalty: e.target.value })}
                    className="w-full input input-bordered input-sm"
                    placeholder="e.g. Clean the room"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Deadline</label>
                  <input
                    type="time"
                    step="60"
                    value={
                      formData.deadline
                        ? formData.deadline.split(" ")[1]?.slice(0, 5) 
                        : ""
                    }
                    onChange={(e) => {
                      const dateObj = new Date(addTaskForm.date);
                      const [hours, minutes] = e.target.value.split(":");
                      const yyyy = dateObj.getFullYear();
                      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
                      const dd = String(dateObj.getDate()).padStart(2, "0");

                      const localString = `${yyyy}-${mm}-${dd} ${hours}:${minutes}`;

                      setFormData({ ...formData, deadline: localString });
                    }}
                    className="w-full input input-bordered input-sm"
                  />
                </div>




                {/* Assignee IDs */}
                <AssigneeSelect users={users} formData={formData} setFormData={setFormData} />

                {/* Submit button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}

      {autoAssignFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-base-100 rounded-lg shadow-lg w-240 max-h-[80vh] overflow-y-auto p-4">

            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-base-content/90">Auto Assign Tasks</h4>
              <button onClick={() => setAutoAssignFormOpen(false)} className="btn btn-xs btn-circle">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAutoAssignSubmit} className="space-y-4">

              {/* Begin Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Begin Date</label>
                <input
                  type="date"
                  value={autoAssignData.begin}
                  onChange={(e) =>
                    setAutoAssignData({ ...autoAssignData, begin: e.target.value })
                  }
                  required
                  className="input input-bordered input-sm w-full"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={autoAssignData.end}
                  onChange={(e) =>
                    setAutoAssignData({ ...autoAssignData, end: e.target.value })
                  }
                  required
                  className="input input-bordered input-sm w-full"
                />
              </div>

              {/* includeAdmin toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoAssignData.includeAdmin}
                  onChange={(e) =>
                    setAutoAssignData({
                      ...autoAssignData,
                      includeAdmin: e.target.checked,
                    })
                  }
                  className="checkbox checkbox-sm"
                />
                <span className="text-sm">Include Admin Users</span>
              </div>

              {/*----------------------------*/}
              {/*      TASKS SECTION         */}
              {/*----------------------------*/}
              <div className="space-y-4">
                <h3 className="font-semibold text-base-content/80">Tasks</h3>

                {autoAssignData.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-base-200 space-y-3"
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">Task #{index + 1}</span>
                      {index > 0 && (
                        <button
                          type="button"
                          className="btn btn-xs btn-error"
                          onClick={() => {
                            setAutoAssignData((prev) => ({
                              ...prev,
                              tasks: prev.tasks.filter((_, i) => i !== index),
                            }));
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm mb-1">Name</label>
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) =>
                          updateTaskField(index, "name", e.target.value)
                        }
                        required
                        className="input input-bordered input-sm w-full"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={task.description}
                        onChange={(e) =>
                          updateTaskField(index, "description", e.target.value)
                        }
                        className="textarea textarea-bordered textarea-sm w-full"
                      />
                    </div>

                    {/* Penalty */}
                    <div>
                      <label className="block text-sm mb-1">Penalty</label>
                      <input
                        type="number"
                        value={task.penalty}
                        onChange={(e) =>
                          updateTaskField(index, "penalty", Number(e.target.value))
                        }
                        className="input input-bordered input-sm w-full"
                      />
                    </div>

                    {/* Frequent */}
                    <div>
                      <label className="block text-sm mb-1">Frequent</label>
                      <select
                        className="select select-bordered select-sm w-full"
                        value={task.frequent}
                        onChange={(e) =>
                          updateTaskField(index, "frequent", Number(e.target.value))
                        }
                      >
                        <option value={1}>Every day</option>
                        <option value={7}>Every week (same weekday)</option>
                      </select>
                    </div>

                  </div>
                ))}

                {/* Add Task Button */}
                <button
                  type="button"
                  onClick={addEmptyTask}
                  className="btn btn-sm btn-outline w-full"
                >
                  + Add New Task
                </button>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button className="btn btn-primary btn-sm" type="submit">
                  Auto Assign
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupCalendarView;
