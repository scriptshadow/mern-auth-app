import React from 'react';
import './notification.css';

export const showErrorMsg = (msg) => {
    return <div className="error-msg">{msg}</div>
}
export const showSuccessMsg = (msg) => {
    return <div className="success-msg">{msg}</div>
}