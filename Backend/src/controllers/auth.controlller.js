const userModel=require("../models/user.model");
const tokenBlacklistModel=require("../models/blacklist.model");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

/**
 * @name registerUserController
 * @description Register a new user,expects username,email,password in request body
 * @access Public
 */

async function registerUserController(req,res){
    const {username,email,password}=req.body;
    if(!username || !email || !password){
        return res.status(400).json({message:"All fields are required"});
    } 
    
    const isUserAlreadyPresent=await userModel.findOne({
        $or:[{username},{email}]
    });
    if(isUserAlreadyPresent){
        return res.status(400).json({message:"Account with this username or email already exists"});
    }
    
    const hash=await bcrypt.hash(password,10);
    
    const user=await userModel.create({
        username,
        email,
        password:hash
    });
    
    const token=jwt.sign(
        {
            id:user._id,
            username:user.username
        },
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )
    
    res.cookie("token",token);
    
    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    });
    
}

/**
 * @name loginUserController
 * @description Login a user,expects email,password in request body
 * @access Public
 */

async function loginUserController(req,res){
    const {email,password}=req.body;
    const user=await userModel.findOne({email});
    if(!user){
        return res.status(400).json({message:"Invalid credentials"});
    }
    
    const isPasswordValid=await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid credentials"
        })
    }

    const token=jwt.sign(
        {
            id:user._id,
            username:user.username
        },
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )

    res.cookie("token",token);

    res.status(200).json({
        message:"User logged in successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add token to blacklist
 * @access Public
 */
async function logoutUserController(req,res){
    const token=req.cookies.token;

    if(token){
        await tokenBlacklistModel.create({
            token
        })
    }

    res.clearCookie("token");
    res.status(200).json({
        message:"User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get current logged in user details.
 * @access Private
 */
async function getMeController(req,res){
    const user=await userModel.findById(req.user.id);
    res.status(200).json({
        message:"User details fetched successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}
/**
 * @name googleCallbackController
 * @description Called after Passport authenticates with Google.
 *              Creates a JWT (same as login), sets cookie, redirects to frontend.
 * @access Public (called by Google's redirect)
 */
async function googleCallbackController(req,res){
    // req.user is set by Passport after successful Google authentication
    const user = req.user;

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("token", token);

    // Redirect to frontend — the React app will call getMe() and see the user
    res.redirect("http://localhost:5173/");
}

module.exports={
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    googleCallbackController
}