let contenedorDaoChat;
let contenedorDaoCart;
let contenedorDaoProd;

import { options } from "../config/options.js"
let dataBaseType = "mongo"

switch (dataBaseType) {
    case "mongo":
        const { ChatDatosMgDB } = await import("../daos/chat/chatMgDB.js")
        const { ProductsDatosMgDB } = await import("../daos/products/productsMongo.js")
        // const { CartsDatosMgDB } = await import("../daos/carts/cartMgDB.js")
        contenedorDaoProd = new ProductsDatosMgDB(options.mongo.products)
        // contenedorDaoCart = new CartsDatosMgDB(options.mongo.carts)
        contenedorDaoChat = new ChatDatosMgDB(options.mongo.chat)
        break;
    case "archivos":
        const { ChatDatosFs } = await import("../daos/chat/chatFS.js")
        contenedorDaoChat = new ChatDatosFs(options.fileSystem.chat)
        break;
}

export { contenedorDaoChat }
export { contenedorDaoProd }