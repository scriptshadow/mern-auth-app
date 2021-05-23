import React, {useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {useHistory, useParams} from "react-router-dom";
import axios from "axios";
import {showErrorMsg, showSuccessMsg} from "../../utils/notification/Notification";

function Edit() {
    const {id} = useParams()
    const [editUser, setEditUser] = useState([])
    const token = useSelector(state => state.token)
    const users = useSelector(state => state.users)
    const history = useHistory()

    const [checkAdmin, setCheckAdmin] = useState(false)
    const [error, setError] = useState(false)
    const [success, setSuccess] = useState(false)
    const [num, setNum] = useState(0)

    const handleUpdate = async (e) => {
        e.preventDefault()

        try {
            if (num % 2 !== 0) {
                const res = await axios.patch(`/user/updaterole/${editUser._id}`, {role: checkAdmin ? 1 : 0}, {
                    headers: {Authorization: token}
                })
                setSuccess(res.data.msg)
                setNum(0)
            }
        } catch (err) {
            err.response.data.msg &&
            setError(err.response.data.msg)
        }
    }
    const handleCheck = () => {
        setSuccess('')
        setError('')
        setCheckAdmin(!checkAdmin)
        setNum(num + 1)
    }
    useEffect(() => {
        if(users.length !== 0){
            users.forEach((user) => {
                if(user._id === id){
                    setEditUser(user)
                    setCheckAdmin(user.role === 1 ? true: false)
                }
            })
        } else {
            history.push('/profile')
        }
    }, [users, id, history])

    return (
        <>
            <div className="profile-page edit-user">
                <div className="row">
                    <button onClick={() => history.goBack()} className="btn-go-back">
                        <i className="fas fa-long-arrow-alt-left"></i> Retour
                    </button>
                </div>
                <div className="col-left">
                    <h2>Compte {checkAdmin ? 'administrateur' : 'utilisateur'}</h2>
                    <div>
                        <div className="form-group">
                            <label htmlFor="name">Nom & Prénoms</label>
                            <input type="text" name='name' id='name' defaultValue={editUser.name} disabled/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input type="text" name='email' id='email' defaultValue={editUser.email} disabled/>
                        </div>
                        <div className="form-group">
                            <input type="checkbox" name='isAdmin' id='isAdmin' checked={checkAdmin} onChange={handleCheck}/>
                            <label htmlFor="isAdmin">Est il admin ?</label>
                        </div>
                        <div className="row">
                            <button type='submit' onClick={handleUpdate}>Mettre à jour</button>
                        </div>
                        <div>
                            {error && showErrorMsg(error)}
                            {success && showSuccessMsg(success)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Edit;