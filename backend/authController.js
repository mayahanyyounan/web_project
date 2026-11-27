const User = require("../models/Users");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {

    try {
        const { username, email, password } = req.body;
        //check all required fields
        if( typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !username.trim() || 
            !email.trim() || 
            !password.trim()
        ){
            return res.status(400).json({
                 message: "All fields are required"
                });
        }
    
        const existingEmail = await User.findOne({
            email: email.trim().toLowerCase()
        });
    
        if(existingEmail){
            return res.status(409).json({
                message: "Email already exists"
            });
        }
        
        const existingUsername = await User.findOne({
            username: username.trim()
        }).collation({
            locale: "en",
            strength: 2
        });
        if(existingUsername){
            return res.status(409).json({
                message: "Username already exists"
            });
        }
    
        const user = await User.create({
            username,
            email,
            password
        });
    
        return res.status(201).json({
            message: "User registered successfully",
            user: user.toPrivate()
        });
    
    } catch (error) {
        console.error(error);
        
        //duplicate username
        if(error.code === 11000){
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }
        //schema validation errors
        if(error.name === "ValidationError"){
            return res.status(400).json({
                message: error.message
            });
        }
        // unexpected errors
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const login = async (req, res) =>{
    try{
        const { email, password } = req.body || {};
        if( typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() || 
            !password.trim()
        ){
            return res.status(400).json({
                 message: "Email and password are required"
                });
        }
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if(!user){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
         { id: user.id },
         process.env.JWT_SECRET,
         { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: user.toPrivate()
        });
    
    } catch (error){
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
const logout = (req, res) => {
    return res.status(200).json({
        message: "Logged out successfully"
    });
};

module.exports = { register, login, logout};



