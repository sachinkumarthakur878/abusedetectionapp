import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";

function Search() {
  const [search, setSearch] = useState("");
  const [allUsers] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    const conversation = allUsers.find((user) =>
      user.fullname?.toLowerCase().includes(search.toLowerCase())
    );
    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      toast.error("User not found");
    }
  };

  return (
    <div className="px-4 py-3 border-b border-white/10">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/10 focus-within:border-teal-400 transition-colors">
          <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-sm"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-white text-xs"
            >✕</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Search;
