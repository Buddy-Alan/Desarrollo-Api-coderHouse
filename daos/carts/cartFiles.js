
import { Cart } from "../../managers/file/cartFs.js";

class CartsDatosFS extends Cart {
    constructor(fileName) {
        //Ejecuta el constructor de la classe ContenedorProducts de Archivos
        super(fileName)
    }
}

export { CartsDatosFS }