import React from 'react';
import {Switch, Route} from "react-router-dom";
import {useSelector} from "react-redux";

import Login from "./auth/Login";
import Register from "./auth/Register";
import ActivationEmail from "./auth/ActivationEmail";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import NotFound from "../utils/NotFound/NotFound";
import Profile from "./profile/Profile";
import Edit from "./profile/Edit";
import Home from "./home/Home";


function Body() {
    const auth = useSelector(state => state.auth)
    const {isLogged, isAdmin} = auth

    return (
        <section>
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route exact path="/login" component={isLogged ? NotFound : Login}/>
                <Route exact path="/register" component={isLogged ? NotFound : Register}/>
                <Route exact path="/forgot" component={isLogged ? NotFound : ForgotPassword}/>
                <Route exact path="/user/reset/:token" component={isLogged ? NotFound : ResetPassword}/>

                <Route exact path="/user/activate/:activation_token" component={ActivationEmail}/>

                <Route exact path="/profile" component={isLogged ? Profile : NotFound}/>
                <Route exact path="/edituser/:id" component={isAdmin ? Edit : NotFound}/>
            </Switch>
        </section>
    );
}

export default Body;