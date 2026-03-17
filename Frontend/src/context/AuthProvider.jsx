// import React, { createContext, useContext, useState } from "react";
// import Cookies from "js-cookie";
// export const AuthContext = createContext();
// export const AuthProvider = ({ children }) => {
//   const [authUser, setAuthUser] = useState(() => {
//     const stored = localStorage.getItem("ChatApp");
//     return stored ? JSON.parse(stored) : undefined;
//   });
//   return (
//     <AuthContext.Provider value={[authUser, setAuthUser]}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    const stored = localStorage.getItem("ChatApp");
    if (!stored) return undefined;
    const parsed = JSON.parse(stored);
    // Agar { token, user: {...} } format hai toh user object return karo with token
    if (parsed?.user) {
      return { ...parsed.user, token: parsed.token };
    }
    return parsed;
  });

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
