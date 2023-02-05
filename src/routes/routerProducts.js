import { Router } from "express";
export const router = Router();
import { contenedorDaoProd } from "../../daos/index.js";
const productos = contenedorDaoProd
import { checkLogin } from "../../middlewares/checkLogin.js";
import { logger } from "../../logger.js";

const verificarRol = ((req, res, next) => {
    const rol = "admin";
    if (rol == "admin") {
        next()
    } else {
        res.json({
            message: "Usted no tiene permiso de administrador"
        })
    }
})

router.get("/", checkLogin, async (req, res) => {
    try {
        const productosAMostrar = await productos.getAll()
        if (productosAMostrar == "" || productosAMostrar == 1) {
            res.json({
                message: "El archivo esta vacio"
            })
        } else if (productosAMostrar == 2) {
            res.json({
                message: "El archivo no existe"
            })
        } else {
            res.json(productosAMostrar)
        }
    } catch (error) {
        res.status(500).send("Hubo un error en el Servidor")
    }
})

router.get("/:id", checkLogin, async (req, res) => {
    const { id } = req.params;
    try {
        const productoPorID = await productos.getByID(id);
        if (productoPorID && productoPorID != "" && productoPorID != undefined) {
            res.json({
                message: "El producto Solicitado es: ",
                product: productoPorID
            });
        } else {
            res.json({
                message: `No Se encontro el producto de id: ${id}`,
            });
        }
    } catch (error) {
        if (error.messageFormat == undefined) {
            res.json({
                message: `No Se encontro el producto de id: ${id}, en la coleccion`,
            });
        } else {
            res.status(500).send("Hubo un error en el Servidor")
        }
    }
})

router.post("/", verificarRol, async (req, res) => {
    const newProduct = req.body;
    try {
        const productoAAgregar = await productos.save(newProduct)
        if (productoAAgregar == 1) {
            res.json({
                message: "No se completaron los datos de manera correcta"
            })
        } else if (productoAAgregar == 2) {
            res.json({
                message: `El producto con  titulo ${newProduct.title}, ya existe, por favor no repita productos`
            })
        }
        else {
            res.json({
                message: "Producto Agregado con exito!",
                product: productoAAgregar
            })
        }
    } catch (error) {
        logger.error(error)
        res.status(500).send("Hubo un error en el Servidor")
    }
})

router.put("/:id", verificarRol, async (req, res) => {
    const { id } = req.params;
    const datoActualizado = req.body;
    try {
        const productoAActualizar = await productos.updateById(id, datoActualizado);
        if (productoAActualizar == 1) {
            res.json({
                message: "Complete los datos correctamente"
            })
        } else if (productoAActualizar != undefined) {
            res.json({
                message: `El producto id:${id} Fue actualizado con exito`,
                response: productoAActualizar
            })
        } else {
            res.json({
                message: `El id ${id}, no es un dato valido para actualizar`
            })
        }
    } catch (error) {
        res.status(500).send("Hubo un error en el Servidor")
    }
})


router.delete("/:id", verificarRol, async (req, res) => {
    const { id } = req.params
    try {
        const productoAEliminar = await productos.deleteByID(id)
        res.json({
            message: productoAEliminar
        })
    } catch (error) {
        logger.error(error)
    }
})






export const productRout = router