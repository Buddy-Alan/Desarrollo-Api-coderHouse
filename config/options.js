
import { chatModels } from "../mongo/models/chat.js"
import { userModels } from "../mongo/models/userModels.js"
import { productModels } from "../mongo/models/product.js"
import { cartModels } from "../mongo/models/cart.js"

const options = {

    mongo: {
        chat: chatModels,
        users: userModels,
        products: productModels,
        carts: cartModels
    },
    fileSystem: {
        chat: "chat.txt"
    }
}

export { options }