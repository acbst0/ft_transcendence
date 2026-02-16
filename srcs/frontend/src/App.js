import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { LoginModal, RegisterModal } from './components/AuthModals';
import Notification from './components/Notification';

function MainLayout() {
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);
	
	const [notification, setNotification] = useState({ message: '', type: '' });

	const navigate = useNavigate();
	const location = useLocation();
	const isDashboard = location.pathname === '/dashboard';

	const showNotify = (message, type = 'success') => {
		setNotification({ message, type });
	};

	const handleLoginSuccess = () => {
		setIsLoginOpen(false);
		navigate('/dashboard');
	};

	const handleRegisterSuccess = () => {
		setIsRegisterOpen(false);
		showNotify('Account created successfully! Please login.', 'success');
	};

	React.useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const oauthToken = urlParams.get('oauth_token');
		const userId = urlParams.get('user_id');
		const username = urlParams.get('username');
		const oauthError = urlParams.get('oauth_error');

		if (oauthToken && userId && username) {
			localStorage.setItem('token', oauthToken);
			localStorage.setItem('user', JSON.stringify({ id: userId, username: username }));
			window.history.replaceState({}, document.title, '/');
			navigate('/dashboard');
		} else if (oauthError) {
			showNotify('Google authentication failed: ' + oauthError, 'error');
			window.history.replaceState({}, document.title, '/');
		}
	}, [navigate]);

	return (
		<>
			<Notification 
				message={notification.message} 
				type={notification.type} 
				onClose={() => setNotification({ message: '', type: '' })} 
			/>

			{!isDashboard && (
				<Navbar
					onLoginClick={() => setIsLoginOpen(true)}
					onRegisterClick={() => setIsRegisterOpen(true)}
				/>
			)}
			
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/dashboard" element={<Dashboard />} />
			</Routes>

			{!isDashboard && <Footer />}

			<LoginModal
				isOpen={isLoginOpen}
				onClose={() => setIsLoginOpen(false)}
				onSuccess={handleLoginSuccess}
			/>
			
			<RegisterModal
				isOpen={isRegisterOpen}
				onClose={() => setIsRegisterOpen(false)}
				onSuccess={handleRegisterSuccess} 
			/>
		</>
	);
}

function App() {
	return (
		<Router
			future={{
				v7_startTransition: true,
				v7_relativeSplatPath: true
			}}
		>
			<MainLayout />
		</Router>
	);
}

export default App;