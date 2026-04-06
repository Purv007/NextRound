const mongoose = require("mongoose");

const userSchema=new mongoose.Schema({
    username : {
        type: String,
        unique: [true, "Username already taken"],
        required: true
    },
    email : {
        type: String,
        unique: [true, "Account with this email already exists"],
        required: true
    },
    password : {
        type: String
    },
    googleId : {
        type: String,
        default: null
    },
    profilePicture : {
        type: String,
        default: null
    }
})

const userModel=mongoose.model("users",userSchema);

module.exports=userModel;