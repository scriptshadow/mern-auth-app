import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {isLength, isMatch} from "../../utils/validation/Validation";
import axios from "axios";
import {showErrorMsg, showSuccessMsg} from "../../utils/notification/Notification";
import {dispatchGetAllUsers, fetchAllUsers} from "../../../redux/actions/usersAction";

const initialState = {
    name: '',
    password: '',
    cf_password: '',
    error: '',
    success: ''
}

function Profile() {
    const auth = useSelector(state => state.auth)
    const token = useSelector(state => state.token)
    const users = useSelector(state => state.users)

    const {user, isAdmin} = auth
    const [data, setData] = useState(initialState)
    const {name, password, cf_password, error, success} = data
    const [avatar, setAvatar] = useState(false)
    const [loading, setLoading] = useState(false)
    const [callback, setCallback] = useState(false)

    const dispatch = useDispatch()
    useEffect(() => {
        if(isAdmin){
            fetchAllUsers(token).then((res) => {
                dispatch(dispatchGetAllUsers(res))
            })
        }
    }, [token, isAdmin, dispatch, callback])
    
    const handleChangeAvatar = async (e) => {
        e.preventDefault()
        try {
            const file = e.target.files[0]

            if(!file) return setData({...data, error: "Aucun fichier à uploader.", success: ''})
            if(file.size > 1024 * 1024) return setData({...data, error: "La taille du fichier ne doit pas depasser 1Mb.", success: ''})
            if(file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png')
                return setData({...data, error: "Format du fichier incorrect: JPG et PNG uniquement.", success: ''})

            let formData = new FormData()
            formData.append('file', file)
            setLoading(true)
            const res = await axios.post('/api/uploadavatar',formData, {
                headers: {'content-type': 'multipart/form-data', Authorization: token}
            })
            setLoading(false)
            setAvatar(res.data.url)
            //setData({...data, error: '', success: res.data.msg})
        } catch (err) {
            err.response.data.msg &&
            setData({...data, error: err.response.data.msg, success: ''})
        }
    }
    const handleChangeInput = (e) => {
        const {name, value} = e.target
        setData({...data, [name]: value, error: '', success: ''})
    }
    const updateUser = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.patch('/user/update',{
                name: name ? name : user.name,
                avatar: avatar ? avatar : user.avatar,
            }, {
                headers: {Authorization: token}
            })
            setData({...data, error: '', success: res.data.msg})
        } catch (err) {
            err.response.data.msg &&
            setData({...data, error: err.response.data.msg, success: ''})
        }
    }
    const updateUserPassword = async (e) => {
        e.preventDefault()
        if(isLength(password))
            return setData({...data, error: "Le mot de passe doit être au moins 6 caratères.", success: ''})
        if(!isMatch(password, cf_password))
            return setData({...data, error: "Les 2 mots de passe ne correspondents pas.", success: ''})
        try {
            const res = await axios.post('/user/reset',{password}, {
                headers: {Authorization: token}
            })
            setData({...data, error: '', success: res.data.msg})
        } catch (err) {
            err.response.data.msg &&
            setData({...data, error: err.response.data.msg, success: ''})
        }
    }
    const handleUpdate = (e) => {
        if(name || avatar) updateUser(e)
        if(password) updateUserPassword(e)
    }
    const handleDelete = async (id) => {
        try {
            if(user._id !== id){
                if(window.confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")){
                    setLoading(true)
                    const res = await axios.delete(`/user/delete/${id}`,  {
                        headers: {Authorization: token}
                    })
                    setLoading(false)
                    setCallback(!callback)
                    setData({...data, error: '', success: res.data.msg})
                }
            }
        } catch (err) {
            err.response.data.msg &&
            setData({...data, error: err.response.data.msg, success: ''})
        }
    }

    return (
        <>
            <div>
                {error && showErrorMsg(error)}
                {success && showSuccessMsg(success)}
                {loading && <h3>Loading...</h3>}
            </div>
            <div className="profile-page">
                <div className="col-left">
                    <h2>Compte {isAdmin ? 'administrateur' : 'utilisateur'}</h2>
                    <div>
                        <div className="avatar">
                            <img src={avatar ? avatar : user.avatar} alt={user.name}/>
                            <span>
                            <i className="fas fa-camera"></i>
                            <p>Changer</p>
                            <input type="file" name="file" id="file-upload" onChange={handleChangeAvatar}/>
                        </span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">Nom & Prénoms</label>
                            <input type="text" name='name' placeholder="Précisez votre Nom & Prénoms" id='name' defaultValue={user.name} onChange={handleChangeInput}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input type="text" name='email' placeholder="Précisez votre email" id='email' defaultValue={user.email} disabled/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Nouveau mot de passe</label>
                            <input type="password" name='password' placeholder="Précisez votre nouveau mot de passe" id='password' value={password} onChange={handleChangeInput}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="cf_password">Confirmation mot de passe</label>
                            <input type="password" name='cf_password' placeholder="Confirmez votre mot de passe" id='cf_password' value={cf_password} onChange={handleChangeInput}/>
                        </div>
                        <div>
                            <em style={{color: 'crimson'}}>
                                * If you update your password here,
                                you will not be able to login quickly using google and facebook
                            </em>
                        </div>
                        <div className="row">
                            <button type='submit' disabled={loading} onClick={handleUpdate}>Mettre à jour</button>
                        </div>
                    </div>
                </div>
                <div className="col-right">
                    <h2>{isAdmin ? 'Users' : 'Mes commandes'}</h2>
                    <div style={{overflowX: 'auto'}}>
                        <table className="customers">
                            <thead>
                                <th>#ID</th>
                                <th>Nom & Prénoms</th>
                                <th>E-mail</th>
                                <th>Admin</th>
                                <th>Actions</th>
                            </thead>
                            <tbody>
                            {
                                users.map((user) => (
                                    <tr key={user._id}>
                                        <td>#{user._id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {
                                                user.role === 1
                                                    ? <p><i className="fas fa-check"></i> Oui</p>
                                                    : <p><i className="fas fa-times"></i> Non</p>
                                            }
                                        </td>
                                        <td>
                                            <Link className="link-edit" to={`/edituser/${user._id}`} title="Editer"><i className="fas fa-edit"></i> Editer</Link> <br/>
                                            <span className="link-del" title="Supprimer" onClick={() => handleDelete(user._id)}><i className="fas fa-trash"></i> Sup</span>
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;