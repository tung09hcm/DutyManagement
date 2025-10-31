import { useState, useEffect } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { useUserStore } from "../store/useUserStore";
import { usePenaltyStore } from "../store/usePenaltyStore";
import { useGroupStore } from "../store/useGroupStore";

const ManageGroup = ({ group, onBack }) => {
  const [tabContent, setTabContent] = useState("penalty");
  const [loadedTabs, setLoadedTabs] = useState({ task: false, user: false, penalty: false });

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
    };

    // Chỉ fetch nếu tab chưa được load
    if (!loadedTabs[tabContent]) {
      console.log(`⚙️ Fetching ${tabContent} data...`);
      fetchMap[tabContent](orgId).then(() =>
        setLoadedTabs((prev) => ({ ...prev, [tabContent]: true }))
      );
    }
  }, [tabContent, group]);

  // ================= TAB RENDER =================
  const renderTaskTab = () => (
    <div className="overflow-x-auto">
      {tasks.length === 0 ? (
        <div className="p-4 text-center text-gray-500 italic">
          {loadedTabs.task ? "No tasks found." : "Loading tasks..."}
        </div>
      ) : (
        <table className="table w-full">
          <thead className="bg-base-200/80">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Penalty</th>
              <th>Status</th>
              <th>Description</th>
              <th>Proof</th>
              <th>Penalty Status</th>
              <th>Deadline</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const isLate = new Date(t.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
              return (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.penalty}</td>
                  <td>
                    {isLate && !t.status ? (
                      <span className="badge badge-error badge-outline">Not done</span>
                    ) : t.status ? (
                      <span className="badge badge-success badge-outline">Completed</span>
                    ) : (
                      <span className="badge badge-warning badge-outline">Pending</span>
                    )}
                  </td>
                  <td>{t.description || "—"}</td>
                  <td>
                    {t.proof ? (
                      <a
                        href={t.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-xs btn-primary"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {t.penalty_status ? (
                      <div className="bg-yellow-600 text-white px-2 py-1 rounded transition-colors text-xs">Penalty Applied !!!</div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{t.deadline || "—"}</td>
                  <td>{t.createdAt || "—"}</td>
                  <td>{t.updatedAt || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderUserTab = () => (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead className="bg-base-200/80">
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Name</th>
            <th>Lastname</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="flex items-center gap-4 p-2">
                <img
                  src={u.avatarLink}
                  alt={u.username}
                  className="w-6 h-6 rounded-full border border-white/50"
                />
                <span>{u.email}</span>
              </td>
              <td>{u.username}</td>
              <td>{u.name || "__"}</td>
              <td>{u.lastname || "__"}</td>
              <td >
                <div className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-md
                    ${
                      u.UserOrgTask.role === "ADMIN"
                        ? "bg-red-100 text-red-700 border border-red-400"
                        : u.UserOrgTask.role === "COLLABORATOR"
                        ? "bg-blue-100 text-blue-700 border border-blue-400"
                        : "bg-green-100 text-green-700 border border-green-400"
                    }`}>
                    {u.UserOrgTask.role}
                </div>
              </td>
              <td>
                <button 
                onClick={ () =>
                  editUserRole(group.organizationId, u.id)
                }
                className="btn btn-xs btn-outline">Promote to collaborator</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPenaltyTab = () => (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead className="bg-base-200/80">
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Username</th>
            <th>Name</th>
            <th>Lastname</th>
            <th>Task Name</th>
            <th>Task Description</th>
          </tr>
        </thead>
        <tbody>
          {penalties.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center italic text-gray-500">
                {loadedTabs.penalty ? "No penalties found." : "Loading penalties..."}
              </td>
            </tr>
          ) : (
            penalties.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.description}</td>
                <td>{p.User?.username || "__"}</td>
                <td>{p.User?.name || "__"}</td>
                <td>{p.User?.lastname || "__"}</td>
                <td>{p.Task?.description || "__"}</td>
                <td>{p.Task?.name || "__"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ================= RENDER MAIN =================
  return (
    <div className="col-span-5 grid grid-cols-5 bg-base-100 relative">
      <div className="col-span-5 p-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="btn btn-sm btn-outline">
            ← Back
          </button>
          <div className="flex gap-2">
            {["task", "user", "penalty"].map((tab) => (
              <button
                key={tab}
                className={`btn btn-sm ${
                  tabContent === tab ? "btn-active" : "btn-outline"
                }`}
                onClick={() => setTabContent(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="mt-4">
          {tabContent === "task" && renderTaskTab()}
          {tabContent === "user" && renderUserTab()}
          {tabContent === "penalty" && renderPenaltyTab()}
        </div>
      </div>
    </div>
  );
};

export default ManageGroup;
