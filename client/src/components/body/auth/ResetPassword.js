import React, {useState} from 'react';
import {useParams} from "react-router-dom";
import axios from "axios";
import {showErrorMsg, showSuccessMsg} from "../../utils/notification/Notification";
import {isEmpty, isLength, isMatch} from "../../utils/validation/Validation";

const initialState = {
    password: '',
    cf_password: '',
    error: '',
    success: ''
}

function ResetPassword() {
    const {token} = useParams()

    const [user, setUser] = useState(initialState)
    const {password, cf_password, error, success} = user

    const handleChangeInput = (e) => {
        const {name, value} = e.target
        setUser({...user, [name]: value, error: '', success: ''})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(isEmpty(password) || isEmpty(cf_password))
            return setUser({...user, error: "Veuillez remplir tous les champs.", success: ''})
        if(isLength(password))
            return setUser({...user, error: "Le mot de passe doit être au moins 6 caratères.", success: ''})
        if(!isMatch(password, cf_password))
            return setUser({...user, error: "Les 2 mots de passe ne correspondents pas.", success: ''})
        try {
            const res = await axios.post('/user/reset',{password}, {
                headers: {Authorization: token}
            })
            setUser({...user, error: '', success: res.data.msg})
        } catch (err) {
            err.response.data.msg &&
            setUser({...user, error: err.response.data.msg, success: ''})
        }
    }

    return (
        <div className="login-page">
            <h2>Renitialisation mot de passe</h2>

            {error && showErrorMsg(error)}
            {success && showSuccessMsg(success)}

            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="">
                    <label htmlFor="password">Nouveau mot de passe</label>
                    <input type="password" name='password' placeholder="Précisez votre nouveau mot de passe" id='password' value={password} onChange={handleChangeInput}/>
                </div>
                <div className="">
                    <label htmlFor="cf_password">Confirmation mot de passe</label>
                    <input type="password" name='cf_password' placeholder="Confirmez votre mot de passe" id='cf_password' value={cf_password} onChange={handleChangeInput}/>
                </div>
                <div className="row">
                    <button type='submit'>Renitialiser</button>
                </div>
            </form>
        </div>
    );
}

export default ResetPassword;