//manage user after their accounts have been created
const mongoose = require("mongoose");
const User = require("../models/Users");

const getMyProfile = (req, res) => {
   return res.status(200).json({
    user: req.user.toPrivate()
   });
};

const getUserProfile = async( req, res) =>{
   try{
    const id = req.params.id; //dynamic parts of the url
    if(!mongoose.isObjectIdOrHexString(id)){
        return res.status(400).json({
            message: "Invalid user ID"
        });
    }
    const user = await User.findById(id);
    if(!user){
        return res.status(404).json({
            message: "User not found"
        });
    }
     return res.status(200).json({
        user: user.toPublic()
     });

   } catch (errro){
    return res.status(500).json({
        message: "Internal server error"
    });
   }
};

const updateProfile = async (req, res)=>{
 try{
   const user = req.user;
   const { username, displayName, bio, avatar }= req.body || {};
   
   if (username !== undefined){
    if(typeof username !== "string" || !username.trim()){
        return res.status(400).json({
            message: "Invalid username"
        });
    }
    }

    if(displayName !== undefined && typeof displayName !== "string"){
        return res.status(400).json({
            message: "Invalid display name"
        });
    }
    
   if(bio !== undefined && typeof bio !== "string"){
    return res.status(400).json({
        message: "Invalid bio"
    });
   }

   if(avatar !== undefined && typeof avatar !== "string"){
    return res.status(400).json({
        message: "Invalid avatar"
    });
   }

   if (displayName !== undefined){
     user.displayName= displayName;
   }

   if(bio !== undefined){
    user.bio= bio; 
   }
   
   if(avatar !== undefined ){
    user.avatar = avatar;
   }

   if( username !== undefined ){
    const existingUsername = await User.findOne({
     username: username.trim(),
     _id: { $ne: user.id}//search in mongo without the username itself
    }).collation({
       locale: "en",
       strength: 2
     });

    if(existingUsername){
        return res.status(409).json({
            message: "Username already exists"
        });
    }
    user.username = username.trim();
}    
    await user.save();
    return res.status(200).json({
        message: "Profile updated successfully",
        user: user.toPrivate()
    });


 } catch (error) {

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({
            message: "Invalid profile information"
        });
    }

    return res.status(500).json({
        message: "Internal server error"
    });
}
};

const searchUsers = async (req, res)=>{
    try{
      const q = req.query.q;
      if( typeof q !== "string" || !q.trim()){
        return res.status(400).json({
            message: "Search query is required"
        });
      }
    const searchText = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find({
    $or:[
        {username: { $regex: searchText, $options:"i"}},
        {displayName: {$regex: searchText, $options:"i"}}
    ]
    }).limit(20); 

    return res.status(200).json({
        users: users.map(user => user.toPublic())
    });

    }catch(error){
       return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getMyProfile,
    getUserProfile,
    updateProfile,
    searchUsers
};