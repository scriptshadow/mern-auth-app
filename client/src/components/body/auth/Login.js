import React, {useState} from 'react';
import {Link, useHistory} from "react-router-dom";
import axios from "axios";

import {showErrorMsg, showSuccessMsg} from "../../utils/notification/Notification";
import {useDispatch} from "react-redux";
import {dispatchLogin} from "../../../redux/actions/authAction";
import {GoogleLogin} from "react-google-login";
import FacebookLogin from 'react-facebook-login';

const initialState = {
    email: '',
    password: '',
    error: '',
    success: ''
}

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "66xxxxxxxxxxxxxxxx"
const appId = process.env.REACT_APP_FACEBOOK_APP_ID || "111xxxxxxxx"

function Login() {
    const [user, setUser] = useState(initialState)
    const {email, password, error, success} = user

    const dispatch = useDispatch()
    const history = useHistory()

    const handleChangeInput = (e) => {
        const {name, value} = e.target
        setUser({...user, [name]: value, error: '', success: ''})
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post('/user/login', {email, password})
            setUser({...user, error: '', success: res.data.msg})
            localStorage.setItem('firstLogin', true)
            dispatch(dispatchLogin())
            history.push('/')

        } catch (err) {
            err.response.data.msg &&
            setUser({...user, error: err.response.data.msg, success: ''})
        }
    }

    const googleSuccess = async (response) => {
        try {
            const res = await axios.post('/user/googlelogin', {tokenId: response.tokenId})
            setUser({...user, error: '', success: res.data.msg})
            localStorage.setItem('firstLogin', true)
            dispatch(dispatchLogin())
            history.push('/')
        } catch (err) {
            err.response.data.msg &&
            setUser({...user, error: err.response.data.msg, success: ''})
        }
    }
    const googleFailure = (error) => {
        //console.log(error)
        console.log("Connexion avec Google a echouée!")
    }

    const responseFacebook = async (response) => {
        try {
            const {accessToken, userID} = response
            const res = await axios.post('/user/facebooklogin', {accessToken, userID})
            setUser({...user, error: '', success: res.data.msg})
            localStorage.setItem('firstLogin', true)
            dispatch(dispatchLogin())
            history.push('/')
        } catch (err) {
            err.response.data.msg &&
            setUser({...user, error: err.response.data.msg, success: ''})
        }
    }

    return (
        <div className="login-page">
            <h2>Authentification</h2>

            {error && showErrorMsg(error)}
            {success && showSuccessMsg(success)}

            <form onSubmit={handleSubmit}>
                <div className="">
                    <label htmlFor="email"> E-mail</label>
                    <input type="email" name='email' placeholder="Précisez votre email" id='email' value={email} onChange={handleChangeInput}/>
                </div>
                <div className="">
                    <label htmlFor="password"> Mot de passe</label>
                    <input type="password" name='password' placeholder="Précisez votre mot de passe" id='password' value={password} onChange={handleChangeInput}/>
                </div>
                <div className="row">
                    <button type='submit'>S'identifier</button>
                    <Link to="/forgot">Mot de passe oublié ?</Link>
                </div>
            </form>
            <div className="hr"> Ou </div>
            <div className="socail">
                <GoogleLogin
                    clientId={clientId}
                    buttonText="Se connecter via Google"
                    onSuccess={googleSuccess}
                    onFailure={googleFailure}
                    cookiePolicy={'single_host_origin'}
                />
                <FacebookLogin
                    appId={appId}
                    autoLoad={false}
                    fields="name,email,picture"
                    icon="fa-facebook"
                    textButton="  Se connecter via Facebook"
                    callback={responseFacebook} />
            </div>
            <p>Vous n'avez pas de compte? <Link to="/register">S'inscrire</Link></p>
        </div>
    );
}

export default Login;