import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    const stored = localStorage.getItem("ChatApp");
    return stored ? JSON.parse(stored) : undefined;
  });
  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
