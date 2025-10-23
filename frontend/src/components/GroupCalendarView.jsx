import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Settings, User} from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import { useUserStore } from "../store/useUserStore";

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

const GroupCalendarView = ({ group, onBack }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState(null);
  const { users, fetchUsers } = useUserStore();
  const { tasks, isLoading, fetchTasks } = useTaskStore();

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
      const date = new Date(t.date); // giả sử backend trả "2025-10-21T00:00:00Z"
      const key = date.toISOString().split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
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
            const key = day.date.toISOString().split("T")[0];
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
          <button className="flex gap-2 items-center w-full justify-center py-2 rounded-lg bg-base-300 hover:bg-base-200 transition-colors mb-2">
            <User className="w-5 h-5"/>
            Manage Users
          </button>
          <button className="flex gap-2 items-center w-full justify-center py-2 rounded-lg bg-base-300 hover:bg-base-200 transition-colors mb-2">
            <Settings className="w-5 h-5"/>
            Settings
          </button>
          <button className="flex items-center gap-2 btn btn-sm bg-primary text-white hover:bg-primary/90 w-full justify-center">
            <i className="lucide lucide-link w-4 h-4" />
            Create Invite Link
          </button>
        </div>
      </div>


      {/* Popup */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-base-100 rounded-lg shadow-lg w-240 max-h-[70vh] overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-base-content/90">
                Tasks – {selectedDay.date.toDateString()}
              </h4>
              <button onClick={() => setSelectedDay(null)} className="btn btn-xs btn-circle">
                <X size={14} />
              </button>
            </div>

            {selectedDay.tasks.map((task) => (
              <div key={task.id} className="p-3 mb-3 rounded-lg text-white text-sm shadow-md" style={{ backgroundColor: task.color }}>
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
                <div className="mb-2">
                  {task.status ? (
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
                </div>
                <div className="flex flex-col gap-1 bg-white/10 p-2 rounded-md">
                  {task.assignees.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-white/90">
                      <img src={a.avatarLink} alt={a.username} className="w-6 h-6 rounded-full border border-white/50" />
                      <span className="font-medium">{a.username}</span>
                      <a href={task.proof} target = "_blank" className="cursor-pointer ml-auto bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500 transition-colors text-xs">
                        Watch evidence
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupCalendarView;
