import jwt from "jsonwebtoken";
 
export const generateJsonWebToken = (user) => {
// console.log("user data", user);
 return jwt.sign(
    {id : user._id , 
      isSuperadmin : user.isSuperAdmin || false,
    },
    process.env.JWT_SECRET,
    {expiresIn : "7d"}
 );
}