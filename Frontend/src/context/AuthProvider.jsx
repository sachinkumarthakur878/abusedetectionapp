// // import React, { createContext, useContext, useState } from "react";
// // import Cookies from "js-cookie";

// // export const useAuth = () => useContext(AuthContext);

// import React, { createContext, useContext, useState } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authUser, setAuthUser] = useState(() => {

//   return (
//     <AuthContext.Provider value={[authUser, setAuthUser]}>

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem("ChatApp");
      if (!stored) return undefined;
      const parsed = JSON.parse(stored);
      // Support both formats:
      // New: { _id, fullname, email, token }
      if (parsed?._id) return parsed;
      if (parsed?.user?._id) {
        return {
          _id: parsed.user._id,
          fullname: parsed.user.fullname,
          email: parsed.user.email,
          token: parsed.token,
        };
      }
      return undefined;
    } catch { return undefined; }
  });

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);