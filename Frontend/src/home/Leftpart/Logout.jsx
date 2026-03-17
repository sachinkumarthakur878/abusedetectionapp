import React, { useState } from "react";
import { BiLogOutCircle } from "react-icons/bi";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

function Logout() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/logout`);
      localStorage.removeItem("ChatApp");
      Cookies.remove("jwt");
      toast.success("Logged out successfully");
      window.location.reload();
    } catch (error) {
      toast.error("Error in logging out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-3 border-t border-white/10">
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
      >
        <BiLogOutCircle className="text-2xl" />
        <span>{loading ? "Logging out..." : "Logout"}</span>
      </button>
    </div>
  );
}

export default Logout;
