const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req , res , next) => {
    try{
        const authHeader = req.headers.authorization;

        /// check token exists
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({message:"not authorized"});
        }

        const token = authHeader.split(" ")[1];
    
        /// verify token
        const decoded = jwt.verify(token , process.env.JWT_SECRET);

        /// check token exists in DB
        const user = await User.findOne({
            _id: decoded.userId,
            authToken: token,
            tokenExpiry: {$gt: new Date()},
        });

        if(!user){
            return res.status(401).json({message: "session expired. please login again"});
        }
        /// attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({message : "Invalid or expired token"});
    }
};