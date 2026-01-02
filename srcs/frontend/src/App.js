import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { LoginModal, RegisterModal } from './components/AuthModals';


function App() {
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isRegisterOpen, setIsRegisterOpen] = useState(false);

	const openLogin = () => {
		setIsRegisterOpen(false);
		setIsLoginOpen(true);
	};

	const openRegister = () => {
		setIsLoginOpen(false);
		setIsRegisterOpen(true);
	};

	return (
		<div className="App">
			<Navbar
				onLoginClick={openLogin}
				onRegisterClick={openRegister}
			/>

			<Home />

			<LoginModal
				isOpen={isLoginOpen}
				onClose={() => setIsLoginOpen(false)}
			/>

			<RegisterModal
				isOpen={isRegisterOpen}
				onClose={() => setIsRegisterOpen(false)}
			/>
		</div>
	);
}

export default App;

