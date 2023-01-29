import Cart from "../../managers/mongoDB/cartDB.js";

class CartsDatosMgDB extends Cart {
    constructor(fileName) {
        //Ejecuta el constructor de la classe ContenedorProducts de Archivos
        super(fileName)
    }
}

export { CartsDatosMgDB }