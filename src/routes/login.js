import { response, Router } from "express";
import passport from "passport";
import rutaGet from "../../js/rutaGet.js";
import rutaPost from "../../js/rutaPost.js";
import info from "./info.js";
import { checkLogin } from "../../middlewares/checkLogin.js";
import { tpEmail } from "../messages/email.js";
import { config } from "../../config/configDotenv.js";
import { logger } from "../../logger.js";

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
            tpEmail.sendMail({
                from: "Node",
                to: config.EmailAdm,
                subject: "Nuevo Registro del Ecommerce",
                text: `Se registro un nuevo usuario con el email: ${user.userName}`
            }), (error, response) => {
                if (error) {
                    logger.info(error)
                    logger.error(`Se produjo un error al enviar el mensaje al admin ${error}`)
                } else {
                    logger.info("Se registro el usuario correctamente")
                }
            }
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
