import mongoose from "mongoose";

import { logger } from "../logger.js";


export const conectMongo = (urlAIngresar) => {
    mongoose.connect(urlAIngresar, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
        error => {
            if (error) throw new Error(`Conexion fallida ${error}`);
            logger.info("¡Conexion a Mongo Exitosa!")
        })
    logger.info("base de datos conectada")


}



// mongoose.connect(usuariosDB, {
//     useNewUrlParser: true,
//     useUnifieldTopology: true
// }, (error) => {
//     if (error) return console.log(`Hubo un error  conectando a mongo ATLAS ${error}`); console.log("Conexion a mongo atlas exitosa")
// })