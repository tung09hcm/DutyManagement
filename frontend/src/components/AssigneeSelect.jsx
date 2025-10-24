import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

export default function AssigneeSelect({ users, formData, setFormData }) {
  const [open, setOpen] = useState(false);

  const toggleUser = (userId) => {
    setFormData((prev) => {
      const already = prev.assigneeIds.includes(userId);
      return {
        ...prev,
        assigneeIds: already
          ? prev.assigneeIds.filter((id) => id !== userId)
          : [...prev.assigneeIds, userId],
      };
    });
  };

  const removeUser = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.filter((id) => id !== userId),
    }));
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-base-content/70 mb-1">
        Assign to
      </label>

      {/* Ô hiển thị user đã chọn */}
      <div
        onClick={() => setOpen((o) => !o)}
        className="flex items-center flex-wrap gap-2 w-full border border-base-300 rounded-lg px-2 py-1 bg-base-100 cursor-pointer relative"
      >
        {formData.assigneeIds.length === 0 && (
          <span className="text-base-content/50 text-sm">Select users...</span>
        )}
        {formData.assigneeIds.map((id) => {
          const user = users.find((u) => u.id === id);
          return (
            <div
              key={id}
              className="flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full"
            >
              <span>{user?.name || user?.username}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeUser(id);
                }}
                className="hover:text-red-300"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
        <ChevronDown
          size={16}
          className={`ml-auto transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {/* Danh sách user khi mở */}
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {users.map((u) => {
            const selected = formData.assigneeIds.includes(u.id);
            return (
              <div
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className={`flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer hover:bg-base-200 ${
                  selected ? "text-blue-600 font-medium" : ""
                }`}
              >
                <span>{u.name || u.username}</span>
                {selected && (
                  <span className="text-blue-600 font-semibold text-xs">✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
