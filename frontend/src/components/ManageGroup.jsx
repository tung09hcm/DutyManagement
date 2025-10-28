import { useState } from "react";

const ManageGroup = ({ group, onBack }) => {
  const [tabContent, setTabContent] = useState("task");

  // --- Dữ liệu mẫu (bạn có thể fetch từ backend sau) ---
  const tasks = [
    {
      id: 1,
      name: "Clean classroom",
      penalty: "Late",
      status: "done",
      description: "Wiped the board and swept floor",
      proof: "img_url",
      penalty_status: "cleared",
      deadline: "2025-10-30",
      createdAt: "2025-10-25",
      updatedAt: "2025-10-26",
    },
  ];

  const users = [
    {
      id: 1,
      email: "john@example.com",
      username: "john123",
      name: "John",
      lastname: "Doe",
      role: "ADMIN"
    },
  ];

  const penalties = [
    {
      id: 1,
      description: "Didn’t attend duty",
      username: "mark12",
      name: "Mark",
      lastname: "Smith",
    },
  ];

  // --- JSX cho từng tab ---
  const renderTaskTab = () => (
    <div className="overflow-x-auto">
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
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name}</td>
              <td>{t.penalty}</td>
              <td>{t.status}</td>
              <td>{t.description}</td>
              <td>
                <a href={`${t.proof}`}>Watch Evidence</a>
              </td>
              <td>{t.penalty_status}</td>
              <td>{t.deadline}</td>
              <td>{t.createdAt}</td>
              <td>{t.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderUserTab = () => (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead className="bg-base-200/80">
          <tr>
            <th>ID</th>
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
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.username}</td>
              <td>{u.name}</td>
              <td>{u.lastname}</td>
              <td>{u.role}</td>
              <td>
                <button className="btn btn-xs btn-outline">
                  Make this user a collaborator?
                </button>
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
          </tr>
        </thead>
        <tbody>
          {penalties.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.description}</td>
              <td>{p.username}</td>
              <td>{p.name}</td>
              <td>{p.lastname}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- JSX chính ---
  return (
    <div className="col-span-5 grid grid-cols-5 bg-base-100 relative">
      <div className="col-span-5 p-4 overflow-y-auto max-h-[calc(100vh-3rem)]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="btn btn-sm btn-outline">
            ← Back
          </button>
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${
                tabContent === "task" ? "btn-active" : "btn-outline"
              }`}
              onClick={() => setTabContent("task")}
            >
              Task
            </button>
            <button
              className={`btn btn-sm ${
                tabContent === "user" ? "btn-active" : "btn-outline"
              }`}
              onClick={() => setTabContent("user")}
            >
              User
            </button>
            <button
              className={`btn btn-sm ${
                tabContent === "penalty" ? "btn-active" : "btn-outline"
              }`}
              onClick={() => setTabContent("penalty")}
            >
              Penalty
            </button>
          </div>
        </div>

        {/* Nội dung tab */}
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
