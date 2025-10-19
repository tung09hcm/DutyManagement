import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { BrushCleaning, LogOut  } from "lucide-react";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("all"); // "your" | "all"
  const { logout, authUser } = useAuthStore();

  const groups = [
    {
      id: 1,
      name: "Room A Cleaners",
      description: "Main hall & corridor",
      avatar: "https://api.dicebear.com/9.x/identicon/svg?seed=roomA",
      createdByMe: true,
    },
    {
      id: 2,
      name: "Cafeteria Crew",
      description: "Kitchen and dining area",
      avatar: "https://api.dicebear.com/9.x/identicon/svg?seed=cafe",
      createdByMe: false,
    },
    {
      id: 3,
      name: "Office Squad",
      description: "Admin rooms and storage",
      avatar: "https://api.dicebear.com/9.x/identicon/svg?seed=office",
      createdByMe: true,
    },
  ];

  // lọc danh sách theo tab
  const filteredGroups =
    activeTab === "your"
      ? groups.filter((g) => g.createdByMe)
      : groups;

  return (
    <div className="min-h-screen grid grid-cols-6 bg-base-200">
      {/* Sidebar */}
      <div className="col-span-1 border-r border-base-300 flex flex-col">
        {/* Header có 2 nút chọn */}
        <div className="flex justify-around items-center p-3 bg-base-200">
          
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors mx-1 ${
              activeTab === "all"
                ? "bg-primary text-primary-content"
                : "bg-base-300 hover:bg-base-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("your")}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors mx-1 ${
              activeTab === "your"
                ? "bg-primary text-primary-content"
                : "bg-base-300 hover:bg-base-200"
            }`}
          >
            Your Groups
          </button>
        </div>

        {/* Danh sách group */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-3 p-3 hover:bg-base-300 cursor-pointer transition-colors"
            >
              <img
                src={group.avatar}
                alt={group.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="text-sm font-semibold">{group.name}</h3>
                <p className="text-xs text-base-content/70">{group.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-base-200">
            <button
                onClick={logout}
                className="flex gap-2 items-center w-full justify-center py-2 rounded-lg bg-base-300 hover:bg-base-200 transition-colors"
            >
                <LogOut className="size-5" />
                <span className="hidden sm:inline">Logout</span>
            </button>
            {authUser && (
            <p className="text-xs text-center text-base-content/50 mt-1">
                Logged in as <span className="font-medium">{authUser.email}</span>
            </p>
            )}
        </div>
      </div>

      {/* Main content */}
      <div className="col-span-5 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-base-200 to-base-100 text-center p-6">
        <div className="max-w-lg space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/20 rounded-full animate-bounce">
              <BrushCleaning className="size-10 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-primary">Welcome to CleanUp App 🌿</h1>
          <p className="text-base-content/70">
            Manage your cleaning tasks, assign duties, and keep everything spotless.
          </p>

          <div className="flex justify-center gap-4">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-outline">Learn More</button>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default HomePage;
