import express, { raw } from "express";
import { engine } from "express-handlebars";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { contenedorDaoChat } from "./daos/index.js";
import { conectMongo } from "./conect/mongo.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import login from "./src/routes/login.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { userModels } from "./mongo/models/userModels.js";
import { config } from "./config/configDotenv.js"
import { createHash, compareHash } from "./bcrypt/createHash.js"
import info from "./src/routes/info.js";
import parsedArgs from "minimist";
import { logger } from "./logger.js";
import { productRout } from "./src/routes/routerProducts.js";
import { cartRout } from "./src/routes/routerCarts.js";
import cluster from "cluster";
import os from "os";

const cpus = os.cpus().length



const objtArguments = parsedArgs(process.argv.slice(2))
const puerto = process.env.PORT || 8080;
//URL Mongo Atlas
const usuariosDB = config.BDusuarios
//Ver de cambiar el nombre de la base de datos a ecommerce
conectMongo(usuariosDB)
const sessionsDB = config.BDSesiones
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const modo = config.Modo ? config.Modo.toUpperCase() : "FORK"
if (cluster.isPrimary && modo == "CLUSTER") {
    for (let i = 0; i < cpus; i++) {
        cluster.fork()
    }
    cluster.on("exit", (worker, error) => {
        logger.info(`El subproceso ${worker.process.pio} dejo de funcionar`)
        cluster.fork()
    })
} else {
    app.listen(puerto, () => {
        logger.info(`server on port ${puerto} en el modo, ${modo}, en el proceso ${process.pid}`)
    })
}





app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Crea Cookiess
app.use(cookieParser())
//Guarda las sesiones de las cookkiess en mongo
app.use(session({
    store: MongoStore.create({
        mongoUrl: sessionsDB,
        ttl: 1600
    }),
    secret: config.claveSesion,
    resave: false,
    saveUninitialized: false,
}))


//Configuramo passport
app.use(passport.initialize())//Conecta passport a express
app.use(passport.session())//Relaciona sesiones con usuario

//Serealizacion de usuarios
passport.serializeUser((user, done) => {
    done(null, user.id)
})

//Deseralizar usuarios
passport.deserializeUser((id, done) => {
    userModels.findById(id, (err, userFound) => {
        if (err) return done(err);
        return done(null, userFound)
    })
})
//Seralizacion de contraseñas:

//Se utiliza para guardar el usuario con passport
passport.use("singup", new LocalStrategy(

    {
        passReqToCallback: true,
        usernameField: "userName"
    },



    (req, userName, password, done) => {
        userModels.findOne({ userName: userName }, (err, userFound) => {

            if (err) return done(err, null, { messages: "Hubo un erro al verificar el usuario" })
            logger.info("Pase por aca antes de comprobar usuario    ")
            if (userFound) return done(null, null, { messages: "El usuario ya existe" })
            logger.info("Pase por aca depues de comprobar usuario")
            if (req.body.name == undefined || req.body.edad == undefined || req.body.dir == undefined || req.body.avatar == undefined) return done(null, null, { messages: "El usuario no se puede cargar" })
            const newUser = {
                name: req.body.name,
                userName: userName,
                password: createHash(password),
                dir: req.body.dir,
                edad: req.body.edad,
                avatar: req.body.avatar,
                tel: req.body.tel,
            }
            userModels.create(newUser, (err, userCreated) => {
                if (err) return done(null, null, { message: "no se pudo guardar el usuario" })
                return done(null, userCreated, { messages: "Usuario Creado Exitosamente" })
            })
        })
    }
))

//Funcion para comprar las contraseñas hasheadas

passport.use("login", new LocalStrategy(
    {
        passReqToCallback: true,
        usernameField: "userName"
    },
    (req, userName, password, done) => {
        userModels.findOne({ userName: userName }, (err, userFound) => {
            if (err) return done(err, null, { messages: "Hubo un error  al verificar el usuario" })
            const passHash = compareHash(password, userFound.password)
            if (userFound && passHash) {
                return done(null, userFound, { messages: "El usuario inicio sesion correctamente" })
            } else {
                return done(null, null, { messages: "El usuario y/o contraseña es incorrecta" })
            }

        })
    }
))

// //Rutas

// app.use("/", productRouter)
app.use("/", login)
app.use("/", info)
app.use("/api/carrito", cartRout)
app.use("/api/productos", productRout)
app.use(express.static(__dirname + "/src/views/layouts"))
app.get("*", (req, res) => {
    logger.warn(`Se intento ingresar a la ruta ${req.path}`)
})





