# 🧹 CleanUp App

**CleanUp App** là ứng dụng giúp quản lý hoạt động trực nhật, phân công nhiệm vụ và theo dõi lịch dọn dẹp trong các nhóm hoặc tổ chức.  
Người dùng có thể tạo nhóm, tham gia bằng mã mời, xem lịch trực, và ghi nhận kết quả theo ngày.

---

## 🚀 Tính năng chính (hiện tại)

- **Đăng nhập / Đăng ký / Đăng xuất**  
  Bảo mật bằng JWT, lưu session qua cookie.

- **Tạo và quản lý nhóm (Organization)**  
  - Người dùng có thể tạo nhóm mới (org).  
  - Mỗi nhóm có tên, mô tả, avatar riêng.  
  - Có thể tham gia nhóm bằng **mã mời** (invite code).  

- **Lịch trực nhật (Calendar View)**  
  - Hiển thị lịch trực theo ngày/tháng.  
  - Phân công công việc cho các thành viên.  
  - Hỗ trợ xem chi tiết, chỉnh sửa, và đánh dấu hoàn thành.

- **Hướng dẫn sử dụng (Docs Mode)**  
  - Giao diện hướng dẫn trực quan cho người mới.  
  - Giải thích chi tiết về tạo nhóm, lịch trực và hồ sơ cá nhân.

---

## 🧭 Tính năng sắp ra mắt

### 🔹 Trang quản lý **Organization tổng**
> Dành cho người **quản trị hoặc cộng tác viên** của tổ chức.

- Quản lý **thành viên** trong tổ chức.  
  - Gán quyền **Collaborator** cho một người dùng (cho phép họ chỉnh sửa task hoặc penalty).  
  - Xem danh sách tất cả user trong org.

- Quản lý **nhiệm vụ (Tasks)** của toàn tổ chức.  
  - Tạo, chỉnh sửa, xóa, hoặc phân công task cho từng user.  
  - Thống kê nhiệm vụ theo thời gian, nhóm, hoặc mức độ hoàn thành.

- Quản lý **Penalty** trong nhóm.  
  - Ghi nhận lỗi hoặc vi phạm từ các thành viên.  
  - Gán mức phạt hoặc điểm trừ.  
  - Theo dõi **lịch sử penalty** theo thời gian.

- **Leaderboard (Bảng xếp hạng)**  
  - Tính điểm tổng hợp theo tuần / tháng.  
  - Xếp hạng thành viên theo thành tích hoặc điểm phạt.  
  - Có thể lọc theo **org** hoặc **group** cụ thể.

---

### 🔹 Trang **thông tin cá nhân (User Profile)**

- Hiển thị thông tin người dùng và avatar.  
- Thống kê toàn bộ hoạt động của user trong các org mà họ tham gia:
  - Các **task đã hoàn thành**.  
  - Các **task sắp tới**.  
  - Các **penalty đã nhận**, sắp xếp theo thời gian hoặc theo tổ chức.  
- Giao diện dạng **dashboard cá nhân**, có thể lọc theo từng tổ chức.

---

## 🛠️ Công nghệ sử dụng

| Stack | Công nghệ |
|-------|------------|
| **Frontend** | React + Zustand + TailwindCSS + DaisyUI |
| **Backend** | Node.js + Express + JWT + Sequelize (MySQL) |
| **Database** | MySQL |
| **UI Icons** | Lucide React |
| **Notifications** | react-hot-toast |



