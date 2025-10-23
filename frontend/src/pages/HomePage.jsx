import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { BrushCleaning, LogOut, User, ArrowLeft } from "lucide-react";
import GroupCalendarView from "../components/GroupCalendarView";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDocs, setShowDocs] = useState(false);
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate();

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

  const filteredGroups =
    activeTab === "your" ? groups.filter((g) => g.createdByMe) : groups;

  // Nếu đang xem hướng dẫn
  if (showDocs) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <button
          onClick={() => setShowDocs(false)}
          className="btn btn-sm btn-outline mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        <div className="max-w-3xl mx-auto bg-base-100 p-8 rounded-2xl shadow space-y-6">
          <h1 className="text-3xl font-bold text-primary mb-4 text-center">
            Hướng dẫn sử dụng CleanUp App 🌿
          </h1>

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Giới thiệu</h2>
            <p className="text-base-content/80">
              <b>CleanUp</b> giúp bạn quản lý các nhóm trực nhật, phân công nhiệm vụ
              và theo dõi lịch dọn dẹp một cách trực quan. Mỗi nhóm có thể gồm nhiều
              thành viên với vai trò khác nhau.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Tạo và quản lý nhóm</h2>
            <ul className="list-disc list-inside text-base-content/80 space-y-1">
              <li>Chọn tab <b>Your Groups</b> để xem các nhóm bạn tạo.</li>
              <li>Nhấn vào tên nhóm để mở lịch và xem nhiệm vụ.</li>
              <li>Thành viên khác có thể tham gia nhóm bằng mã mời (sắp ra mắt).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Lịch dọn dẹp</h2>
            <ul className="list-disc list-inside text-base-content/80 space-y-1">
              <li>Mỗi ô trên lịch là một ngày, hiển thị các nhiệm vụ cần làm.</li>
              <li>Nếu trong ngày có nhiều nhiệm vụ, bạn có thể cuộn trong ô đó để xem thêm.</li>
              <li>Click vào một nhiệm vụ để xem chi tiết hoặc chỉnh sửa.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Tài khoản và hồ sơ</h2>
            <ul className="list-disc list-inside text-base-content/80 space-y-1">
              <li>Nhấn <b>Profile</b> ở thanh bên trái để xem thông tin cá nhân.</li>
              <li>Dùng nút <b>Logout</b> để đăng xuất an toàn.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Mẹo nhỏ 🌱</h2>
            <ul className="list-disc list-inside text-base-content/80 space-y-1">
              <li>Dùng màu sắc và icon nhóm để dễ phân biệt.</li>
              <li>Thường xuyên kiểm tra lịch để không bỏ sót nhiệm vụ.</li>
              <li>Cập nhật app để nhận thêm tính năng mới.</li>
            </ul>
          </section>

          <div className="text-center pt-4">
            <p className="text-base-content/70">Chúc bạn giữ mọi thứ luôn sạch sẽ! ✨</p>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện mặc định
  return (
    <div className="min-h-screen grid grid-cols-6 bg-base-200">
      {/* Sidebar */}
      <div className="col-span-1 border-r border-base-300 flex flex-col">
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

        {/* Group list */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`flex items-center gap-3 p-3 hover:bg-base-300 cursor-pointer transition-colors ${
                selectedGroup?.id === group.id ? "bg-primary/10" : ""
              }`}
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
            onClick={() => navigate("/profile")}
            className="flex gap-2 items-center w-full justify-center py-2 rounded-lg bg-base-300 hover:bg-base-200 transition-colors"
          >
            <User className="size-5" />
            <span className="hidden sm:inline">Profile</span>
          </button>
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
      {selectedGroup ? (
        <GroupCalendarView
          group={selectedGroup}
          onBack={() => setSelectedGroup(null)}
        />
      ) : (
        <div className="col-span-5 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-base-200 to-base-100 text-center p-6">
          <div className="max-w-lg space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/20 rounded-full animate-bounce">
                <BrushCleaning className="size-10 text-primary" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-primary">
              Welcome to CleanUp App 🌿
            </h1>
            <p className="text-base-content/70">
              Manage your cleaning tasks, assign duties, and keep everything spotless.
            </p>

            <div className="flex justify-center gap-4">
              <button className="btn btn-primary">Get Started</button>
              <button
                onClick={() => setShowDocs(true)}
                className="btn btn-outline"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
