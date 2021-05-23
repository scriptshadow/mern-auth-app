require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const path = require('path')

const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(fileUpload({ useTempFiles: true }))

//Routes
app.use('/user', require('./routes/userRouter'))
app.use('/api', require('./routes/upload'))

//Conection à MongoDB

const URI = process.env.NODE_ENV !== 'production'
    ? process.env.MONGODB_LOCAL_URL
    : process.env.MONGODB_URL
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (error) => {
    if(error) throw error
    console.log("Connecté à mongodb")
})

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('/client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}else {
    app.use((req, res, next) => {
        res.json({msg: "API script shadow 2.0"})
    });
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Serveur demaré sur le port ${PORT}`)
})