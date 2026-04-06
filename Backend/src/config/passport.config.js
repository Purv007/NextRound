const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModel = require("../models/user.model");

/**
 * Google OAuth 2.0 Strategy
 * 
 * This tells Passport:
 * 1. Use these Google credentials to authenticate
 * 2. When Google sends back a user profile, run this callback
 * 3. The callback either finds an existing user or creates a new one
 */
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await userModel.findOne({ googleId: profile.id });

                if (user) {
                    // User already exists — just return them
                    return done(null, user);
                }

                // Check if a user with this email already exists (registered via email/password)
                user = await userModel.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Link the Google account to the existing user
                    user.googleId = profile.id;
                    user.profilePicture = profile.photos[0]?.value || null;
                    await user.save();
                    return done(null, user);
                }

                // Brand new user — create account
                user = await userModel.create({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    profilePicture: profile.photos[0]?.value || null,
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
