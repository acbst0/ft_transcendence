import React, { useState } from 'react';
import Modal from './Modal';
import './AuthModals.css';

export const LoginModal = ({ isOpen, onClose }) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Welcome Back">
			<form className="auth-form" onSubmit={(e) => e.preventDefault()}>
				<div className="form-group">
					<label>Email</label>
					<input type="email" placeholder="Enter your email" className="glass-input" />
				</div>
				<div className="form-group">
					<label>Password</label>
					<input type="password" placeholder="Enter your password" className="glass-input" />
				</div>
				<button type="submit" className="primary-btn">Sign In</button>

				<div className="divider">
					<span>or continue with</span>
				</div>

				<button type="button" className="google-btn">
					<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
					Google
				</button>
			</form>
		</Modal>
	);
};

export const RegisterModal = ({ isOpen, onClose }) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Create Account">
			<form className="auth-form" onSubmit={(e) => e.preventDefault()}>
				<div className="form-group">
					<label>Username</label>
					<input type="text" placeholder="Choose a username" className="glass-input" />
				</div>
				<div className="form-group">
					<label>Email</label>
					<input type="email" placeholder="Enter your email" className="glass-input" />
				</div>
				<div className="form-group">
					<label>Password</label>
					<input type="password" placeholder="Choose a password" className="glass-input" />
				</div>
				<button type="submit" className="primary-btn">Sign Up</button>

				<div className="divider">
					<span>or continue with</span>
				</div>

				<button type="button" className="google-btn">
					<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
					Google
				</button>
			</form>
		</Modal>
	);
};
