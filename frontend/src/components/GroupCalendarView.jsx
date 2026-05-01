import { useState, useMemo, useEffect } from "react";
import { useTaskNotification } from "../hooks/useSocket";
import { ChevronLeft, ChevronRight, X, Calendar, Users } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import { useUserStore } from "../store/useUserStore";
import { useGroupStore } from "../store/useGroupStore";
import AssigneeSelect from "./AssigneeSelect";
import toast from "react-hot-toast";

const DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
      days.push({ date, isCurrentMonth: date.getMonth() === month });
    }
    weeks.push(days);
  }
  return weeks;
};

// ─── Skeleton Components ──────────────────────────────────────────────────────
const SkeletonCell = () => (
  <div className="border border-base-300 h-24 md:h-32 p-1 animate-pulse">
    <div className="h-3 w-4 bg-base-300 rounded ml-auto mb-1" />
    <div className="h-4 bg-base-300 rounded mb-1 w-full" />
    <div className="h-4 bg-base-300 rounded w-3/4" />
  </div>
);

const SkeletonMember = () => (
  <div className="flex items-center gap-2 p-2 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-base-300" />
    <div className="flex-1 h-3 bg-base-300 rounded" />
  </div>
);

// ─── Task Status Badge ────────────────────────────────────────────────────────
const TaskStatusBadge = ({ task }) => {
  const isLate =
    new Date(task.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
  if (isLate && !task.status)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded-full">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
        Not done
      </span>
    );
  if (task.status)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded-full">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        Completed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-full">
      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
      Pending
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const GroupCalendarView = ({ group, onBack, manageUser }) => {
  // ✅ Nhận socket notification, task mới sẽ tự động vào store với flag isNew
  useTaskNotification(group?.Organization?.id);

  const [invite_token, setInviteToken] = useState("");
  const today = new Date();
  const [viewDate, setViewDate] = useState(today);
  const [autoAssignFormOpen, setAutoAssignFormOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [addTaskForm, setAddTaskForm] = useState(null);
  const [file, setFile] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  // ✅ Loading state riêng cho từng action
  const [loadingStates, setLoadingStates] = useState({});
  const setLoading = (key, val) =>
    setLoadingStates((prev) => ({ ...prev, [key]: val }));

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    penalty: "",
    deadline: "",
    assigneeIds: [],
  });
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

  const { users, fetchUsers } = useUserStore();
  const {
    tasks,
    isLoading,
    fetchTasks,
    addTask,
    submitTaskProof,
    applyPenalty,
    autoAssign,
    deleteTask,
  } = useTaskStore();
  const { createInviteToken } = useGroupStore();

  useEffect(() => {
    if (!group?.Organization?.id) return;
    const orgId = group.Organization.id;
    fetchTasks(orgId);
    fetchUsers(orgId);
    setSelectedDay(null);
    setAddTaskForm(null);
    setFile(null);
  }, [group?.Organization?.id]);

  const calendar = useMemo(
    () => generateMonthDays(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const date = new Date(t.date);
      // Dùng UTC year/month/date thay vì local
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const prevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const monthName = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // ─── Handlers với loading state ───────────────────────────────────────────
  const handleSubmitEvidence = async (orgId, task_id, task) => {
    if (!file) return toast.error("Please choose an image!");
    setLoading(`proof_${task_id}`, true);
    try {
      const res = await submitTaskProof(orgId, task_id, file);
      await fetchTasks(group.Organization.id);
      setFile(null);
      task.proof = res?.proof;
      task.status = true;
    } finally {
      setLoading(`proof_${task_id}`, false);
    }
  };

  const handleAutoAssignSubmit = async (e) => {
    e.preventDefault();
    setLoading("autoAssign", true);
    try {
      await autoAssign(group.organizationId, autoAssignData);
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
      setAutoAssignFormOpen(false);
      toast.success("Tasks auto-assigned!");
      await fetchTasks(group.Organization.id);
    } catch (err) {
      console.error("Auto assign failed:", err);
    } finally {
      setLoading("autoAssign", false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading("addTask", true);
    try {
      await addTask(formData, group.organizationId);
      await fetchTasks(group.Organization.id);
      setAddTaskForm(null);
      setSelectedDay(null);
      setFormData({
        name: "",
        description: "",
        penalty: "",
        deadline: "",
        assigneeIds: [],
      });
    } catch (err) {
      console.error("Add task failed:", err);
    } finally {
      setLoading("addTask", false);
    }
  };

  const handleApplyPenalty = async (
    orgId,
    taskId,
    userIds,
    taskPenalty,
    task,
  ) => {
    setLoading(`penalty_${taskId}`, true);
    try {
      task.penalty_status = 1;
      await applyPenalty(orgId, taskId, userIds, taskPenalty);
    } catch (error) {
      console.error("Apply penalty failed:", error);
    } finally {
      setLoading(`penalty_${taskId}`, false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setLoading(`delete_${taskId}`, true);
    try {
      await deleteTask(group.organizationId, taskId);
      setSelectedDay((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      }));
    } finally {
      setLoading(`delete_${taskId}`, false);
    }
  };

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

  const updateTaskField = (index, field, value) => {
    setAutoAssignData((prev) => {
      const updatedTasks = [...prev.tasks];
      updatedTasks[index] = { ...updatedTasks[index], [field]: value };
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleCopyInvite = async () => {
    const res = await createInviteToken(group.organizationId);
    try {
      if (res?.inviteToken) {
        await navigator.clipboard.writeText(res.inviteToken);
        toast.success("Copied invite link!");
      }
    } catch {
      setInviteToken(res?.inviteToken || "");
    }
  };

  return (
    <div className="col-span-5 flex flex-col md:grid md:grid-cols-5 bg-base-100 relative min-h-0">
      {/* ── Calendar Panel ──────────────────────────────────────────────────── */}
      <div className="md:col-span-4 flex flex-col overflow-y-auto max-h-[calc(100vh-3.5rem)] p-2 md:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="btn btn-sm btn-ghost rounded-xl gap-1"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <h2 className="text-base md:text-xl font-bold text-primary truncate flex-1 text-center">
            <span className="hidden sm:inline">
              {group.Organization?.name} –{" "}
            </span>
            {monthName}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowMembers(true)}
              className="btn btn-sm btn-ghost rounded-xl md:hidden"
            >
              <Users size={16} />
            </button>
            <button
              onClick={prevMonth}
              className="btn btn-sm btn-ghost rounded-xl"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextMonth}
              className="btn btn-sm btn-ghost rounded-xl"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border border-base-300 rounded-xl overflow-hidden text-xs flex-1">
          {DAYS_FULL.map((d) => (
            <div
              key={d}
              className="border border-base-300 p-1 md:p-2 text-center font-semibold bg-base-200/80 text-base-content/70 text-[10px] md:text-xs"
            >
              {d}
            </div>
          ))}

          {isLoading
            ? Array.from({ length: 42 }).map((_, i) => <SkeletonCell key={i} />)
            : calendar.flat().map((day) => {
                const key = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`;
                const dayTasks = tasksByDate[key] || [];
                const isToday = key === today.toLocaleDateString("en-CA");
                // ✅ Cell highlight vàng nếu có task mới trong ngày
                const hasNewTask = dayTasks.some((t) => t.isNew);

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedDay({ ...day, tasks: dayTasks })}
                    className={`border border-base-300 h-20 md:h-32 relative p-0.5 md:p-1 flex flex-col cursor-pointer hover:bg-base-200/50 transition-colors
                      ${!day.isCurrentMonth ? "opacity-40" : ""}
                      ${isToday ? "bg-primary/5" : ""}
                      ${hasNewTask ? "bg-yellow-50 border-yellow-300" : ""}
                    `}
                  >
                    {/* ✅ Badge "NEW" trên góc ô nếu có task mới */}
                    {hasNewTask && (
                      <span className="absolute top-0.5 left-0.5 text-[8px] font-bold bg-yellow-400 text-yellow-900 px-1 rounded-sm leading-tight animate-pulse">
                        NEW
                      </span>
                    )}
                    <div
                      className={`font-bold text-right pr-0.5 md:pr-1 text-[10px] md:text-[11px] ${isToday ? "text-primary" : ""}`}
                    >
                      {isToday ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-content text-[10px]">
                          {day.date.getDate()}
                        </span>
                      ) : (
                        day.date.getDate()
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`rounded px-0.5 md:px-1 py-[1px] mb-0.5 text-white text-[9px] md:text-[10px] truncate shadow-sm
                            ${task.isNew ? "ring-1 ring-yellow-300" : ""}
                          `}
                          // ✅ Task mới hiển thị màu vàng/cam thay vì màu gốc
                          style={{
                            backgroundColor: task.isNew
                              ? "#f59e0b"
                              : task.color || "#3b82f6",
                          }}
                        >
                          <span className="hidden md:inline">{task.time} </span>
                          {task.isNew && "🆕 "}
                          {task.name}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[9px] md:text-[10px] text-primary font-semibold pl-0.5">
                          +{dayTasks.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* ── Members Sidebar (desktop) / Drawer (mobile) ──────────────────────── */}
      {showMembers && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMembers(false)}
          />
          <div className="relative ml-auto w-72 h-full bg-base-100 flex flex-col p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Members</h3>
              <button
                onClick={() => setShowMembers(false)}
                className="btn btn-xs btn-circle"
              >
                <X size={12} />
              </button>
            </div>
            <MembersList users={users} isLoading={isLoading} />
            <MemberActions
              group={group}
              manageUser={manageUser}
              setAutoAssignFormOpen={setAutoAssignFormOpen}
              onCopyInvite={handleCopyInvite}
            />
          </div>
        </div>
      )}

      <div className="hidden md:flex md:col-span-1 border-l border-base-300 flex-col p-3 bg-base-200/30 max-h-[calc(100vh-3.5rem)] overflow-hidden">
        <h3 className="font-semibold mb-3 text-sm text-base-content/70 flex items-center gap-1">
          <Users size={14} /> Members
        </h3>
        <div className="flex-1 overflow-y-auto space-y-1">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonMember key={i} />)
          ) : (
            <MembersList users={users} />
          )}
        </div>
        <MemberActions
          group={group}
          manageUser={manageUser}
          setAutoAssignFormOpen={setAutoAssignFormOpen}
          onCopyInvite={handleCopyInvite}
        />
      </div>

      {/* ── Invite Token Fallback ─────────────────────────────────────────────── */}
      {invite_token && (
        <Modal title="Invite Token" onClose={() => setInviteToken("")}>
          <p className="text-sm break-all font-mono bg-base-200 p-3 rounded-lg">
            {invite_token}
          </p>
        </Modal>
      )}

      {/* ── Day Tasks Popup ───────────────────────────────────────────────────── */}
      {selectedDay && (
        <Modal
          title={`Tasks – ${selectedDay.date.toDateString()}`}
          onClose={() => setSelectedDay(null)}
        >
          {selectedDay.tasks.length === 0 && (
            <div className="text-center py-6 text-base-content/40">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tasks for this day</p>
            </div>
          )}

          <div className="space-y-3">
            {selectedDay.tasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-2xl p-3 text-white text-sm shadow-md relative overflow-hidden
                  ${task.isNew ? "ring-2 ring-yellow-300" : ""}
                `}
                style={{
                  backgroundColor: task.isNew
                    ? "#f59e0b"
                    : task.color || "#3b82f6",
                }}
              >
                {/* ✅ Badge NEW trong modal */}
                {task.isNew && (
                  <span className="absolute top-2 left-2 text-[9px] font-bold bg-white text-yellow-600 px-1.5 py-0.5 rounded-full">
                    🆕 Mới
                  </span>
                )}

                {group.role === "ADMIN" && (
                  <button
                    disabled={loadingStates[`delete_${task.id}`]}
                    className={`absolute top-2 right-2 btn btn-xs border-0 text-white
                      ${
                        loadingStates[`delete_${task.id}`]
                          ? "bg-gray-400/50 cursor-not-allowed"
                          : "bg-white/20 hover:bg-white/30"
                      }`}
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    {loadingStates[`delete_${task.id}`] ? "..." : "Delete"}
                  </button>
                )}

                <div
                  className={`font-semibold mb-1 pr-16 ${task.isNew ? "mt-5" : ""}`}
                >
                  {task.time} – {task.name}
                </div>
                {task.description && (
                  <div className="text-white/80 text-xs mb-1">
                    {task.description}
                  </div>
                )}
                {task.penalty && (
                  <div className="text-white/70 text-xs mb-2">
                    ⚠️ Penalty: {task.penalty}
                  </div>
                )}

                {/* Status & actions */}
                <div className="flex flex-wrap gap-2 mb-2 items-center">
                  <TaskStatusBadge task={task} />

                  {task.proof && (
                    <a
                      href={task.proof}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full text-xs transition-colors"
                    >
                      View Proof
                    </a>
                  )}

                  {/* Upload proof */}
                  {new Date(task.date).setHours(0, 0, 0, 0) ===
                    new Date().setHours(0, 0, 0, 0) &&
                    task.assignees?.some((u) => u.id === group.userId) &&
                    !task.proof && (
                      <div className="flex gap-2 flex-wrap items-center">
                        <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full text-xs">
                          {file
                            ? `📎 ${file.name.slice(0, 12)}…`
                            : "Choose Image"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        {/* ✅ Upload button với loading */}
                        <button
                          disabled={!file || loadingStates[`proof_${task.id}`]}
                          onClick={() =>
                            handleSubmitEvidence(
                              group.organizationId,
                              task.id,
                              task,
                            )
                          }
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all
                            ${
                              loadingStates[`proof_${task.id}`]
                                ? "bg-gray-400 text-gray-100 cursor-not-allowed opacity-70"
                                : file
                                  ? "bg-white text-blue-600 hover:bg-white/90"
                                  : "bg-white/10 opacity-50 cursor-not-allowed"
                            }`}
                        >
                          {loadingStates[`proof_${task.id}`]
                            ? "Uploading..."
                            : "Upload"}
                        </button>
                      </div>
                    )}

                  {/* ✅ Apply Penalty button với loading */}
                  {!task.penalty_status &&
                    !task.proof &&
                    new Date(selectedDay.date).setHours(0, 0, 0, 0) <
                      new Date().setHours(0, 0, 0, 0) &&
                    group.role === "ADMIN" && (
                      <button
                        disabled={loadingStates[`penalty_${task.id}`]}
                        onClick={() =>
                          handleApplyPenalty(
                            group.organizationId,
                            task.id,
                            task.assignees,
                            task.penalty,
                            task,
                          )
                        }
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all
                          ${
                            loadingStates[`penalty_${task.id}`]
                              ? "bg-gray-400 text-gray-100 cursor-not-allowed opacity-70"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                      >
                        {loadingStates[`penalty_${task.id}`]
                          ? "Applying..."
                          : "Apply Penalty"}
                      </button>
                    )}
                </div>

                {/* Assignees */}
                <div className="bg-white/10 rounded-xl p-2 space-y-1.5">
                  {task.assignees?.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-xs">
                      <img
                        src={a.avatarLink}
                        alt={a.username}
                        className="w-6 h-6 rounded-full border border-white/40 object-cover"
                      />
                      <span>{a.username}</span>
                      {task.penalty_status && (
                        <span className="ml-auto text-yellow-200 text-[10px] font-semibold">
                          ⚡ Penalized
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {new Date(selectedDay.date).setHours(0, 0, 0, 0) >=
            new Date().setHours(0, 0, 0, 0) &&
            (group.role === "ADMIN" || group.role === "COLLABORATOR") && (
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setAddTaskForm(selectedDay);
                }}
                className="mt-3 w-full btn btn-sm btn-outline rounded-xl"
              >
                + Add Task
              </button>
            )}
        </Modal>
      )}

      {/* ── Add Task Form ─────────────────────────────────────────────────────── */}
      {addTaskForm && (
        <Modal
          title={`Add Task – ${addTaskForm.date.toDateString()}`}
          onClose={() => setAddTaskForm(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormField label="Task Name">
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full input input-bordered input-sm rounded-xl"
                placeholder="Task name"
                required
              />
            </FormField>
            <FormField label="Description">
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full textarea textarea-bordered textarea-sm rounded-xl"
                rows={2}
                placeholder="Description"
              />
            </FormField>
            <FormField label="Penalty">
              <input
                type="text"
                value={formData.penalty}
                onChange={(e) =>
                  setFormData({ ...formData, penalty: e.target.value })
                }
                className="w-full input input-bordered input-sm rounded-xl"
                placeholder="e.g. Clean the room"
              />
            </FormField>
            <FormField label="Deadline">
              <input
                type="time"
                step="60"
                value={
                  formData.deadline
                    ? formData.deadline.split(" ")[1]?.slice(0, 5)
                    : ""
                }
                onChange={(e) => {
                  const d = new Date(addTaskForm.date);
                  const [h, m] = e.target.value.split(":");
                  const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${h}:${m}`;
                  setFormData({ ...formData, deadline: s });
                }}
                className="w-full input input-bordered input-sm rounded-xl"
              />
            </FormField>
            <AssigneeSelect
              users={users}
              formData={formData}
              setFormData={setFormData}
            />
            <div className="flex justify-end pt-1">
              {/* ✅ Save Task button với loading */}
              <button
                type="submit"
                disabled={loadingStates["addTask"]}
                className={`btn btn-sm rounded-xl px-6 transition-all
                  ${
                    loadingStates["addTask"]
                      ? "bg-gray-400 text-gray-100 cursor-not-allowed border-0"
                      : "btn-primary"
                  }`}
              >
                {loadingStates["addTask"] ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs" />
                    Saving...
                  </span>
                ) : (
                  "Save Task"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Auto Assign Form ──────────────────────────────────────────────────── */}
      {autoAssignFormOpen && (
        <Modal
          title="Auto Assign Tasks"
          onClose={() => setAutoAssignFormOpen(false)}
          wide
        >
          <form onSubmit={handleAutoAssignSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Begin Date">
                <input
                  type="date"
                  value={autoAssignData.begin}
                  onChange={(e) =>
                    setAutoAssignData({
                      ...autoAssignData,
                      begin: e.target.value,
                    })
                  }
                  required
                  className="input input-bordered input-sm rounded-xl w-full"
                />
              </FormField>
              <FormField label="End Date">
                <input
                  type="date"
                  value={autoAssignData.end}
                  onChange={(e) =>
                    setAutoAssignData({
                      ...autoAssignData,
                      end: e.target.value,
                    })
                  }
                  required
                  className="input input-bordered input-sm rounded-xl w-full"
                />
              </FormField>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAssignData.includeAdmin}
                onChange={(e) =>
                  setAutoAssignData({
                    ...autoAssignData,
                    includeAdmin: e.target.checked,
                  })
                }
                className="checkbox checkbox-sm checkbox-primary"
              />
              <span className="text-sm">Include Admin Users</span>
            </label>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-base-content/70">
                Tasks
              </h4>
              {autoAssignData.tasks.map((task, index) => (
                <div
                  key={index}
                  className="p-3 border border-base-300 rounded-xl bg-base-200/50 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-base-content/70">
                      Task #{index + 1}
                    </span>
                    {index > 0 && (
                      <button
                        type="button"
                        className="btn btn-xs btn-error rounded-lg"
                        onClick={() =>
                          setAutoAssignData((prev) => ({
                            ...prev,
                            tasks: prev.tasks.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={task.name}
                    placeholder="Task name"
                    required
                    onChange={(e) =>
                      updateTaskField(index, "name", e.target.value)
                    }
                    className="input input-bordered input-sm rounded-xl w-full"
                  />
                  <textarea
                    rows={2}
                    value={task.description}
                    placeholder="Description"
                    onChange={(e) =>
                      updateTaskField(index, "description", e.target.value)
                    }
                    className="textarea textarea-bordered textarea-sm rounded-xl w-full"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={task.penalty}
                      placeholder="Penalty"
                      onChange={(e) =>
                        updateTaskField(
                          index,
                          "penalty",
                          Number(e.target.value),
                        )
                      }
                      className="input input-bordered input-sm rounded-xl w-full"
                    />
                    <select
                      value={task.frequent}
                      onChange={(e) =>
                        updateTaskField(
                          index,
                          "frequent",
                          Number(e.target.value),
                        )
                      }
                      className="select select-bordered select-sm rounded-xl w-full"
                    >
                      <option value={1}>Every day</option>
                      <option value={7}>Every week</option>
                    </select>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEmptyTask}
                className="btn btn-sm btn-outline rounded-xl w-full"
              >
                + Add Task
              </button>
            </div>

            <div className="flex justify-end">
              {/* ✅ Auto Assign button với loading */}
              <button
                type="submit"
                disabled={loadingStates["autoAssign"]}
                className={`btn btn-sm rounded-xl px-6 transition-all
                  ${
                    loadingStates["autoAssign"]
                      ? "bg-gray-400 text-gray-100 cursor-not-allowed border-0"
                      : "btn-primary"
                  }`}
              >
                {loadingStates["autoAssign"] ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs" />
                    Assigning...
                  </span>
                ) : (
                  "Auto Assign"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4">
    <div
      className={`bg-base-100 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full ${wide ? "sm:max-w-lg" : "sm:max-w-md"} max-h-[90vh] overflow-y-auto`}
    >
      <div className="flex justify-between items-center p-4 border-b border-base-200 sticky top-0 bg-base-100 rounded-t-3xl sm:rounded-t-2xl z-10">
        <h4 className="font-bold text-sm">{title}</h4>
        <button onClick={onClose} className="btn btn-xs btn-circle btn-ghost">
          <X size={14} />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-base-content/60 mb-1">
      {label}
    </label>
    {children}
  </div>
);

const MembersList = ({ users, isLoading }) => {
  if (!users?.length)
    return (
      <p className="text-xs italic text-base-content/50 p-2">No members</p>
    );
  return users.map((u) => (
    <div
      key={u.id}
      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-base-300/50 transition-colors"
    >
      <img
        src={u.avatarLink}
        alt={u.username}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      <p className="text-xs truncate flex-1">{u.username}</p>
      <span
        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0 ${
          u.UserOrgTask.role === "ADMIN"
            ? "bg-red-50 text-red-600 border-red-300"
            : u.UserOrgTask.role === "COLLABORATOR"
              ? "bg-blue-50 text-blue-600 border-blue-300"
              : "bg-green-50 text-green-600 border-green-300"
        }`}
      >
        {u.UserOrgTask.role.slice(0, 4)}
      </span>
    </div>
  ));
};

const MemberActions = ({
  group,
  manageUser,
  setAutoAssignFormOpen,
  onCopyInvite,
}) => (
  <div className="border-t border-base-200 pt-3 mt-3 flex flex-col gap-2">
    <ActionBtn onClick={manageUser}>Group Info</ActionBtn>
    {group.role === "ADMIN" && (
      <ActionBtn onClick={() => setAutoAssignFormOpen(true)}>
        Auto Assignment
      </ActionBtn>
    )}
    <ActionBtn onClick={onCopyInvite}>Create Invite Link</ActionBtn>
  </div>
);

const ActionBtn = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-full py-2 px-3 rounded-xl bg-base-200 hover:bg-base-300 transition-colors text-xs font-medium text-left"
  >
    {children}
  </button>
);

export default GroupCalendarView;
