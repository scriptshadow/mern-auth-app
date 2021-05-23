const fs = require('fs')

module.exports = async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0)
            return res.status(400).json({msg: "Aucun fichier à uploader."})

        const  file = req.files.file

        if(file.size > 1024 * 1024) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "La taille du fichier ne doit pas depasser 1Mb."})
        }
        if(file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "Format du fichier incorrect: JPG et PNG uniquement."})
        }
        next()
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

const removeTmp = (path) => {
    fs.unlink(path, (err) => {
        if(err) throw err
    })
}