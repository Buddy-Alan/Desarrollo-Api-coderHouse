import { Router } from "express";
import passport from "passport";
import rutaGet from "../../js/rutaGet.js";
import rutaPost from "../../js/rutaPost.js";
import info from "./info.js";
import { checkLogin } from "../../middlewares/checkLogin.js";

const login = Router()



login.get("/register", (req, res) => {

    if (!req.isAuthenticated()) {
        const errorMensaje = req.session.messages ? req.session.messages[0] : ""
        // req.session.messages = [];
        res.json({ messages: errorMensaje })
        rutaGet(req.path)
    } else {
        res.redirect("/ ")
    }
})

login.post("/register", (req, res) => {

    passport.authenticate("singup", (error, user, info) => {
        if (error || !user) return res.json({ messages: info.messages })
        req.logIn(user, (error) => {
            if (error) return res.json({ messages: "Hubo un error " })
            res.json({ user, messages: info.messages })
        })
    })(req, res)
    // rutaPost(req.path)
});

login.get("/login", async (req, res) => {
    if (!req.isAuthenticated()) {
        const errorMensaje = req.session.messages ? req.session.messages[0] : ""
        res.render("formLogin", { error: errorMensaje })
        req.session.messages = [];
        rutaGet(req.path)

    } else {
        res.redirect("/")
    }
})

login.post("/login", (req, res) => {
    rutaPost(req.path)
    passport.authenticate("login", (error, user, info) => {

        if (error || !user) return res.json({ messages: info.messages })
        req.logIn(user, (error) => {
            if (error) return res.json({ messages: "Hubo un error" })
            console.log(req.user)
            res.json({ user, messages: info.messages })
        })
    })(req, res)
    //     rutaPost(req.path)
    // res.redirect("/")
})


login.get("/logout", async (req, res) => {
    if (req.isAuthenticated()) {
        res.render("logout", { nombreUsuario: req.user.name })
        rutaGet(req.path)
    }
    else {
        res.redirect("/login")
    }
})

login.post("/logout", async (req, res) => {
    req.logOut((error) => {
        if (error) res.status(400).json({ messages: "Error al intentar cerrar sesion" })
        res.status(200).json({ messages: "Sesion finalizada" })
        rutaPost(req.path)
    })
})


export default login
