
import { Router } from "express";
// import Cart from "./managers/mongoDB/cartDB.js";
export const carritoRouter = Router();
// import { cartModels } from "../mongo/models/cart.js";
// import ContenedorProducts from "../managers/mongoDB/getItems.js";
// import { productModels } from "../mongo/models/product.js";
// const carritoProductos = new Cart(cartModels)
// const productosEnBD = new ContenedorProducts(productModels)
import { contenedorDaoProd } from "../../daos/index.js"
import { contenedorDaoCart } from "../../daos/index.js"
const productosEnBD = contenedorDaoProd
const carritoProductos = contenedorDaoCart
import { checkLogin } from "../../middlewares/checkLogin.js";
import { tpEmail } from "../messages/email.js";
import { logger } from "../../logger.js";
import { config } from "../../config/configDotenv.js";
import { twAdmP, twClient, adminWSP, twAdmWSP } from "../messages/twilio.js";

// const express = require("express")
// const Cart = require("../cart")
// const carritoRouter = express.Router();
// const Contenedor = require("../getItems")
// const carritoProductos = new Cart("carrito.txt")
// const productosEnBD = new Contenedor("productos.txt")

//Funcion para actualizar el stock del producto
const actualizarProducto = (productoaActualizar) => {
    productoaActualizar.stock = productoaActualizar.stock - 1
    productosEnBD.updateById(productoaActualizar.id, productoaActualizar)
}

//Funcion para  desestructurar el primer ingreso del producto al carrito
//Con el fin de que el stock sea 1
const primerStock = (productoASacarPrimerStock, usuario) => {
    const { id, title, price, thumbnail, descripcion, timestamp, codigo } = productoASacarPrimerStock
    const newProduct = {
        id: id,
        timestamp: timestamp,
        title: title,
        descripcion: descripcion,
        codigo: codigo,
        price: price,
        thumbnail: thumbnail,
        stock: 1,
        usuario: usuario
    };
    console.log(newProduct)
    return newProduct
}

// Crea un carrito y agrega UN DATO
carritoRouter.post("/", checkLogin, async (req, res) => {
    const usuario = req.user.userName
    try {
        const idAActualizar = req.body.id
        let productoByID = await productosEnBD.getByID(idAActualizar)
        if (productoByID != undefined) {
            let prodByIDMg = productoByID[0]
            if (productoByID.stock > 0) {
                const newCarrito = primerStock(productoByID, usuario)
                await carritoProductos.save(newCarrito)
                const todosLosCarritos = await carritoProductos.getAllCarritos()
                const carritoAMostrar = todosLosCarritos[todosLosCarritos.length - 1]
                res.json({
                    message: "Se agrego con exito!",
                    carritos: carritoAMostrar
                })
                actualizarProducto(productoByID)
            } else if (prodByIDMg.stock > 0) {
                prodByIDMg.stock = prodByIDMg.stock - 1
                await productosEnBD.updateById(idAActualizar, prodByIDMg)
                const carrito = await carritoProductos.save(prodByIDMg, usuario)
                res.json({ messages: "Se creo el carrito:", carrito })
            }
            else {
                res.json({
                    message: "No hay suficiente stock"
                })
            }
        } else {
            res.json({
                message: "El producto solicitado NO EXISTE"
            })
        }
    } catch (error) {
        console.log(error)

    }
})

//Obtiene todos los coarritos
carritoRouter.get("/", checkLogin, async (req, res) => {

    try {
        const carritos = await carritoProductos.getAllCarritos()
        res.json({
            prod: carritos
        })
    } catch (error) {
        console.log(error)
    }
})

//Obtiene carritos por ID
carritoRouter.get("/:id", checkLogin, async (req, res) => {
    const idSolicitado = (req.params.id)
    try {
        const carrito = await carritoProductos.getCarritoByID(idSolicitado)
        if (carrito == undefined || carrito == 1 || carrito == "") {
            res.json({
                message: `El carrito solicitado de id ${idSolicitado} NO existe`,
            })
        } else if (carrito == 2) {
            res.json({
                message: "El Archivo esta vacio"
            })
        }
        else {
            res.json({
                message: `El carrito solicitado de id ${idSolicitado} es:`,
                carrito: carrito
            })
        }
    } catch (error) {
        console.log(error)
    }
})



// //Obtengo todos los productos de ese carrito.
carritoRouter.get("/:id/productos", checkLogin, async (req, res) => {
    const idSolicitado = (req.params.id)
    try {
        const carritoByID = await carritoProductos.getCarritoByID(idSolicitado)
        console.log(carritoByID)
        if (carritoByID[0].userName == req.user.userName) {
            switch (carritoByID) {
                case 1:
                    res.json({
                        message: `El Carrito con id ${idSolicitado} no existe`
                    });
                    break;
                case undefined:
                    res.json({
                        message: `El Carrito con id ${idSolicitado} no existe`
                    });
                    break;
                case 2:
                    res.json({
                        message: `Actualmente no existe ningun carrito creado`
                    });
                    break;
                default:
                    //Se ustiliza la funcion Array.isArray() Con el objetivo de que me devuelva un valor de verdad
                    //Para poder comprar si trabajmos con un objeto o con un array
                    const esArray = Array.isArray(carritoByID)
                    if (esArray) {
                        const productosCarrito = carritoByID[0].productos
                        console.log(productosCarrito)
                        res.json({
                            message: `El carrito ${idSolicitado} tiene los productos:`,
                            productos: productosCarrito
                        })
                    } else {
                        res.json({
                            message: `El carrito ${idSolicitado} tiene los productos:`,
                            productos: carritoByID.productos
                        })
                    }
            }
        }
        else {
            res.json({ messages: `Su usuario ${req.user.userName}, no posee acceso a este carrito de compras` })
        }
    } catch (error) {
        console.log(error)
    }
})


// //Para actualizar und dato del carrito, o agregar items al carrito
carritoRouter.post("/:id/productos", checkLogin, async (req, res) => {
    const idSolicitado = (req.params.id)
    const idProducto = (req.body.id)
    try {
        const carritoByID = await carritoProductos.getCarritoByID(idSolicitado)
        if (carritoByID[0].userName == req.user.userName) {
            switch (carritoByID) {
                case 1:
                    res.json({
                        message: `El Carrito con id ${idSolicitado} no existe`
                    });
                    break;
                case undefined:
                    res.json({
                        message: `El Carrito con id ${idSolicitado} no existe`
                    });
                    break;

                case 2:
                    res.json({
                        message: `Actualmente no existe ningun carrito creado`
                    });
                    break;
                case undefined:
                    res.json({
                        message: `El archivo esta vacio`
                    })
                    break;
                default:
                    const productoByID = await productosEnBD.getByID(idProducto);
                    if (Array.isArray(productoByID)) {
                        const productoIDMg = productoByID[0]
                        if (productoIDMg.stock > 0) {
                            if (carritoByID == "") {
                                res.json({
                                    message: `El Carrito con id ${idSolicitado} no existe`
                                });
                            }
                            else {
                                let prodCartMg = carritoByID[0].productos
                                const findIndex = prodCartMg.findIndex(e => e.title === productoIDMg.title)
                                if (findIndex != -1) {
                                    prodCartMg[findIndex].stock = prodCartMg[findIndex].stock + 1
                                    const carritoNuevo = await carritoProductos.updateCarritoByID(idSolicitado, prodCartMg)
                                    productoIDMg.stock = productoIDMg.stock - 1
                                    await productosEnBD.updateById(idProducto, productoIDMg)
                                    res.json({
                                        message: "Carrito Actualizado con exito",
                                        carrito: carritoNuevo
                                    })
                                } else {
                                    productoIDMg.stock = productoIDMg.stock - 1
                                    await productosEnBD.updateById(idProducto, productoIDMg)
                                    productoIDMg.stock = 1
                                    prodCartMg = prodCartMg.concat(productoIDMg)
                                    const carritoNuevo = await carritoProductos.updateCarritoByID(idSolicitado, prodCartMg)
                                    res.json({
                                        message: "Carrito Actualizado con exito",
                                        carrito: carritoNuevo
                                    })
                                }
                            }
                        }
                        else {
                            res.json({
                                message: `No hay suficiente stock del producto de id: ${productoIDMg.id}`
                            })
                        }
                    }
                    else {
                        if (productoByID != undefined) {
                            if (productoByID.stock > 0) {
                                const indexDelProducto = carritoByID.productos.findIndex(elemen => elemen.id === productoByID.id)
                                if (indexDelProducto != -1) {
                                    carritoByID.productos[indexDelProducto].stock = carritoByID.productos[indexDelProducto].stock + 1
                                    carritoProductos.updateCarritoByID(idSolicitado, carritoByID.productos)
                                    res.json({
                                        message: `Se actualizo el carrito ${idSolicitado} correctamente`,
                                        productos: carritoByID.productos
                                    })
                                    actualizarProducto(productoByID)
                                } else {
                                    const newProduct = primerStock(productoByID)
                                    carritoByID.productos.push(newProduct)
                                    carritoProductos.updateCarritoByID(idSolicitado, carritoByID.productos)
                                    res.json({
                                        message: `Se actualizo el carrito ${idSolicitado} correctamente`,
                                        productos: carritoByID.productos
                                    })
                                    actualizarProducto(productoByID)
                                }
                            } else {
                                res.json({
                                    message: `No hay suficiente stock del producto de id: ${productoByID.id}`
                                })
                            }
                        } else {
                            res.json({
                                message: `El producto de id: ${idProducto}, no existe`
                            })
                        }
                    }
            }
        }
        else {
            res.json({ message: `El carrito no corresponde la usuario ${req.user.userName}` })
        }
    } catch (error) {
        console.log(error)
    }
})

carritoRouter.delete("/:id", checkLogin, async (req, res) => {
    const { id } = req.params
    try {
        const carritoAeliminar = await carritoProductos.deleteCarritoByID(id)
        if (carritoAeliminar == 1) {
            res.json({
                message: `El carrito de id : ${id} no existe`
            })
        } else if (carritoAeliminar == 2) {
            res.json({
                message: "El Archivo esta vacio"
            })
        }
        else {
            res.json({
                message: `Se elimino el carrito de id : ${id}`
            })
        }

    } catch (error) {
        console.log(error)
    }
})

carritoRouter.delete("/:id/productos/:id_prod", checkLogin, async (req, res) => {
    const idSolicitado = (req.params.id)
    const idProducto = (req.params.id_prod)
    try {
        const carritoByID = await carritoProductos.getCarritoByID(idSolicitado)
        switch (carritoByID) {
            case 1:
                res.json({
                    message: `El Carrito con id ${idSolicitado} no existe`
                });
                break;
            case undefined:
                res.json({
                    message: `El Carrito con id ${idSolicitado} no existe`
                });
                break;
            case 2:
                res.json({
                    message: `Actualmente no existe ningun carrito creado`
                });
                break;
            case undefined:
                res.json({
                    message: `El archivo esta vacio`
                })
            default:
                const esArray = Array.isArray(carritoByID)
                if (esArray) {
                    if (carritoByID == "") {
                        res.json({
                            message: `El Carrito con id ${idSolicitado} no existe`
                        });
                    } else {
                        let carritoByIDJSON = carritoByID[0]
                        const indexProducto = carritoByIDJSON.productos.findIndex(elm => elm._id == idProducto)
                        if (indexProducto != -1) {
                            const productosActualizados = carritoByIDJSON.productos.filter(elm => elm._id != idProducto)
                            carritoProductos.updateCarritoByID(idSolicitado, productosActualizados)
                            res.json({
                                message: "Se borro los datos correctamente"
                            })
                        } else {
                            res.json({
                                message: "No esta el producto en el carrito"
                            })
                        }
                    }
                }
                else {
                    const indexProducto = carritoByID.productos.findIndex(elm => elm.id == idProducto)
                    if (indexProducto != -1) {
                        const productosActualizados = carritoByID.productos.filter(elm => elm.id != idProducto)
                        carritoProductos.updateCarritoByID(idSolicitado, productosActualizados)
                        res.json({
                            message: "Se borro los datos correctamente"
                        })
                    } else {
                        res.json({
                            message: "No esta el producto en el carrito"
                        })
                    }
                }
        }
    } catch (error) {
        console.log(error)
    }
})
carritoRouter.post("/:id/pago", checkLogin, async (req, res) => {
    const idSolicitado = req.params.id
    const finalizar = req.body.fin
    try {
        const carritoByID = await carritoProductos.getCarritoByID(idSolicitado)
        if (carritoByID[0].userName == req.user.userName) {
            const productosCart = carritoByID[0].productos
            const productos = productosCart.map(producto => {
                let compra = [{
                    "Producto ": producto.title,
                    "Cantidad Solicitada": producto.stock,
                    "Precio Unitario": producto.price
                }]
                return compra
            })
            const prodEmail = JSON.stringify(productos, null, 2)
            //Envio Email
            if (finalizar == "si") {
                tpEmail.sendMail({
                    from: "Node",
                    to: config.EmailAdm,
                    subject: `Nueva Compra del usuario:${req.user.name},  del mail:${req.user.userName}`,
                    text: `Solicito los siguientes productos:  ${prodEmail}
                    `
                },
                    (error, response) => {
                        if (error) {
                            logger.info(error)
                            logger.error(`Se produjo un error al enviar el email al admin ${error}`)
                        } else {
                            logger.info("Se registro el usuario correctamente")
                        }
                    })
                //Envio whatsapp
                twClient.messages.create({
                    body: `Nueva Compra del usuario:${req.user.name},  del mail:${req.user.userName}`,
                    from: `whatsapp:${config.TwilloAdminWsp}`,
                    to: `whatsapp:${config.AdminWSP}`
                }, (error) => {
                    if (error) {
                        logger.error(`Se produjo un error al enviar el mensaje de whatsapp al admin ${error}`)
                    } else {
                        logger.info(`Se envio el mensaje correcatamente`)
                    }
                })
                // Envio SMS 
                //body: `Se confirmo el carrito con los productos: ${prodEmail}`,
                twClient.messages.create({
                    body: `El pedido se recibio, y esta en proceso`,
                    from: config.TwilloAdminTel,
                    to: `+${req.user.tel}`
                }, (error) => {
                    if (error) {
                        logger.error(`Se produjo un error al enviar el mensaje de tecto al admin ${error}`)
                    } else {
                        logger.info(`Se envio el mensaje correcatamente`)
                    }
                })
                res.json({
                    message: `El usuario ${req.user.userName} solicito la compra de los productos`,
                    Compra: productos
                })
            } else {
                res.json({ messages: "Se cancela el proceso de finalizacion de la compra" })
            }
        } else {
            res.json({ message: `El carrito no corresponde la usuario ${req.user.userName}` })
        }
    }
    catch (error) {
        logger.info(error)
        logger.error(error)
    }
})


export const cartRout = carritoRouter