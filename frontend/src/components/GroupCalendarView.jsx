import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const mockUsers = [
  { id: 1, name: "Alice", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alice" },
  { id: 2, name: "Bob", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Bob" },
  { id: 3, name: "Charlie", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Charlie" },
  { id: 4, name: "Daisy", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Daisy" },
];

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];

const generateMockTasks = (date) => {
  const count = Math.floor(Math.random() * 8);
  const tasks = [];
  for (let i = 0; i < count; i++) {
    const hour = 7 + Math.floor(Math.random() * 10);
    const minute = ["00", "30"][Math.floor(Math.random() * 2)];
    tasks.push({
      id: `${date.toISOString()}-${i}`,
      name: `Task ${i + 1}`,
      time: `${hour}:${minute}`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      assignees: mockUsers.sort(() => 0.5 - Math.random()).slice(0, 2),
    });
  }
  return tasks;
};

const generateMonthCalendar = (year, month) => {
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
        tasks: generateMockTasks(date),
        isCurrentMonth: date.getMonth() === month,
      });
    }
    weeks.push(days);
  }
  return weeks;
};

const GroupCalendarView = ({ group = { name: "My Group" }, onBack }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState(null); // để hiển thị popup

  const calendar = useMemo(
    () => generateMonthCalendar(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="col-span-5 grid grid-cols-5 bg-base-100 relative">
      {/* Calendar */}
      <div className="col-span-4 p-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="btn btn-sm btn-outline">← Back</button>
          <h2 className="text-2xl font-bold text-primary">{group.name} – {monthName}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="btn btn-sm btn-outline"><ChevronLeft /></button>
            <button onClick={nextMonth} className="btn btn-sm btn-outline"><ChevronRight /></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border border-base-300 rounded-md overflow-hidden">
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
            <div
              key={d}
              className="border border-base-300 p-2 text-center font-semibold bg-base-200/80 text-base-content/90"
            >
              {d}
            </div>
          ))}

          {calendar.flat().map((day) => (
            <div
              key={day.date.toISOString()}
              className={`border border-base-300 h-36 relative p-1 flex flex-col text-xs rounded-sm
                ${day.isCurrentMonth ? "bg-base-100/90" : "bg-base-200/50 text-base-content/50"}
                hover:bg-base-300/40 transition-colors`}
            >
              <div className="font-semibold text-right pr-1 text-[11px]">
                {day.date.getDate()}
              </div>

              {/* Tasks */}
              <div className="flex-1 cursor-pointer"
              onClick={() => setSelectedDay(day)}
              >
                {day.tasks.length === 0 ? (
                  <p className="text-center italic text-base-content/40 mt-3">—</p>
                ) : (
                  <>
                    {day.tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="rounded-md px-1 py-[2px] mb-1 text-white text-[11px] truncate shadow-sm"
                        style={{ backgroundColor: "" }}
                        title={`${task.time} – ${task.name}`}
                      >
                        {task.time} {task.name}
                      </div>
                    ))}
                    {day.tasks.length > 3 && (
                      <button
                        onClick={() => setSelectedDay(day)}
                        className="text-[11px] text-primary font-medium hover:underline mt-1"
                      >
                        +{day.tasks.length - 3} more
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member list */}
      <div className="col-span-1 border-l border-base-300 p-4 bg-base-200/40">
        <h3 className="font-semibold mb-3 text-base-content/80">Members</h3>
        <div className="space-y-2">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-base-300/60 transition-colors"
            >
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              <p className="text-sm">{user.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popup hiển thị toàn bộ task */}
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
              <div
                key={task.id}
                className="p-3 mb-3 rounded-lg text-white text-sm shadow-md"
                style={{ backgroundColor: task.color }}
              >
                <div className="font-semibold mb-2">
                  {task.time} – {task.name}
                </div>
                <div className="mb-2">
                  Nội dung task go brrrr =)))))))))))))))))))))))))))))))))))
                </div>
                {/* Danh sách người được phân công */}
                <div className="flex flex-col gap-1 bg-white/10 p-2 rounded-md">
                  {task.assignees.map((a, index) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2 text-white/90"
                    >
                      <img
                        src={a.avatar}
                        alt={a.name}
                        className="w-6 h-6 rounded-full border border-white/50"
                      />
                      <span className="font-medium">{a.name}</span>
                      <span className="text-xs text-white/70 ml-auto italic">
                        {index === 0 ? "Leader" : "Member"}
                      </span>
                      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">Watch evidence</button>
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
