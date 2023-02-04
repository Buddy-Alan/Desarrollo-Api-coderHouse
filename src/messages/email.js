import { createTransport } from "nodemailer";
import { config } from "../../config/configDotenv.js";


export const tpEmail = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: config.EmailAdm,
        pass: config.PassAdm,
    },
    secure: false,
    tls: {
        rejectUnauthorized: false
    }
})
