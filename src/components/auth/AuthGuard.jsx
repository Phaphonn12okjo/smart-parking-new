import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/config/supabase";

export const AuthGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const isAuthPage = pathname === "/login" || pathname === "/register";

      if (!session && !isAuthPage) {
        navigate("/login");
      } else if (session && isAuthPage) {
        navigate("/");
      } else {
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuthPage = pathname === "/login" || pathname === "/register";

      if (!session && !isAuthPage) {
        navigate("/login");
      } else if (session && isAuthPage) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e23]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg font-medium animate-pulse">
            กำลังตรวจสอบสถานะ...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
