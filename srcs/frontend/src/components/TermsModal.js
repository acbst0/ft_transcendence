import React from 'react';
import Modal from './Modal';

const TermsModal = ({ isOpen, onClose }) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Terms of Service & User Agreement">
			<div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px', textAlign: 'left', color: '#e0e0e0' }}>
				<h3>1. Acceptance of Terms</h3>
				<p>
					By accessing and using <strong>Planora</strong>, you accept and agree to be bound by the terms and provision of this agreement.
				</p>

				<h3>2. User Obligations</h3>
				<p>
					As a user of this platform, you agree to:
					<ul>
						<li>Provide accurate and complete information during registration.</li>
						<li>Maintain the security of your account credentials.</li>
						<li>Not use the service for any illegal or unauthorized purpose.</li>
						<li>Respect the rights and privacy of other users.</li>
					</ul>
				</p>

				<h3>3. Intellectual Property</h3>
				<p>
					All content included on this site, such as text, graphics, logos, button icons, images, is the property of Planora or its content suppliers and protected by international copyright laws.
				</p>

				<h3>4. Termination</h3>
				<p>
					We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
				</p>

				<h3>5. Disclaimer</h3>
				<p>
					The materials on Planora's website are provided on an 'as is' basis. Planora makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
				</p>

				<p>
					<strong>Last Updated:</strong> February 2026
				</p>
			</div>
		</Modal>
	);
};

export default TermsModal;
