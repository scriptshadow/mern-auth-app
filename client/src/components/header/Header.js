import React from 'react';
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import axios from "axios";

function Header() {
    const auth = useSelector(state => state.auth)
    const {user, isLogged} = auth
    const handleLogout = async () => {
        try {
            await axios.get('/user/logout')
            localStorage.removeItem('firstLogin')
            window.location.href = '/'
        } catch (err) {
            window.location.href = '/'
        }
    }
    const userLink = () => {
        return <li className="drop-nav">
            <Link to="#" className="avatar">
                <img src={user.avatar} alt={user.name}/> {user.name} <i className="fas fa-angle-down"></i>
            </Link>
            <ul className="dropdown">
                <li><Link to="/profile">Profil</Link></li>
                <li><Link to="/" onClick={handleLogout}>Déconnexion</Link></li>
            </ul>
        </li>
    }
    const transForm = {
        transform: isLogged ? "translateY(-5px)" : 0
    }
    return (
        <header>
            <div className="logo">
                <h1><Link to="/">Script✮Dev</Link></h1>
            </div>
            <ul style={transForm}>
                <li><Link to="/"><i className="fas fa-shopping-cart"></i> Panier</Link></li>
                {
                    isLogged
                    ? userLink()
                    : <li><Link to="/login"><i className="fas fa-user"></i> Se connecter</Link></li>
                }
            </ul>
        </header>
    );
}

export default Header;