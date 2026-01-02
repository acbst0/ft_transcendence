import React from 'react';
import './Navbar.css';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
	return (
		<nav className="navbar glass">
			<div className="navbar-left">
				<a href="/" className="logo">Planora</a>
			</div>

			<div className="navbar-right">
				<div className="language-selector">
					<select className="lang-dropdown">
						<option value="en">🇺🇸 EN</option>
						<option value="tr">🇹🇷 TR</option>
						<option value="de">🇩🇪 DE</option>
						<option value="fr">🇫🇷 FR</option>
					</select>
				</div>

				<div className="auth-buttons">
					<button onClick={onLoginClick} className="btn-login">Login</button>
					<button onClick={onRegisterClick} className="btn-register">Register</button>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
