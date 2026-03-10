import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import {
  LogOut,
  User,
  X,
  Pencil,
  BrushCleaning,
  ChevronRight,
  ArrowLeft,
  Menu,
} from "lucide-react";
import GroupCalendarView from "../components/GroupCalendarView";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ManageGroup from "../components/ManageGroup";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonGroup = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-base-300 flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-base-300 rounded w-2/3" />
      <div className="h-2 bg-base-300 rounded w-1/2" />
    </div>
  </div>
);

// ─── Docs Page ────────────────────────────────────────────────────────────────
const DocsPage = ({ onBack }) => (
  <div className="min-h-screen bg-base-100 p-4 md:p-8">
    <button
      onClick={onBack}
      className="btn btn-sm btn-ghost rounded-xl mb-6 flex items-center gap-2"
    >
      <ArrowLeft size={16} /> Back
    </button>
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <BrushCleaning size={28} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-primary">CleanUp Guide 🌿</h1>
        <p className="text-base-content/60 mt-2">Everything you need to know</p>
      </div>

      {[
        {
          title: "1. Getting Started",
          content:
            "CleanUp helps you manage cleaning groups, assign duties, and track schedules visually. Create a group or join one with an invite code.",
        },
        {
          title: "2. Managing Groups",
          content:
            "Select a group from the sidebar to open its calendar. Admins can create tasks, auto-assign duties, and manage members.",
        },
        {
          title: "3. The Calendar",
          content:
            "Each cell represents a day. Tap a day to see tasks, upload proof of completion, or apply penalties for missed duties.",
        },
        {
          title: "4. Rankings",
          content:
            "Inside Group Info → Leaderboard tab you can see who completed the most tasks. Keep up the good work! 🏆",
        },
        {
          title: "5. Tips 🌱",
          content:
            "Use the Auto Assignment feature to automatically distribute recurring tasks across all members. Share invite links to grow your group.",
        },
      ].map((section) => (
        <div key={section.title} className="bg-base-200/50 rounded-2xl p-5">
          <h2 className="font-bold mb-2">{section.title}</h2>
          <p className="text-base-content/70 text-sm leading-relaxed">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const HomePage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [manageUser, setManageUser] = useState(null);
  const [showDocs, setShowDocs] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate();
  const { groups, fetchGroups, createGroup, joinOrg } = useGroupStore();

  useEffect(() => {
    if (authUser?.id) {
      setIsLoadingGroups(true);
      fetchGroups(authUser.id).finally(() => setIsLoadingGroups(false));
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Group name is required");
    setIsSubmitting(true);
    try {
      await createGroup(formData);
      await fetchGroups();
      setShowCreateForm(false);
    } finally {
      setFormData({ name: "", description: "" });
      setIsSubmitting(false);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setManageUser(null);
    setSidebarOpen(false);
  };

  if (showDocs) return <DocsPage onBack={() => setShowDocs(false)} />;

  return (
    <div className="min-h-screen flex bg-base-200">
      {/* ── Mobile Sidebar Backdrop ────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`fixed md:relative z-40 md:z-auto h-full w-72 md:w-64 bg-base-100 border-r border-base-200 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <BrushCleaning size={16} className="text-primary" />
            </div>
            <span className="font-bold text-sm">CleanUp</span>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-sm btn-primary rounded-xl gap-1 text-xs"
          >
            <Pencil size={12} /> New Group
          </button>
        </div>

        {/* Groups list */}
        <div className="flex-1 overflow-y-auto py-2">
          <p className="px-4 py-1 text-xs font-semibold text-base-content/40 uppercase tracking-wider">
            Your Groups
          </p>

          {isLoadingGroups ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonGroup key={i} />)
          ) : groups.length === 0 ? (
            <p className="text-xs text-center text-base-content/40 py-8 italic">
              No groups yet
            </p>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleSelectGroup(group)}
                className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all ${
                  selectedGroup?.id === group.id && !manageUser
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-base-200"
                }`}
              >
                <img
                  src={group.Organization.avatarLink}
                  alt={group.Organization.name}
                  className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-base-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {group.Organization.name}
                  </p>
                  <p className="text-[11px] text-base-content/50 truncate">
                    {group.Organization.description}
                  </p>
                </div>
                {selectedGroup?.id === group.id && (
                  <ChevronRight
                    size={14}
                    className="text-primary flex-shrink-0"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-base-200 space-y-1">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-base-200 transition-colors text-sm"
          >
            <User size={15} className="flex-shrink-0" />
            <span className="truncate">{authUser?.email || "Profile"}</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-error/10 text-error transition-colors text-sm"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-2 p-3 bg-base-100 border-b border-base-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            <Menu size={18} />
          </button>
          <span className="font-semibold text-sm flex-1 truncate">
            {selectedGroup ? selectedGroup.Organization?.name : "CleanUp"}
          </span>
        </div>

        {/* Content area */}
        {selectedGroup && !manageUser ? (
          <div className="flex-1 flex flex-col">
            <GroupCalendarView
              group={selectedGroup}
              onBack={() => {
                setSelectedGroup(null);
                setManageUser(null);
              }}
              manageUser={() => setManageUser(selectedGroup)}
            />
          </div>
        ) : manageUser ? (
          <div className="flex-1 flex flex-col">
            <ManageGroup
              group={manageUser}
              onBack={() => {
                setSelectedGroup(manageUser);
                setManageUser(null);
              }}
            />
          </div>
        ) : (
          // Welcome screen
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-base-100 to-base-200 p-6 text-center">
            <div className="max-w-md space-y-5">
              <div className="flex justify-center">
                <div className="p-5 bg-primary/15 rounded-3xl">
                  <BrushCleaning size={40} className="text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  Welcome to CleanUp 🌿
                </h1>
                <p className="text-base-content/60 text-sm leading-relaxed">
                  Manage cleaning tasks, assign duties, and keep everything
                  spotless together.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {!showJoinGroup ? (
                  <>
                    <button
                      onClick={() => setShowJoinGroup(true)}
                      className="btn btn-primary rounded-xl px-6"
                    >
                      Join a Group
                    </button>
                    <button
                      onClick={() => setShowDocs(true)}
                      className="btn btn-ghost rounded-xl"
                    >
                      Learn More
                    </button>
                  </>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await joinOrg(inviteCode);
                        toast.success("Joined group successfully!");
                        await fetchGroups(authUser.id);
                        setShowJoinGroup(false);
                        setInviteCode("");
                      } catch (err) {
                        toast.error(
                          err.response?.data?.message || "Failed to join group",
                        );
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-3 items-center w-full max-w-sm"
                  >
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter invite code..."
                      className="input input-bordered rounded-xl w-full h-11 text-sm"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-success rounded-xl h-11 px-5 text-sm"
                      >
                        Join
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowJoinGroup(false)}
                        className="btn btn-ghost rounded-xl h-11"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Create Group Modal ─────────────────────────────────────────────── */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-base-100 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-base-200">
              <h2 className="font-bold">Create New Group</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn btn-xs btn-circle btn-ghost"
              >
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-base-content/60 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="My cleaning squad"
                  className="input input-bordered rounded-xl w-full h-11 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-base-content/60 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What's this group for?"
                  className="textarea textarea-bordered rounded-xl w-full text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-ghost rounded-xl btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary rounded-xl btn-sm px-6"
                >
                  {isSubmitting ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
