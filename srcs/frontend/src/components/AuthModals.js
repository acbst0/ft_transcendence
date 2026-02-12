import React, { useState } from 'react';
import Modal from './Modal';
import KVKKModal from './KVKKModal';
import TermsModal from './TermsModal';
import './AuthModals.css';

export const LoginModal = ({ isOpen, onClose, onSuccess }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		try {
			const response = await fetch('/api/auth/login/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem('token', data.token);
				localStorage.setItem('user', JSON.stringify({ id: data.user_id, username: data.username }));
				if (onSuccess) onSuccess();
			} else {
				setError(data.non_field_errors ? data.non_field_errors[0] : 'Login failed');
			}
		} catch (err) {
			setError('Network error');
		}
	};

	const handleGoogleLogin = () => {
		const backendUrl = window.location.origin;
		window.location.href = `${backendUrl}/auth/login/google-oauth2/`;
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Welcome Back">
			<form className="auth-form" onSubmit={handleSubmit}>
				{error && <div className="error-message" style={{ color: '#ff4d4f', fontSize: '14px' }}>{error}</div>}
				<div className="form-group">
					<label>Username</label>
					<input
						type="text"
						placeholder="Enter your username"
						className="glass-input"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
				<div className="form-group">
					<label>Password</label>
					<input
						type="password"
						placeholder="Enter your password"
						className="glass-input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<button type="submit" className="primary-btn">Sign In</button>

				<div className="divider">
					<span>or continue with</span>
				</div>

				<button type="button" className="google-btn" onClick={handleGoogleLogin}>
					<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
					Google
				</button>
			</form>
		</Modal>
	);
};

export const RegisterModal = ({ isOpen, onClose, onSuccess }) => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [kvkkAccepted, setKvkkAccepted] = useState(false);
	const [error, setError] = useState('');

	const [isKVKKOpen, setIsKVKKOpen] = useState(false);
	const [isTermsOpen, setIsTermsOpen] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!kvkkAccepted) {
			setError('You must accept the KVKK and Terms to register.');
			return;
		}

		try {
			const response = await fetch('/api/auth/register/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, password, kvkkAccepted })
			});

			const data = await response.json();

			if (response.ok) {
				onClose();
				if (onSuccess) onSuccess('Account created! Please login.');;
			} else {
				let msg = 'Registration failed';
				if (data.username) msg = `Username: ${data.username[0]}`;
				else if (data.email) msg = `Email: ${data.email[0]}`;
				else if (data.password) msg = `Password: ${data.password[0]}`;
				else if (data.error) msg = data.error;
				setError(msg);
			}
		} catch (err) {
			setError('Network error');
		}
	};

	const handleGoogleRegister = () => {
		const backendUrl = window.location.origin;
		window.location.href = `${backendUrl}/auth/login/google-oauth2/`;
	};

	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose} title="Create Account">
				<form className="auth-form" onSubmit={handleSubmit}>
					{error && <div className="error-message" style={{ color: '#ff4d4f', fontSize: '14px' }}>{error}</div>}
					<div className="form-group">
						<label>Username</label>
						<input
							type="text"
							placeholder="Choose a username"
							className="glass-input"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>
					<div className="form-group">
						<label>Email</label>
						<input
							type="email"
							placeholder="Enter your email"
							className="glass-input"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="form-group">
						<label>Password</label>
						<input
							type="password"
							placeholder="Choose a password"
							className="glass-input"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<div className="form-group checkbox-group">
						<label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', cursor: 'pointer', flexWrap: 'wrap' }}>
							<input
								type="checkbox"
								checked={kvkkAccepted}
								onChange={(e) => setKvkkAccepted(e.target.checked)}
								style={{ width: 'auto', margin: 0 }}
							/>
							<span>
								I have read and accept the{' '}
								<a href="#" onClick={(e) => { e.preventDefault(); setIsKVKKOpen(true); }} style={{ color: '#390f50', fontWeight: 'bold' }}>
									KVKK
								</a>{' '}
								and{' '}
								<a href="#" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} style={{ color: '#390f50', fontWeight: 'bold' }}>
									Terms of Service
								</a>.
							</span>
						</label>
					</div>
					<button type="submit" className="primary-btn">Sign Up</button>

					<div className="divider">
						<span>or continue with</span>
					</div>

					<button type="button" className="google-btn" onClick={handleGoogleRegister}>
						<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
						Google
					</button>
				</form>
			</Modal>
			<KVKKModal isOpen={isKVKKOpen} onClose={() => setIsKVKKOpen(false)} />
			<TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
		</>
	);
};