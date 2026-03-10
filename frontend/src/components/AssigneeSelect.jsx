import { useState } from "react";
import { X, ChevronDown, Users } from "lucide-react";

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
      <label className="block text-sm font-medium text-base-content/70 mb-1 flex items-center gap-1">
        <Users size={14} /> Assign to
      </label>

      <div
        onClick={() => setOpen((o) => !o)}
        className="flex items-center flex-wrap gap-1.5 min-h-10 w-full border border-base-300 rounded-xl px-3 py-2 bg-base-100 cursor-pointer hover:border-primary/50 transition-colors"
      >
        {formData.assigneeIds.length === 0 && (
          <span className="text-base-content/40 text-sm">
            Select members...
          </span>
        )}
        {formData.assigneeIds.map((id) => {
          const user = users.find((u) => u.id === id);
          return (
            <div
              key={id}
              className="flex items-center gap-1 bg-primary text-primary-content text-xs px-2 py-1 rounded-full font-medium"
            >
              <img
                src={user?.avatarLink}
                alt={user?.username}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span>{user?.name || user?.username}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeUser(id);
                }}
                className="hover:opacity-70 ml-0.5"
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
        <ChevronDown
          size={16}
          className={`ml-auto text-base-content/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-base-100 border border-base-300 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {users.map((u) => {
            const selected = formData.assigneeIds.includes(u.id);
            return (
              <div
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-base-200 transition-colors ${
                  selected ? "bg-primary/5" : ""
                }`}
              >
                <img
                  src={u.avatarLink}
                  alt={u.username}
                  className="w-7 h-7 rounded-full object-cover border border-base-300"
                />
                <span className={selected ? "text-primary font-medium" : ""}>
                  {u.name || u.username}
                </span>
                {selected && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
