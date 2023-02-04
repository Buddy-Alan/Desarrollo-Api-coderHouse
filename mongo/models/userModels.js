import mongoose from "mongoose";
const usersCollections = "users"
const usersSchema = new mongoose.Schema(

    {
        name: {
            type: String,
            require: true
        },
        userName: {
            type: String,
            require: true,
            unique: true
        },
        password: {
            type: String,
            require: true
        },
        dir: {
            type: String,
            require: true
        },
        edad: {
            type: Number,
            require: true
        },
        avatar: {
            type: String,
            require: true
        },
        tel: {
            type: String,
            require: true
        }
    }

)

export const userModels = mongoose.model(usersCollections, usersSchema)