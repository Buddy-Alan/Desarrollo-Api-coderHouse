import mongoose from "mongoose";
const cartCollections = "cart"

const cartSchema = new mongoose.Schema(

    {

        timestamp: {
            type: Date,
            require: true
        },
        userName: {
            type: String,
            require: true,
            unique: true
        },
        productos: []
    }

)

export const cartModels = mongoose.model(cartCollections, cartSchema)