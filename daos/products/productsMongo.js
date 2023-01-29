import ContenedorProducts from "../../managers/mongo/getItems.js"

class ProductsDatosMgDB extends ContenedorProducts {
    constructor(database) {
        //Ejecuta el constructor de la classe ContenedorProducts de MGDB
        super(database)
    }
}

export { ProductsDatosMgDB }