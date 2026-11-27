//SECURITY GUARD
const jwt = require("jsonwebtoken"); //verify the token
const User = require("../models/Users")//check wether the acc still exists in mongo

//next allows the request to continue
const protect = async (req , res, next ) =>{
    try{
    const authHeader = req.headers.authorization;
    if ( !authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message: "Access denied. No valid token provided"
        });
    }
    //Authorization: Bearer[0] abc123xyz[1]
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if(!user){
        return res.status(401).json({
            message: "User no longer exists"
        });
    }
    //retrieved the uder from mongodb and stored it in req.user
    req.user = user;
    next();  
    } catch(error){
    if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError" ||
        error.name === "NotBeforeError"
    ){
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
    return res.status(500).json({
        message: "Internal server error"
    });

    }
}
module.exports = protect;