import React from 'react';
import Modal from './Modal';

const KVKKModal = ({ isOpen, onClose }) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Law on the Protection of Personal Data (KVKK) Clarification Text">
			<div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px', textAlign: 'left', color: '#e0e0e0' }}>
				<h3>1. Data Controller</h3>
				<p>
					In accordance with the Law on the Protection of Personal Data No. 6698 ("KVKK"), your personal data; may be processed by <strong>Planora</strong> as the data controller within the scope described below.
				</p>

				<h3>2. Purpose of Processing Personal Data</h3>
				<div style={{ marginBottom: '1rem' }}>
					Your collected personal data will be processed for the following purposes:
					<ul>
						<li>To benefit from the services offered by our platform,</li>
						<li>To carry out membership transactions,</li>
						<li>To increase service quality and improve user experience,</li>
						<li>To fulfill legal obligations,</li>
						<li>To ensure security and prevent fraudulent transactions.</li>
					</ul>
				</div>

				<h3>3. To Whom and for What Purpose the Processed Personal Data May Be Transferred</h3>
				<p>
					Your personal data may be shared with legally authorized public institutions and private legal entities. Sharing with third parties is carried out only within the framework of service requirements and legal obligations.
				</p>

				<h3>4. Method and Legal Reason for Collecting Personal Data</h3>
				<p>
					Your personal data is collected electronically via our website. This collection process is carried out based on the personal data processing conditions specified in Articles 5 and 6 of the KVKK.
				</p>

				<h3>5. Rights of the Personal Data Owner</h3>
				<p>
					Pursuant to Article 11 of the KVKK, data owners have the right to;
					<ul>
						<li>Learn whether their personal data is processed,</li>
						<li>Request information if their personal data has been processed,</li>
						<li>Learn the purpose of processing personal data and whether they are used in accordance with their purpose,</li>
						<li>Know the third parties to whom personal data is transferred domestically or abroad,</li>
						<li>Request correction of personal data in case of incomplete or incorrect processing,</li>
						<li>Request deletion or destruction of personal data.</li>
					</ul>
				</p>

				<p>
					You can contact us for more information.
				</p>
			</div>
		</Modal>
	);
};

export default KVKKModal;
