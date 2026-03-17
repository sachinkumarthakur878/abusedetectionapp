// import jwt from "jsonwebtoken";

// const createTokenAndSaveCookie = (userId, res) => {
//   const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {
//     expiresIn: "10d",
//   });
//   res.cookie("jwt", token, {
//     httpOnly: true, // xss
//     secure: true,
//     sameSite: "strict", // csrf
//   });
// };
// export default createTokenAndSaveCookie;


import jwt from "jsonwebtoken";

const createTokenAndSaveCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {
    expiresIn: "10d",
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",  // cross-origin ke liye
  });
  return token;  // token return karo
};
export default createTokenAndSaveCookie;