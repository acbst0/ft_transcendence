import React, { useState, useEffect } from 'react';
import { CreateCircleModal, CreateTaskModal, InviteModal, JoinCircleModal } from '../components/DashboardModals';
import './Dashboard.css';

const Dashboard = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [comboOpen, setComboOpen] = useState(false);
	const [selectedEnv, setSelectedEnv] = useState(null); // Full Circle Object or null
	const [myCircles, setMyCircles] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [user, setUser] = useState({});

	// Modal States
	const [showCreateCircle, setShowCreateCircle] = useState(false);
	const [showCreateTask, setShowCreateTask] = useState(false);
	const [showInvite, setShowInvite] = useState(false);
	const [showJoin, setShowJoin] = useState(false);


	const fetchCircles = async () => {
		const token = localStorage.getItem('token');
		if (!token) return;
		try {
			const res = await fetch('/api/circles/my_circles/', {
				headers: { 'Authorization': `Token ${token}` }
			});
			if (res.ok) {
				const data = await res.json();
				setMyCircles(data);
				if (data.length > 0 && !selectedEnv) setSelectedEnv(data[0]);
			}
		} catch (e) { console.error(e); }
	};

	const fetchTasks = async (circleId) => {
		const token = localStorage.getItem('token');
		if (!token) return;
		try {
			const res = await fetch(`/api/tasks/?circle_id=${circleId}`, {
				headers: { 'Authorization': `Token ${token}` }
			});
			if (res.ok) {
				const data = await res.json();
				setTasks(data);
				console.log('Tasks loaded:', data);
			} else {
				alert('Failed to load tasks');
			}
		} catch (e) {
			console.error(e);
			alert('Network error loading tasks');
		}
	};

	useEffect(() => {
		const userData = localStorage.getItem('user');
		if (userData) setUser(JSON.parse(userData));
		fetchCircles();
	}, []);

	useEffect(() => {
		if (selectedEnv) {
			fetchTasks(selectedEnv.id);
		} else {
			setTasks([]);
		}
	}, [selectedEnv]);

	const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
	const toggleCombo = () => setComboOpen(!comboOpen);

	const selectEnv = (circle) => {
		if (circle === 'create') {
			setShowCreateCircle(true);
		} else if (circle === 'join') {
			setShowJoin(true);
		} else {
			setSelectedEnv(circle);
		}
		setComboOpen(false);
	};

	const handleCreateCircleSuccess = (newCircle) => {
		setMyCircles([...myCircles, newCircle]);
		setSelectedEnv(newCircle);
	};

	const handleJoinCircleSuccess = (circle) => {
		// Check if already in list
		if (!myCircles.find(c => c.id === circle.id)) {
			setMyCircles([...myCircles, circle]);
		}
		setSelectedEnv(circle);
	};

	return (
		<div className="dashboard-body">
			<div className="frame">
				<header className="topbar">
					{/* Combobox for Circles */}
					<div className={`combo ${comboOpen ? 'open' : ''} `} id="combo">
						<button
							className="combo-btn"
							type="button"
							onClick={(e) => { e.stopPropagation(); toggleCombo(); }}
						>
							<span className="value">
								{selectedEnv ? selectedEnv.name : 'Select Circle'}
							</span>
							<div className="chev"></div>
						</button>
						<div className="combo-menu">
							{myCircles.map(circle => (
								<div key={circle.id} className="combo-item" onClick={() => selectEnv(circle)}>
									{circle.name}
								</div>
							))}
							<div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
							<div className="combo-item" onClick={() => selectEnv('create')} style={{ color: '#818cf8' }}>
								+ Create New Circle
							</div>
							<div className="combo-item" onClick={() => selectEnv('join')}>
								# Join with Code
							</div>
						</div>
					</div>

					{/* Right top controls */}
					<div className="top-right">
						{selectedEnv && (
							<div className="dots" title="Invite Members">
								{/* Invite Button */}
								<div className="dot plus" onClick={() => setShowInvite(true)} style={{ cursor: 'pointer' }}>+</div>
							</div>
						)}
						<div className="profile">{user.username || 'Guest'}</div>
					</div>
				</header>

				<div className="content-wrap">
					<main className="main">
						{!selectedEnv ? (
							<div className="hint" style={{ textAlign: 'center', marginTop: '100px' }}>
								<h3>Welcome to Planora</h3>
								<p>Please select, create, or join a circle to get started.</p>
							</div>
						) : (
							<>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
									<h2 style={{ fontSize: '24px', fontWeight: 600 }}>Tasks in {selectedEnv.name}</h2>
									<button className="primary-btn" type="button" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setShowCreateTask(true)}>
										+ New Task
									</button>
								</div>

								<div className="grid">
									{tasks.map(task => (
										<div className="card" key={task.id} style={{ height: 'auto', minHeight: '160px', alignItems: 'flex-start', textAlign: 'left' }}>
											<div className="tiny" style={{
												background: task.status === 'done' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
												color: task.status === 'done' ? '#4ade80' : '#a5b4fc'
											}}>
												{task.status.replace('_', ' ')}
											</div>
											<div className="card-title" style={{ fontSize: '18px', marginTop: '12px' }}>{task.title}</div>
											<div className="card-subtitle" style={{ marginTop: '8px', lineHeight: '1.4' }}>
												{task.description || 'No details provided.'}
											</div>
											<div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
												By: {task.created_by?.username}
											</div>
										</div>
									))}

									{tasks.length === 0 && (
										<div className="hint" style={{ gridColumn: '1 / -1', marginTop: '0' }}>
											No tasks yet. Create one to get started!
										</div>
									)}
								</div>
							</>
						)}
					</main>

					{/* Collapsible right sidebar */}
					<aside className={`sidebar ${sidebarOpen ? 'open' : ''} `}>
						<div className="sidebar-header">
							<button className="toggle" onClick={toggleSidebar}>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
							<div className="sidebar-title">Menu</div>
						</div>

						<nav className="nav">
							<div className="nav-item active">
								<div className="icon">🏠</div>
								<div className="label">Dashboard</div>
							</div>
							<div className="nav-item">
								<div className="icon">💬</div>
								<div className="label">Chat (Coming Soon)</div>
							</div>
						</nav>
					</aside>
				</div>
			</div>

			{/* Modals */}
			<CreateCircleModal
				isOpen={showCreateCircle}
				onClose={() => setShowCreateCircle(false)}
				onSuccess={handleCreateCircleSuccess}
			/>

			<InviteModal
				isOpen={showInvite}
				onClose={() => setShowInvite(false)}
				inviteCode={selectedEnv?.invite_code}
			/>

			<CreateTaskModal
				isOpen={showCreateTask}
				onClose={() => setShowCreateTask(false)}
				circleId={selectedEnv?.id}
				onSuccess={() => fetchTasks(selectedEnv.id)}
			/>

			<JoinCircleModal
				isOpen={showJoin}
				onClose={() => setShowJoin(false)}
				onSuccess={handleJoinCircleSuccess}
			/>

		</div>
	);
};

export default Dashboard;
