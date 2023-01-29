import mongoose from "mongoose";
const productCollections = "productos"
const productSchema = new mongoose.Schema(

    {

        timestamp: {
            type: Date,
            require: true
        },
        title: {
            type: String,
            require: true,
            unique: true
        },
        price: {
            type: Number,
            require: true
        },
        thumbnail: {
            type: String,
            require: true
        },
        descripcion: {
            type: String,
            require: true
        },
        stock: {
            type: Number,
            require: true
        },
        codigo: {
            type: String,
            require: true
        }
    }

)

export const productModels = mongoose.model(productCollections,productSchema)