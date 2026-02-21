import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { clsx } from "clsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabase";

export const NavigationHeader = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <header className="bg-[#141b3d]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl mb-8">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-4 hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-400 rounded-xl flex items-center justify-center text-2xl animate-float">
            🅿️
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent font-['Bai_Jamjuree']">
            Smart Parking
          </h1>
        </Link>
      </div>
      <nav className="flex items-center gap-4">
        <Button
          as={Link}
          to="/"
          className={clsx(
            "px-8 h-12 text-lg font-semibold rounded-xl transition-all",
            pathname === "/"
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_5px_20px_rgba(0,102,255,0.4)]"
              : "bg-white/5 border border-white/10 text-white/60 hover:border-blue-500",
          )}
        >
          🏠 ຫນ້າຫຼັກ
        </Button>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-white/80 font-medium">
              ສະບາຍດີ, {user.user_metadata?.full_name || user.email}
            </span>
            <Button
              onClick={handleLogout}
              className="bg-red-500/20 border border-red-500/50 text-red-500 px-6 h-12 text-lg font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-all"
            >
              ອອກຈາກລະບົບ
            </Button>
          </div>
        ) : (
          <Button
            as={Link}
            to="/login"
            className={clsx(
              "px-8 h-12 text-lg font-semibold rounded-xl transition-all",
              pathname === "/login"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_5px_20px_rgba(0,102,255,0.4)]"
                : "bg-white/5 border border-white/10 text-white/60 hover:border-blue-500",
            )}
          >
            🔑 เข้าสู่ระบบ
          </Button>
        )}
      </nav>
    </header>
  );
};
