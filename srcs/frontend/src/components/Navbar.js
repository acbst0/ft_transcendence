import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-my-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <a href="/" className="logo">Planora</a>
            </div>

            <div className="navbar-right">
				<button onClick={toggleTheme} className="theme-toggle-btn">
				    {theme === 'light' ? (
				        <i className="fa-solid fa-moon"></i> 
				    ) : (
				        <i className="fa-solid fa-sun"></i> 
				    )}
				</button>
                <div className="auth-buttons">
                    <button onClick={onLoginClick} className="btn-login">Login</button>
                    <button onClick={onRegisterClick} className="btn-register">Register</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;