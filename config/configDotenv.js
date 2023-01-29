import * as dotenv from "dotenv"

//Configuramos Dotenv
dotenv.config({
    path: ".env.development"
})

export const config = {
    BDusuarios: process.env.BaseDeDatosUsuarios || "",
    BDSesiones: process.env.BaseDeDatosSesiones || "",
    BDProductos: process.env.BaseDeDatosProductos || "",
    claveSesion: process.env.Clave_Sesion,
    Modo: process.env.MODO
}

//Ver de cambiar el nombre de la base de datos a ecommerce