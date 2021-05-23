const router = require('express').Router()
const uploadController = require("../controllers/uploadController");
const uploadImage = require("../middleware/uploadImage");
const auth = require("../middleware/auth");

router.post('/uploadavatar', uploadImage, auth, uploadController.uploadAvatar)

module.exports = router