import { useState, useEffect } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { useUserStore } from "../store/useUserStore";
import { usePenaltyStore } from "../store/usePenaltyStore";
import { useGroupStore } from "../store/useGroupStore";
import {
  Trophy,
  Medal,
  Star,
  Users,
  ClipboardList,
  AlertTriangle,
  ChevronLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Crown,
  Award,
  TrendingUp,
} from "lucide-react";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i}>
        <div className="h-4 bg-base-300 rounded w-full" />
      </td>
    ))}
  </tr>
);

const SkeletonCard = () => (
  <div className="animate-pulse bg-base-200 rounded-2xl p-4 flex items-center gap-3">
    <div className="w-12 h-12 rounded-full bg-base-300" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-base-300 rounded w-1/2" />
      <div className="h-2 bg-base-300 rounded w-1/3" />
    </div>
    <div className="w-8 h-8 bg-base-300 rounded-full" />
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ task }) => {
  const isLate =
    new Date(task.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
  if (isLate && !task.status)
    return (
      <span className="badge badge-error badge-sm gap-1">
        <XCircle size={10} />
        Not done
      </span>
    );
  if (task.status)
    return (
      <span className="badge badge-success badge-sm gap-1">
        <CheckCircle2 size={10} />
        Done
      </span>
    );
  return (
    <span className="badge badge-warning badge-sm gap-1">
      <Clock size={10} />
      Pending
    </span>
  );
};

// ─── Rank Medal ───────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  if (rank === 1)
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-lg">
        <Crown size={18} className="text-white" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md">
        <Medal size={16} className="text-white" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-md">
        <Award size={16} className="text-white" />
      </div>
    );
  return (
    <div className="w-9 h-9 rounded-full bg-base-300 flex items-center justify-center text-sm font-bold text-base-content/60">
      {rank}
    </div>
  );
};

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────
const LeaderboardTab = ({ users, loading }) => {
  const ranked = [...(users || [])].sort(
    (a, b) => (b.taskStats?.done ?? 0) - (a.taskStats?.done ?? 0),
  );

  const maxDone = ranked[0]?.taskStats?.done || 1;

  return (
    <div className="space-y-4">
      {/* Top 3 podium */}
      {ranked.length >= 3 && (
        <div className="flex items-end justify-center gap-2 md:gap-4 pt-4 pb-2">
          {/* 2nd */}
          <PodiumCard user={ranked[1]} rank={2} height="h-24 md:h-28" />
          {/* 1st */}
          <PodiumCard
            user={ranked[0]}
            rank={1}
            height="h-32 md:h-36"
            highlight
          />
          {/* 3rd */}
          <PodiumCard user={ranked[2]} rank={3} height="h-20 md:h-24" />
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-semibold text-base-content/60 flex items-center gap-1">
          <TrendingUp size={14} /> Full Rankings
        </h3>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : ranked.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  i === 0
                    ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10"
                    : i === 1
                      ? "border-gray-300 bg-gray-50 dark:bg-gray-900/10"
                      : i === 2
                        ? "border-orange-300 bg-orange-50 dark:bg-orange-900/10"
                        : "border-base-200 bg-base-100 hover:bg-base-200/50"
                }`}
              >
                <RankBadge rank={i + 1} />
                <img
                  src={u.avatarLink}
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-base-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{u.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-base-300 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                        style={{
                          width: `${((u.taskStats?.done ?? 0) / maxDone) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-primary">
                    {u.taskStats?.done ?? 0}
                  </div>
                  <div className="text-[10px] text-base-content/50">
                    tasks done
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

const PodiumCard = ({ user, rank, height, highlight }) => (
  <div
    className={`flex flex-col items-center gap-1 w-20 md:w-24 ${highlight ? "scale-105" : ""}`}
  >
    <img
      src={user.avatarLink}
      alt={user.username}
      className={`w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-4 ${
        rank === 1
          ? "border-yellow-400 shadow-lg shadow-yellow-200"
          : rank === 2
            ? "border-gray-300"
            : "border-orange-300"
      }`}
    />
    <p className="text-xs font-semibold text-center truncate w-full px-1">
      {user.username}
    </p>
    <div className="text-xs font-bold text-primary">
      {user.taskStats?.done ?? 0}
    </div>
    <div
      className={`w-full ${height} rounded-t-xl flex items-center justify-center ${
        rank === 1
          ? "bg-gradient-to-t from-yellow-400 to-yellow-300"
          : rank === 2
            ? "bg-gradient-to-t from-gray-300 to-gray-200"
            : "bg-gradient-to-t from-orange-400 to-orange-300"
      }`}
    >
      <RankBadge rank={rank} />
    </div>
  </div>
);

// ─── Tasks Tab ────────────────────────────────────────────────────────────────
const TasksTab = ({ tasks, loading }) => (
  <div className="space-y-2">
    {loading ? (
      Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-base-200 rounded-xl p-3 flex gap-3"
        >
          <div className="w-2 h-16 rounded-full bg-base-300" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-base-300 rounded w-1/3" />
            <div className="h-2 bg-base-300 rounded w-2/3" />
            <div className="h-2 bg-base-300 rounded w-1/4" />
          </div>
        </div>
      ))
    ) : tasks.length === 0 ? (
      <EmptyState icon={<ClipboardList size={32} />} text="No tasks found" />
    ) : (
      tasks.map((t) => (
        <div
          key={t.id}
          className="bg-base-100 border border-base-200 rounded-2xl p-3 flex gap-3 hover:border-primary/30 transition-colors"
        >
          <div
            className="w-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: t.color || "#3b82f6" }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="font-semibold text-sm">{t.name}</p>
              <StatusBadge task={t} />
            </div>
            {t.description && (
              <p className="text-xs text-base-content/50 mt-0.5 truncate">
                {t.description}
              </p>
            )}
            <div className="flex gap-3 mt-1.5 text-xs text-base-content/50 flex-wrap">
              {t.penalty && <span className="text-error">⚠️ {t.penalty}</span>}
              {t.deadline && <span>🕐 {t.deadline}</span>}
              {t.penalty_status ? (
                <span className="text-yellow-600 font-medium">
                  ⚡ Penalized
                </span>
              ) : null}
              {t.proof && (
                <a
                  href={t.proof}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary flex items-center gap-0.5 hover:underline"
                >
                  <ExternalLink size={10} /> Proof
                </a>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

// ─── Users Tab ────────────────────────────────────────────────────────────────
const UsersTab = ({ users, loading, group, editUserRole }) => (
  <div className="space-y-2">
    {loading
      ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
      : users.map((u) => (
          <div
            key={u.id}
            className="bg-base-100 border border-base-200 rounded-2xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors flex-wrap md:flex-nowrap"
          >
            <img
              src={u.avatarLink}
              alt={u.username}
              className="w-11 h-11 rounded-full object-cover border-2 border-base-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{u.username}</p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    u.UserOrgTask.role === "ADMIN"
                      ? "bg-red-50 text-red-600 border-red-300"
                      : u.UserOrgTask.role === "COLLABORATOR"
                        ? "bg-blue-50 text-blue-600 border-blue-300"
                        : "bg-green-50 text-green-600 border-green-300"
                  }`}
                >
                  {u.UserOrgTask.role}
                </span>
              </div>
              <p className="text-xs text-base-content/50 truncate">{u.email}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-base-content/50">
                <span className="text-green-600 font-medium">
                  ✓ {u.taskStats?.done ?? 0} done
                </span>
              </div>
            </div>
            {group.role === "ADMIN" && (
              <button
                onClick={() => editUserRole(group.organizationId, u.id)}
                className="btn btn-xs btn-outline rounded-xl flex-shrink-0 whitespace-nowrap text-[10px]"
              >
                Promote
              </button>
            )}
          </div>
        ))}
  </div>
);

// ─── Penalties Tab ────────────────────────────────────────────────────────────
const PenaltiesTab = ({ penalties, loading }) => (
  <div className="space-y-2">
    {loading ? (
      Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-base-200 rounded-xl p-3 h-16"
        />
      ))
    ) : penalties.length === 0 ? (
      <EmptyState
        icon={<AlertTriangle size={32} />}
        text="No penalties found"
      />
    ) : (
      penalties.map((p) => (
        <div
          key={p.id}
          className="bg-base-100 border border-error/20 rounded-2xl p-3 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-error" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-error truncate">
              {p.description}
            </p>
            <div className="text-xs text-base-content/50 mt-0.5 flex gap-3 flex-wrap">
              <span>👤 {p.User?.username || "Unknown"}</span>
              {p.Task?.name && <span>📋 {p.Task.name}</span>}
            </div>
          </div>
          <span className="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded-xl flex-shrink-0">
            #{p.id}
          </span>
        </div>
      ))
    )}
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center py-16 text-base-content/30">
    <div className="mb-3 opacity-50">{icon}</div>
    <p className="text-sm">{text}</p>
  </div>
);

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "user", label: "Members", icon: Users },
  { key: "task", label: "Tasks", icon: ClipboardList },
  { key: "penalty", label: "Penalties", icon: AlertTriangle },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageGroup = ({ group, onBack }) => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [loadedTabs, setLoadedTabs] = useState({
    task: false,
    user: false,
    penalty: false,
    leaderboard: false,
  });
  const [tabLoading, setTabLoading] = useState(false);

  const { tasks, fetchTasks } = useTaskStore();
  const { users, fetchUsers } = useUserStore();
  const { penalties, fetchPenalties } = usePenaltyStore();
  const { editUserRole } = useGroupStore();

  useEffect(() => {
    const orgId = group?.Organization?.id;
    if (!orgId) return;

    const fetchMap = {
      task: fetchTasks,
      user: fetchUsers,
      penalty: fetchPenalties,
      leaderboard: fetchUsers,
    };

    const tabKey = activeTab === "leaderboard" ? "user" : activeTab;

    if (!loadedTabs[tabKey]) {
      setTabLoading(true);
      fetchMap[activeTab](orgId).then(() => {
        setLoadedTabs((prev) => ({ ...prev, [tabKey]: true }));
        setTabLoading(false);
      });
    }
  }, [activeTab, group]);

  // Stats summary
  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status).length,
    pending: tasks.filter((t) => !t.status).length,
    penalties: penalties.length,
  };

  return (
    <div className="col-span-5 bg-base-100 flex flex-col max-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-base-200 bg-base-100 sticky top-0 z-10">
        <div className="flex items-center gap-3 p-3 md:p-4">
          <button
            onClick={onBack}
            className="btn btn-sm btn-ghost rounded-xl gap-1 flex-shrink-0"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={group.Organization?.avatarLink}
              alt={group.Organization?.name}
              className="w-8 h-8 rounded-full object-cover border border-base-300 flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-bold text-sm md:text-base truncate">
                {group.Organization?.name}
              </h2>
              <p className="text-xs text-base-content/50 truncate hidden sm:block">
                {group.Organization?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {loadedTabs.task && (
          <div className="flex divide-x divide-base-200 border-t border-base-200 text-center">
            {[
              { label: "Total", value: stats.total, color: "text-primary" },
              { label: "Done", value: stats.done, color: "text-success" },
              { label: "Pending", value: stats.pending, color: "text-warning" },
              {
                label: "Penalties",
                value: stats.penalties,
                color: "text-error",
              },
            ].map((s) => (
              <div key={s.label} className="flex-1 py-2">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-base-content/50">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto border-t border-base-200 scrollbar-hide">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                activeTab === key
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-base-content/50 hover:text-base-content hover:bg-base-200/50"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {activeTab === "leaderboard" && (
          <LeaderboardTab users={users} loading={tabLoading} />
        )}
        {activeTab === "task" && (
          <TasksTab tasks={tasks} loading={tabLoading} />
        )}
        {activeTab === "user" && (
          <UsersTab
            users={users}
            loading={tabLoading}
            group={group}
            editUserRole={editUserRole}
          />
        )}
        {activeTab === "penalty" && (
          <PenaltiesTab penalties={penalties} loading={tabLoading} />
        )}
      </div>
    </div>
  );
};

export default ManageGroup;
