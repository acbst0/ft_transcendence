import React, { useEffect, useRef } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, onClick, duration = 3000 }) => {
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onCloseRef.current();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    return (
        <div className={`notification-toast ${type}`} onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="notification-content">
                <i className={type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}></i>
                <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{message.sender}</div>
                    <div style={{ fontSize: '13px', opacity: '0.9' }}>{message.content}</div>
                </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="notification-close">&times;</button>
        </div>
    );
};

export default Toast;