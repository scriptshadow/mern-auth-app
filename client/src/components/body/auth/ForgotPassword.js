import React, {useState} from 'react';
import {Link} from "react-router-dom";
import axios from "axios";

import {showErrorMsg, showSuccessMsg} from "../../utils/notification/Notification";
import {isEmail} from "../../utils/validation/Validation";

const initialState = {
    email: '',
    error: '',
    success: ''
}

function ForgotPassword() {

    const [user, setUser] = useState(initialState)
    const {email, error, success} = user

    const handleChangeInput = (e) => {
        const {name, value} = e.target
        setUser({...user, [name]: value, error: '', success: ''})
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!isEmail(email))
            return setUser({...user, error: "L'adresse email est invalide.", success: ''})
        try {
            const res = await axios.post('/user/forgot', {email})
            return setUser({...user, error: '', success: res.data.msg})
        } catch (err) {
            err.response.data.msg &&
            setUser({...user, error: err.response.data.msg, success: ''})
        }
    }

    return (
        <div className="login-page fg-page">
            <h2>Mot de passe oublié ?</h2>

            <div className="row">
                {error && showErrorMsg(error)}
                {success && showSuccessMsg(success)}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="">
                    <label htmlFor="email"> E-mail</label>
                    <input type="email" name='email' placeholder="Précisez votre email" id='email' value={email} onChange={handleChangeInput}/>
                </div>
                <div className="row">
                    <button type='submit'>Envoyer</button>
                </div>
            </form>
            <p>Je me rappelle de mon mot de passe, <Link to="/login">Me connecter</Link></p>
        </div>
    );
}

export default ForgotPassword;