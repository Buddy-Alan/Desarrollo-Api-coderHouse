import express from "express"
import passport from "passport"
import { compareHash } from "../../bcrypt/createHash.js"
import { Strategy as LocalStrategy } from "passport-local"
import { userModels } from "../../mongo/models/userModels.js"

passport.serializeUser((user, done) => {
    return done(null, user.id)
})
passport.deserializeUser((id, done) => {
    userModels.findById(id, (error, userFound) => {
        return done(error, userFound)
    })

})