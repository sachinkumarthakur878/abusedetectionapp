import React from "react";
import User from "./User";
import useGetAllUsers from "../../context/useGetAllUsers";

function Users() {
  const [allUsers, loading] = useGetAllUsers();
  // FIX: Removed console.log(allUsers) — debug log left in production code

  return (
    <div>
      <h1 className="px-8 py-2 text-white font-semibold">Messages</h1>
      <hr />
      <div className="py-2 flex-1 overflow-y-auto" style={{ maxHeight: "calc(84vh - 10vh)" }}>
        {loading && (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-sm text-teal-400"></span>
          </div>
        )}
        {!loading && allUsers.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">No contacts found</p>
        )}
        {allUsers.map((user) => (
          // FIX: Use user._id as key instead of array index — prevents React reconciliation bugs
          <User key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
}

export default Users;
