import React from "react";
import Search from "./Search";
import Users from "./Users";
import Logout from "./Logout";
import { useAuth } from "../../context/AuthProvider.jsx";

function Left() {
  const [authUser] = useAuth();

  // Fallback: directly localStorage se bhi try karo
  const getName = () => {
    if (authUser?.fullname) return authUser.fullname;
    try {
      const stored = localStorage.getItem("ChatApp");
      if (!stored) return "";
      const parsed = JSON.parse(stored);
      return parsed?.fullname || parsed?.user?.fullname || "";
    } catch { return ""; }
  };

  return (
    <div className="flex flex-col h-screen border-r border-white/10 bg-black/90 text-teal-400 w-72">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <div className="avatar online">
          <div className="w-10 rounded-full ring ring-teal-400 ring-offset-base-100 ring-offset-1">
            <img src="/user.jpg" alt="me" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{getName()}</p>
          <p className="text-green-400 text-xs">🟢 Online</p>
        </div>
      </div>

      <Search />

      <div className="flex-1 overflow-y-auto">
        <Users />
      </div>

      <Logout />
    </div>
  );
}

export default Left;