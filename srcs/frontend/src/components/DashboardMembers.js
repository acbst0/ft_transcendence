import React, { useState } from 'react';
import BootstrapModal from './BootstrapModal';
import './DashboardMembers.css';

const DashboardMembers = ({
	selectedEnv, user, onlineUsers, startDM, setPreselectedAssignee,
	setShowCreateTask, handleKick, handleLeaveCircle
}) => {
	const [searchText, setSearchText] = useState('');
	const [showStarredOnly, setShowStarredOnly] = useState(false);
	const [localFavorites, setLocalFavorites] = useState(new Set()); 

	const handleToggleFavorite = async (memberId) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/profile/toggle_favorite/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Token ${token}`
				},
				body: JSON.stringify({ user_id: memberId })
			});

			if (response.ok) {
				const data = await response.json();
			
				window.location.reload();
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
		}
	};

	const filteredMembers = selectedEnv?.members?.filter(member => {
		const matchesSearch = member.username.toLowerCase().includes(searchText.toLowerCase());
		const isStarred = member.is_favorited; 
		if (showStarredOnly && !isStarred) return false;
		return matchesSearch;
	}) || [];

	const [selectedMember, setSelectedMember] = useState(null);

	const handleMemberClick = (member) => {
		setSelectedMember(member);
	};

	return (
		<div className="container-fluid p-0 members-page-container">
			<BootstrapModal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} title="Member Profile">
				{selectedMember && (
					<div className="text-center">
						<div className="mx-auto mb-3 position-relative" style={{ width: '90px', height: '90px' }}>
							{selectedMember.avatar ?
								<img src={selectedMember.avatar} alt={selectedMember.username} className="w-100 h-100 rounded-circle object-fit-cover border border-3 border-success" />
								:
								<div className="w-100 h-100 rounded-circle d-flex align-items-center justify-content-center border border-3 border-success bg-secondary">
									<span className="fs-2 fw-bold text-white">{selectedMember.username.charAt(0).toUpperCase()}</span>
								</div>
							}
							{onlineUsers.has(selectedMember.id) && (
								<div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2" style={{ width: '18px', height: '18px', borderColor: 'var(--bs-body-bg)' }}></div>
							)}
						</div>

						<h4 className="fw-bold mb-1">{selectedMember.username}</h4>
						<p className="text-muted small mb-3">{selectedMember.email}</p>

						<div className="p-3 rounded-3 mb-4 border bg-body-tertiary">
							<p className="mb-0 fst-italic small" style={{ minHeight: '40px', lineHeight: '1.5' }}>
								{selectedMember.bio ? `"${selectedMember.bio}"` : <span className="text-muted">No bio provided.</span>}
							</p>
						</div>

						<div className="d-flex justify-content-center gap-5 mb-4 border-top border-bottom py-3">
							<div className="text-center">
								<h5 className="fw-bold text-success mb-0">{selectedMember.followers_count || 0}</h5>
								<small className="text-muted" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>FOLLOWERS</small>
							</div>
							<div className="vr"></div>
							<div className="text-center">
								<h5 className="fw-bold text-success mb-0">{selectedMember.following_count || 0}</h5>
								<small className="text-muted" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>FOLLOWING</small>
							</div>
						</div>

						{selectedMember.id !== user.id && (
							<div className="d-grid gap-2">
								<button
									className={`btn ${selectedMember.is_favorited ? 'btn-warning text-dark' : 'btn-outline-warning'} rounded-pill fw-bold py-2`}
									onClick={() => {
										handleToggleFavorite(selectedMember.id);
										setSelectedMember(prev => ({ ...prev, is_favorited: !prev.is_favorited }));
									}}
								>
									<i className={`fa-${selectedMember.is_favorited ? 'solid' : 'regular'} fa-star me-2`}></i>
									{selectedMember.is_favorited ? 'Unfavorite' : 'Favorite'}
								</button>
								<button
									className="btn btn-outline-primary rounded-pill py-2"
									onClick={() => { startDM(selectedMember); setSelectedMember(null); }}
								>
									<i className="fa-regular fa-envelope me-2"></i>
									Message
								</button>
							</div>
						)}
					</div>
				)}
			</BootstrapModal>

			<div className="mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
				<div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
					<div>
						<h2 className="h3 fw-bold mb-1">Circle Members</h2>
						<p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>Manage members of <span style={{ color: 'var(--palette-success)', fontWeight: '600' }}>{selectedEnv?.name}</span></p>
					</div>
				</div>

				<div className="mt-4 d-flex gap-3">
					<div className="position-relative flex-grow-1">
						<i className="fa-solid fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
						<input
							type="text"
							className="form-control ps-5 rounded-pill"
							placeholder="Search members..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
						/>
					</div>
					<button
						className={`btn ${showStarredOnly ? 'btn-warning' : 'btn-outline-secondary'} rounded-pill px-4 d-flex align-items-center gap-2`}
						onClick={() => setShowStarredOnly(!showStarredOnly)}
					>
						<i className={`fa-${showStarredOnly ? 'solid' : 'regular'} fa-star`}></i>
						<span>Favorites</span>
					</button>
				</div>
			</div>

			<div className="d-flex flex-column gap-3">
				{filteredMembers.map(member => (
					<div
						key={member.id}
						className={`member-card ${selectedEnv.admin?.id === member.id ? 'admin' : ''}`}
						onClick={() => handleMemberClick(member)}
						style={{ cursor: 'pointer' }}
					>
						<div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between p-4 gap-3">
							<div className="d-flex align-items-center gap-3">
								<div className="position-relative">
									<div className="member-avatar-wrapper">
										<div className="member-avatar-inner">
											{member.avatar ?
												<img src={member.avatar} alt={member.username} className="w-100 h-100 object-fit-cover" /> :
												<span className="member-initial">{member.username.charAt(0).toUpperCase()}</span>
											}
										</div>
									</div>
									{onlineUsers.has(member.id) && (
										<div className="position-absolute bottom-0 end-0 bg-success rounded-circle online-indicator-large" style={{ border: '2px solid var(--surface)', width: '14px', height: '14px' }}></div>
									)}
								</div>
								<div>
									<div className="d-flex align-items-center gap-2 mb-1">
										<span className="fw-bold fs-5">{member.username}</span>
										{selectedEnv.admin?.id === member.id && <span className="badge badge-custom" style={{ backgroundColor: 'var(--palette-primary)', color: 'white' }}>ADMIN</span>}
										{member.id === user.id && <span className="badge badge-custom" style={{ backgroundColor: 'rgba(131, 173, 108, 0.15)', color: 'var(--palette-success)' }}>YOU</span>}

										{member.id !== user.id && (
											<button
												className="btn btn-link p-0 ms-2 text-warning"
												onClick={(e) => { e.stopPropagation(); handleToggleFavorite(member.id); }}
												title={member.is_favorited ? "Remove from favorites" : "Add to favorites"}
											>
												<i className={`fa-${member.is_favorited ? 'solid' : 'regular'} fa-star fa-lg`}></i>
											</button>
										)}
									</div>
									<div style={{ color: 'var(--text)', opacity: 0.7, fontSize: '0.9rem' }}>{member.email}</div>
								</div>
							</div>

							<div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
								{member.id !== user.id && (
									<>
										<button onClick={() => startDM(member)} className="btn btn-sm btn-custom-green rounded-pill px-3">
											Message
										</button>
										<button onClick={() => { setPreselectedAssignee(member.id); setShowCreateTask(true); }} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
											Assign Task
										</button>
									</>
								)}
								{selectedEnv.admin?.id === user.id && member.id !== user.id && (
									<button onClick={() => handleKick(selectedEnv.id, member.id)} className="btn btn-sm btn-outline-danger rounded-pill px-3">
										Kick
									</button>
								)}
							</div>
						</div>
					</div>
				))}
				{filteredMembers.length === 0 && (
					<div className="text-center py-5 text-muted">
						<i className="fa-solid fa-users-slash fs-1 mb-3 opacity-50"></i>
						<p>No members found matching your criteria.</p>
					</div>
				)}
			</div>

			<div className="mt-4 pt-4 border-top border-secondary">
				<button onClick={() => handleLeaveCircle(selectedEnv.id)} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
					<i className="fa-solid fa-right-from-bracket"></i> Leave Circle
				</button>
			</div>
		</div>
	);
};

export default DashboardMembers;