import React, { useState } from 'react';
import Modal from './Modal';
import './AuthModals.css'; // Reusing styles

export const CreateCircleModal = ({ isOpen, onClose, onSuccess }) => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		const token = localStorage.getItem('token');
		try {
			const res = await fetch('/api/circles/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Token ${token}`
				},
				body: JSON.stringify({ name, description })
			});
			if (res.ok) {
				const data = await res.json();
				alert('Circle created successfully!');
				onSuccess(data);
				onClose();
			} else {
				const err = await res.json();
				alert('Error creating circle: ' + (JSON.stringify(err) || res.statusText));
			}
		} catch (err) {
			console.error(err);
			alert('Network error');
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Create New Circle">
			<form className="auth-form" onSubmit={handleSubmit}>
				<div className="form-group">
					<label>Circle Name</label>
					<input className="glass-input" value={name} onChange={e => setName(e.target.value)} required />
				</div>
				<div className="form-group">
					<label>Description</label>
					<input className="glass-input" value={description} onChange={e => setDescription(e.target.value)} />
				</div>
				<button type="submit" className="primary-btn">Create</button>
			</form>
		</Modal>
	);
};

export const CreateTaskModal = ({ isOpen, onClose, circleId, onSuccess }) => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		const token = localStorage.getItem('token');
		try {
			const res = await fetch('/api/tasks/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Token ${token}`
				},
				body: JSON.stringify({ title, description, circle_id: circleId })
			});
			if (res.ok) {
				alert('Task created successfully!');
				onSuccess();
				onClose();
			} else {
				const err = await res.json();
				alert('Error creating task: ' + (JSON.stringify(err) || res.statusText));
			}
		} catch (err) {
			console.error(err);
			alert('Network error');
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Add New Task">
			<form className="auth-form" onSubmit={handleSubmit}>
				<div className="form-group">
					<label>Task Title</label>
					<input className="glass-input" value={title} onChange={e => setTitle(e.target.value)} required />
				</div>
				<div className="form-group">
					<label>Details</label>
					<textarea
						className="glass-input"
						rows="3"
						value={description}
						onChange={e => setDescription(e.target.value)}
						style={{ resize: 'none', height: 'auto' }}
					/>
				</div>
				<button type="submit" className="primary-btn">Add Task</button>
			</form>
		</Modal>
	);
};

export const InviteModal = ({ isOpen, onClose, inviteCode }) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Invite Members">
			<div style={{ textAlign: 'center', color: 'var(--text)' }}>
				<p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Share this code with others to let them join this circle:</p>
				<div
					style={{
						background: 'rgba(255,255,255,0.1)',
						padding: '20px',
						borderRadius: '12px',
						fontSize: '32px',
						fontWeight: '800',
						letterSpacing: '4px',
						marginBottom: '20px',
						border: '1px dashed rgba(255,255,255,0.3)'
					}}
				>
					{inviteCode || 'LOADING'}
				</div>
				<button className="primary-btn" onClick={() => {
					navigator.clipboard.writeText(inviteCode);
					alert('Copied to clipboard!');
				}}>
					Copy Code
				</button>
			</div>
		</Modal>
	);
};

export const JoinCircleModal = ({ isOpen, onClose, onSuccess }) => {
	const [code, setCode] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		const token = localStorage.getItem('token');
		try {
			const res = await fetch('/api/circles/join_by_code/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Token ${token}`
				},
				body: JSON.stringify({ invite_code: code })
			});
			if (res.ok) {
				const data = await res.json();
				onSuccess(data.circle);
				onClose();
			} else {
				alert('Invalid Code');
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Join a Circle">
			<form className="auth-form" onSubmit={handleSubmit}>
				<div className="form-group">
					<label>Invite Code</label>
					<input
						className="glass-input"
						value={code}
						onChange={e => setCode(e.target.value.toUpperCase())}
						placeholder="e.g. A1B2C3D4"
						required
					/>
				</div>
				<button type="submit" className="primary-btn">Join</button>
			</form>
		</Modal>
	);
}
