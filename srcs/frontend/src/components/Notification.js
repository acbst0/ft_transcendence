import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    return (
        <div className={`notification-toast ${type}`}>
            <div className="notification-content">
                <i className={type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}></i>
                <span>{message}</span>
            </div>
            <button onClick={onClose} className="notification-close">&times;</button>
        </div>
    );
};

export default Notification;