import { logger } from "../../logger.js";
class ContenedorProducts {
    constructor(dataBase) {
        this.dataBase = dataBase;
    }

    save = async (productoAAgregar) => {
        try {
            //Es un if que se usa para comprobar si existe el archivo
            const { title, price, thumbnail, descripcion, stock, codigo } = productoAAgregar
            if (title != undefined && price != undefined && thumbnail != undefined && descripcion != undefined && stock != undefined && codigo != undefined) {
                productoAAgregar = { timestamp: new Date(), title, price, thumbnail, descripcion, stock, codigo }
                console.log(productoAAgregar)
                const productoAgregado = await this.dataBase.insertMany({ timestamp: new Date(), title: title, price: price, thumbnail: thumbnail, descripcion: descripcion, stock: stock, codigo: codigo })
                return productoAgregado
            } else {
                return 1
                //El 1 lo retorna con el fin de hacer un filtro y detectar el error exacto
                //Si es 1 significa que completaron mal los datos
            }
        }
        catch (error) {
            logger.error(error)
            return 2
        }
    } //Aca termina la funcion Save()


    getAll = async () => {
        try {
            const allProd = this.dataBase.find()
            return (allProd)
        } catch (error) {
            logger.error(error)
        }
    }

    getByID = async (id) => {
        try {
            const producID = await this.dataBase.find({ _id: id })
            return producID
        } catch (error) {
            logger.error(error)
        }
    }

    updateById = async (id, body) => {

        const { title, price, thumbnail, descripcion, stock, codigo } = body
        if (title != undefined && price != undefined && thumbnail != undefined && descripcion != undefined && stock != undefined && codigo != undefined) {
            try {
                await this.dataBase.updateOne({ "_id": id }, { $set: { "title": title, "price": price, "thumbnail": thumbnail, "descripcion": descripcion, "stock": stock, "codigo": codigo } })
                const prodUpdate = await this.getByID(id)
                return prodUpdate
            } catch (error) {
                logger.error(error)
            }
        } else {
            return (1)
            //El 1 es de mal completado de datos
        }
    }

    deleteByID = async (idAEliminar) => {
        try {
            const prodAEliminar = await this.getByID(idAEliminar)
            if (prodAEliminar != "" && prodAEliminar != undefined) {
                await this.dataBase.deleteOne({ _id: idAEliminar })
                return `Se elimino el producto de id:${idAEliminar}`
            } else {
                return ("El producto no existe")
            }
        } catch (error) {
            logger.error(error)
        }
    }
}

export default ContenedorProducts