import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, BrushCleaning, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/90">
      <div className="container mx-auto px-4 h-14 md:h-16">
        <div className="flex items-center justify-between h-full">
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div className="size-8 md:size-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <BrushCleaning className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <h1 className="text-base md:text-lg font-bold tracking-tight">
              CleanUp
            </h1>
          </Link>

          <div className="flex items-center gap-2">
            {authUser && (
              <>
                <Link
                  to="/profile"
                  className="btn btn-sm btn-ghost gap-2 rounded-xl"
                >
                  <User className="size-4" />
                  <span className="hidden sm:inline text-sm">Profile</span>
                </Link>
                <button
                  onClick={logout}
                  className="btn btn-sm btn-ghost gap-2 rounded-xl text-error hover:bg-error/10"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline text-sm">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
