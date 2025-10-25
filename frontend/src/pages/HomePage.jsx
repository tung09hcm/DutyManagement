import { useState,useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { BrushCleaning, LogOut, User, ArrowLeft,Pencil, X  } from "lucide-react";
import GroupCalendarView from "../components/GroupCalendarView";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const HomePage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDocs, setShowDocs] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate();
  const { groups, fetchGroups, createGroup, joinOrg } = useGroupStore();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await createGroup(formData);
      await fetchGroups(); // reload danh sách nhóm
      setShowCreateForm(false); // đóng modal
    } finally {
      setFormData({ name: "", description: "" });
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (authUser?.id) fetchGroups(authUser.id);
  }, [authUser]);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  // const groups = [
  //   {
  //     id: 1,
  //     name: "Room A Cleaners",
  //     description: "Main hall & corridor",
  //     avatar: "https://api.dicebear.com/9.x/identicon/svg?seed=roomA",
  //     createdByMe: true,
  //   },
  //   {
  //     id: 2,
  //     name: "Cafeteria Crew",
  //     description: "Kitchen and dining area",
  //     avatar: "https://api.dicebear.com/9.x/identicon/svg?seed=cafe",
  //     createdByMe: false,
  //   },
  //   {
  //     id: 3,
  //     name: "Office Squad",
  //     description: "Admin rooms and storage",
  //     avatar: "https://api.dicebear.com/9.x/identicon/svg?seed=office",
  //     createdByMe: true,
  //   },
  // ];


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
            <button onClick = {() => {setShowCreateForm(true)}}className="cursor-pointer btn btn-primary">
              <Pencil className="w-5 h-5" />
              Create Your Group
            </button>
        </div>

        {/* Group list */}
        <div className="flex-1 overflow-y-auto">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`flex items-center gap-3 p-3 hover:bg-base-300 cursor-pointer transition-colors ${
                selectedGroup?.id === group.id ? "bg-primary/10" : ""
              }`}
            >
              <img
                src={group.Organization.avatarLink}
                alt={group.Organization.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="text-sm font-semibold">{group.Organization.name}</h3>
                <p className="text-xs text-base-content/70">{group.Organization.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-base-200">
          <button
            onClick={() => navigate("/profile")}
            className="flex gap-2 items-center w-full justify-center py-2 rounded-lg bg-base-300 hover:bg-base-200 transition-colors mb-2"
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
              {
                !showJoinGroup ?
                (
                  <div className="flex justify-center gap-4">
                    <button onClick = {() => {setShowJoinGroup(true)}}className="btn btn-primary">Get Started</button>
                    <button
                      onClick={() => setShowDocs(true)}
                      className="btn btn-outline"
                    >
                      Learn More
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await joinOrg(inviteCode); // join thành công
                        toast.success("Joined group successfully!");
                        await fetchGroups(authUser.id); // reload danh sách nhóm mới nhất
                        setShowJoinGroup(false); // đóng form
                        setInviteCode(""); // clear input
                      } catch (err) {
                        toast.error(err.response?.data?.message || "Failed to join group");
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-3 items-center"
                  >
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter your invite code..."
                      className="input input-bordered w-full sm:w-80"
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-success w-full sm:w-auto"
                    >
                      Join Group
                    </button>
                  </form>
                )
              }       
            </div>
          </div>
        </div>
      )}

      {/* Create Group Form */}
      { showCreateForm ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-base-100 rounded-lg shadow-lg w-240 max-h-[70vh] overflow-y-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-base-content">
                Create Your Group
              </h2>
              <button onClick={() => setShowCreateForm(false)} className="btn btn-xs btn-circle">
                <X size={14} />
              </button>
            </div>
            {/* Body */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-base-content/80">
                  Group Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter group name"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-base-content/80">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your group"
                  className="textarea textarea-bordered w-full min-h-[100px]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-200 disabled:opacity-60 active:scale-95"
                >
                  {isSubmitting ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div> 
      ) : null

      }
    </div>
  );
};

export default HomePage;
