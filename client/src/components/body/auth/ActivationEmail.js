import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import axios from "axios";
import {showErrorMsg, showSuccessMsg} from "../../utils/notification/Notification";


function ActivationEmail() {
    const {activation_token} = useParams()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if(activation_token){
            const activationEmail = async () => {
                try {
                    const res = await axios.post('/user/activation', {activation_token})
                    setSuccess(res.data.msg)
                } catch (err) {
                    err.response.data.msg && setError(err.response.data.msg)
                }
            }
            activationEmail()
        }
    }, [activation_token])
    return (
        <div className="activation-page">
            {error && showErrorMsg(error)}
            {success && showSuccessMsg(success)}
        </div>
    )
}

export default ActivationEmail;