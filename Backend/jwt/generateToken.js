// import jwt from "jsonwebtoken";

// const createTokenAndSaveCookie = (userId, res) => {
//   const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {

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