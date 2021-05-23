const mongoose = require('mongoose')

const userShema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Précisez votre nom svp"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Précisez votre E-mail svp"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Précisez votre mot de passe svp"],
    },
    role: {
        type: Number,
        default: 0, //0=user, 1=admin
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png",
    },
}, {
    timestamps: true
})

module.exports = mongoose.model("Users", userShema)