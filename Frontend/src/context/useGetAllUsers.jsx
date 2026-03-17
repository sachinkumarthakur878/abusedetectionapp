// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import axios from "axios";
// function useGetAllUsers() {
//   const [allUsers, setAllUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   useEffect(() => {
//     const getUsers = async () => {
//       setLoading(true);
//       try {
//         const token = Cookies.get("jwt");
//         const response = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/user/allusers`,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setAllUsers(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.log("Error in useGetAllUsers: " + error);
//       }
//     };
//     getUsers();
//   }, []);
//   return [allUsers, loading];
// }

// export default useGetAllUsers;


import React, { useEffect, useState } from "react";
import axios from "axios";

function useGetAllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("ChatApp");
        const parsed = stored ? JSON.parse(stored) : null;
        const token = parsed?.token;

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/allusers`,
          {
            withCredentials: true,
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
        setAllUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.log("Error in useGetAllUsers: " + error);
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  return [allUsers, loading];
}

export default useGetAllUsers;
