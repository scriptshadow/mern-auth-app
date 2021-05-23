import React, {useState} from 'react';
import {Link} from "react-router-dom";
import axios from "axios";
import {showErrorMsg, showSuccessMsg} from "../../utils/notification/Notification";
import {isEmail, isEmpty, isLength, isMatch} from "../../utils/validation/Validation";

const initialState = {
    name: '',
    email: '',
    password: '',
    cf_password: '',
    error: '',
    success: ''
}

function Register() {

    const [user, setUser] = useState(initialState)
    const {name, email, password, cf_password, error, success} = user

    const handleChangeInput = (e) => {
        const {name, value} = e.target
        setUser({...user, [name]: value, error: '', success: ''})
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        if(isEmpty(name) || isEmpty(email) || isEmpty(password) || isEmpty(cf_password))
            return setUser({...user, error: "Veuillez remplir tous les champs.", success: ''})
        if(!isEmail(email))
            return setUser({...user, error: "L'adresse email est invalide.", success: ''})
        if(isLength(password))
            return setUser({...user, error: "Le mot de passe doit être au moins 6 caratères.", success: ''})
        if(!isMatch(password, cf_password))
            return setUser({...user, error: "Les 2 mots de passe ne correspondents pas.", success: ''})

        try {
            const res = await axios.post('/user/register',{
                name, email, password
            })
            setUser({...user, error: '', success: res.data.msg})
            //localStorage.setItem('firstLogin', true)

        } catch (err) {
            err.response.data.msg &&
            setUser({...user, error: err.response.data.msg, success: ''})
        }
    }

    return (
        <div className="login-page">
            <h2>Identification</h2>

            {error && showErrorMsg(error)}
            {success && showSuccessMsg(success)}

            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="">
                    <label htmlFor="name">Nom & Prénoms</label>
                    <input type="text" name='name' placeholder="Précisez votre Nom & Prénoms" id='name' value={name} onChange={handleChangeInput}/>
                </div>
                <div className="">
                    <label htmlFor="email">E-mail</label>
                    <input type="text" name='email' placeholder="Précisez votre email" id='email' value={email} onChange={handleChangeInput}/>
                </div>
                <div className="">
                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" name='password' placeholder="Précisez votre mot de passe" id='password' value={password} onChange={handleChangeInput}/>
                </div>
                <div className="">
                    <label htmlFor="cf_password">Confirmation mot de passe</label>
                    <input type="password" name='cf_password' placeholder="Confirmez votre mot de passe" id='cf_password' value={cf_password} onChange={handleChangeInput}/>
                </div>
                <div className="row">
                    <button type='submit'>S'inscrire</button>
                </div>
            </form>
            <p>Vous avez déjà un compte? <Link to="/login">Se connecter</Link></p>
        </div>
    );
}

export default Register;