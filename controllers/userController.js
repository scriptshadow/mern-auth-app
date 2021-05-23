const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendMail = require("./sendMail")

const {google} = require('googleapis')
const {OAuth2} = google.auth
const fetch = require('node-fetch')
const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID)


const { CLIENT_URL } = process.env

const userController = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body
            if(!name || !email || !password)
                return res.status(400).json({msg: "Veuillez remplir tous les champs."})

            if(!validateEmail(email))
                return res.status(400).json({msg: "L'adresse email est invalide."})

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: "Cet adresse email est déjà utilisé."})

            if(password.length < 6) return res.status(400).json({msg: "Le mot de passe doit être au moins 6 caratères."})

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = {
                name, email, password: passwordHash
            }
            const activation_token = createActivationToken(newUser)
            const url = `${CLIENT_URL}/user/activate/${activation_token}`

            sendMail(email, url)

            res.json({msg: "Inscription reussie! Veuillez activer votre compte pour profiter de nos services."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    activateEmail: async (req, res) => {
        try {
            const {activation_token} = req.body
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)
            const {name, email, password} = user

            const check = await Users.findOne({email})
            if(check) return res.status(400).json({msg: "Cet adresse email est déjà utilisé."})

            const newUser = new Users({name, email, password})
            await newUser.save()

            res.json({msg: "Le compte a bien été activé!"})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    login: async (req, res) => {
        try {
            const {email, password} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "Ce compte n'existe pas: Email!"})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg: "Ce compte n'existe pas: Password!"})

            const refresh_token = createRefreshToken({id: user._id})
            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Jours
            })

            res.json({msg: "Connexion reussie!"})
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if(!rf_token) return res.status(400).json({msg: "Veuillez-vous connecter à présent."})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if(err) return res.status(400).json({msg: "Veuillez-vous connecter à présent."})
                const access_token = createAccessToken({id: user.id})
                res.json({access_token})
            })
            //res.json({msg: "Connexion reussie!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const {email} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "Aucun compte ne correspond à cet email!"})

            const access_token = createAccessToken({id: user._id})
            const url = `${CLIENT_URL}/user/reset/${access_token}`

            sendMail(email, url, "Rénitialiser mon mot de passe")

            res.json({msg: "Re-envoyer le mot de passe, veuillez vérifier votre email."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    resetPassword: async (req, res) => {
        try {
            const {password} = req.body
            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({_id: req.user.id}, {
                password: passwordHash
            })

            res.json({msg: "Le mot de passe a bien été mis à jour!"})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserInfo: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password')
            res.json(user)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserAllInfos: async (req, res) => {
        try {
            const users = await Users.find().select('-password')
            res.json(users)

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', {path: '/user/refresh_token'})
            res.json({msg: "Vous êtes maintenant déconnecté!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUser: async (req, res) => {
        try {
            const {name, avatar} = req.body
            await Users.findOneAndUpdate({_id: req.user.id}, {
                name, avatar
            })
            res.json({msg: "Vos informations ont bien été mis à jour!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUsersRole: async (req, res) => {
        try {
            const {role} = req.body
            await Users.findOneAndUpdate({_id: req.params.id}, {
                role
            })

            res.json({msg: "Le role a bien été mis à jour!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteUser: async (req, res) => {
        try {
            await Users.findByIdAndDelete(req.params.id)
            res.json({msg: "Le compte a bien été supprimé!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    googleLogin: async (req, res) => {
        try {
            const {tokenId} = req.body

            const verify = await client.verifyIdToken({idToken: tokenId, audience: process.env.MAILING_SERVICE_CLIENT_ID})

            const {email_verified, email, name, picture} = verify.payload

            const password = email + process.env.GOOGLE_TOKEN_SECRET
            const passwordHash = await bcrypt.hash(password, 12)

            if(!email_verified) return res.status(400).json({msg: "Vérification de l'adresse email a échoué."})

            const user = await Users.findOne({email})
            if(user) {
                const isMatch = await bcrypt.compare(password, user.password)
                if(!isMatch) return res.status(400).json({msg: "Ce compte n'existe pas: Password!"})

                const refresh_token = createRefreshToken({id: user._id})
                res.cookie('refreshtoken', refresh_token, {
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Jours
                })
                res.json({msg: "Connexion reussie!"})
            } else {
                const newUser = new Users({
                    name, email, password: passwordHash, avatar: picture
                })
                await newUser.save()

                const refresh_token = createRefreshToken({id: newUser._id})
                res.cookie('refreshtoken', refresh_token, {
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Jours
                })
                res.json({msg: "Connexion reussie!"})
            }
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    facebookLogin: async (req, res) => {
        try {
            const {accessToken, userID} = req.body
            const URL = `https://graph.facebook.com/v2.9/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`
            const data = await fetch(URL).then(res => res.json()).then(res => { return res })

            const {email, name, picture} = data

            const password = email + process.env.FACEBOOK_TOKEN_SECRET
            const passwordHash = await bcrypt.hash(password, 12)

            const user = await Users.findOne({email})

            if(user) {
                const isMatch = await bcrypt.compare(password, user.password)
                if(!isMatch) return res.status(400).json({msg: "Ce compte n'existe pas: Password!"})

                const refresh_token = createRefreshToken({id: user._id})
                res.cookie('refreshtoken', refresh_token, {
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Jours
                })
                res.json({msg: "Connexion reussie!"})
            } else {
                const newUser = new Users({
                    name, email, password: passwordHash, avatar: picture.data.url
                })
                await newUser.save()

                const refresh_token = createRefreshToken({id: newUser._id})
                res.cookie('refreshtoken', refresh_token, {
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Jours
                })
                res.json({msg: "Connexion reussie!"})
            }
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {expiresIn: '5m'});
}
const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}
const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
}

module.exports = userController