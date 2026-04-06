const express = require("express");
const authRouter = express.Router();
const authController=require("../controllers/auth.controlller");
const authMiddleware=require("../middlewares/auth.middleware")

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register",authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description Login a user with email and password
 * @access Public
 */
authRouter.post("/login",authController.loginUserController);

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add token to blacklist
 * @access Public
 */
authRouter.get("/logout",authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description get current logged in user details
 * @access Private
 */
authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController);

const passport = require("passport");

/**
 * @route GET /api/auth/google
 * @description Start Google OAuth login flow
 * @access Public
 */
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @route GET /api/auth/google/callback
 * @description Google redirects here after successful authentication
 * @access Public
 */
authRouter.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login" }),
    authController.googleCallbackController
);

module.exports = authRouter;