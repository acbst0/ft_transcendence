import React, { useState, useMemo, useEffect } from 'react';
import './DashboardTasks.css';

const DashboardTasks = ({ selectedEnv, tasks, setPreselectedAssignee, setShowCreateTask, openTaskDetail, onCreateCircle, user }) => {

	const [searchQuery, setSearchQuery] = useState('');
	const [filterStatus, setFilterStatus] = useState('all');
	const [sortOrder, setSortOrder] = useState('newest');
	const [currentPage, setCurrentPage] = useState(1);
	const [tasksPerPage] = useState(9); 

	const fltrTask = useMemo(() => {
		if (!tasks) return [];
		let index = [...tasks];
		if (searchQuery.trim()) {
			const lowerQuery = searchQuery.toLowerCase();
			index = index.filter(t =>
				t.title.toLowerCase().includes(lowerQuery) ||
				(t.description && t.description.toLowerCase().includes(lowerQuery))
			);
		}
		if (filterStatus === 'active') {
			index = index.filter(t => t.status !== 'done');
		} else if (filterStatus === 'done') {
			index = index.filter(t => t.status === 'done');
		} else if (filterStatus === 'my_assignments') {
			index = index.filter(t => {
				if (t.task_type !== 'assignment') return false;
				const isAssigned = (t.assignees && t.assignees.some(u => u.id === user?.id)) || (t.assigned_to && t.assigned_to.id === user?.id);
				return isAssigned || ((!t.assignees || t.assignees.length === 0) && !t.assigned_to);
			});
		}
		index.sort((a, b) => {
			const dateA = new Date(a.created_at);
			const dateB = new Date(b.created_at);
			return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
		});

		return index;
	}, [tasks, searchQuery, filterStatus, sortOrder, user]);


	const pageNumber = Math.ceil(fltrTask.length / tasksPerPage);
	const indexOfLastTask = currentPage * tasksPerPage;
	const indexOfFirstTask = indexOfLastTask - tasksPerPage;
	const showTask = fltrTask.slice(indexOfFirstTask, indexOfLastTask);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, filterStatus, sortOrder]);


	const changePage = (pageNumber) => {
		setCurrentPage(pageNumber);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	
	const getPageNbr = () => {
		const pageNumbers = [];
		const maxVisible = 5;

		if (pageNumber <= maxVisible) {
			for (let i = 1; i <= pageNumber; i++) {
				pageNumbers.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) pageNumbers.push(i);
				pageNumbers.push('...');
				pageNumbers.push(pageNumber);
			} else if (currentPage >= pageNumber - 2) {
				pageNumbers.push(1);
				pageNumbers.push('...');
				for (let i = pageNumber - 3; i <= pageNumber; i++) pageNumbers.push(i);
			} else {
				pageNumbers.push(1);
				pageNumbers.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
				pageNumbers.push('...');
				pageNumbers.push(pageNumber);
			}
		}

		return pageNumbers;
	};
	if (!selectedEnv) {
		return (
			<div className="d-flex flex-column align-items-center justify-content-center welcome-container">
				<div className="text-center welcome-content">
					<div className="mb-4">
						<div className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3 position-relative welcome-icon-box">
							<i className="fa-solid fa-layer-group text-white" style={{ fontSize: '32px' }}></i>
						</div>
					</div>
					<h3 className="fw-semibold mb-3 welcome-title">Welcome to Planora</h3>
					<p className="text-muted mb-4 welcome-text">Select a circle or create a new one to get started</p>
					{onCreateCircle && (
						<button className="btn btn-primary-green px-4 py-2 welcome-btn" onClick={onCreateCircle}><i className="fa-solid fa-plus me-2"></i>Create New Circle</button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="container-fluid px-4 py-4">

			<div className="d-flex flex-column gap-4 mb-4">
				<div className="d-flex justify-content-between align-items-center">
					<div>
						<h2 className="fw-bold mb-1 tasks-header-title">Tasks</h2>
						{selectedEnv.description && <p className="text-muted mb-0 tasks-header-desc">{selectedEnv.description}</p>}
					</div>
					<button className="btn btn-primary-green d-flex align-items-center gap-2 px-4 py-2 new-task-btn" type="button" onClick={() => { setPreselectedAssignee(''); setShowCreateTask(true); }}><i className="fa-solid fa-plus"></i><span className="d-none d-sm-inline">New Task</span></button>
				</div>

				<div className="row g-3">
					<div className="col-12 col-md-6">
						<div className="position-relative">
							<i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
							<input type="text" className="form-control ps-5 search-input" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
						</div>
					</div>
					<div className="col-6 col-md-3">
						<select className="form-select filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
							<option value="all">All Tasks</option>
							<option value="active">Active</option>
							<option value="done">Completed</option>
							<option value="my_assignments">My Assignments</option>
						</select>
					</div>
					<div className="col-6 col-md-3">
						<select className="form-select filter-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
							<option value="newest">Newest First</option>
							<option value="oldest">Oldest First</option>
						</select>
					</div>
				</div>
			</div>

			<div className="d-flex justify-content-between align-items-center mb-3">
				<div className="text-muted small">
					Showing {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, fltrTask.length)} of {fltrTask.length} tasks
				</div>
			</div>

			<div className="row g-4">
				{tasks.length === 0 && (
					<div className="col-12">
						<div className="text-center py-5 rounded-3 no-tasks-container">
							<div className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3 no-tasks-icon-box">
								<i className="fa-solid fa-clipboard-list" style={{ fontSize: '28px', color: 'var(--primary)' }}></i>
							</div>
							<p className="text-muted mb-0 no-tasks-text">No tasks yet. Click "New Task" to create one</p>
						</div>
					</div>
				)}

				{tasks.length > 0 && fltrTask.length === 0 && (
					<div className="col-12 text-center py-5">
						<p className="text-muted">No tasks found matching your criteria.</p>
					</div>
				)}

				{showTask.map((task, index) => {
					const taskIcons = {
						note: 'fa-note-sticky',
						checklist: 'fa-list-check',
						assignment: 'fa-clipboard-check'
					};
					const taskType = task.task_type || 'assignment';
					const iconClass = taskIcons[taskType] || taskIcons.assignment;

					return (
						<div className={`col-12 col-md-6 col-xl-4 task-card-wrapper ${taskType}`} key={task.id}>
							<div className="card h-100 border-0 position-relative overflow-hidden task-card" onClick={() => openTaskDetail(task)}>

								<div className="task-card-dot left"></div>
								<div className="task-card-dot right"></div>
								<div className="task-card-top-border"></div>

								<div className="card-body p-4 d-flex flex-column task-card-body">

									<div className="d-flex justify-content-between align-items-center mb-3">
										<div className="d-flex align-items-center gap-2 task-type-badge">
											<i className={`fa-solid ${iconClass}`} style={{ fontSize: '14px' }}></i>
											<span className="text-capitalize task-type-text">{task.task_type}</span>
										</div>
										{task.status === 'done' && (
											<div className="rounded-circle d-flex align-items-center justify-content-center task-done-indicator">
												<i className="fa-solid fa-check text-white" style={{ fontSize: '11px' }}></i>
											</div>
										)}
									</div>
									<h5 className="card-title mb-3 fw-semibold task-title">{task.title}</h5>
									<div className="mb-3 flex-grow-1 task-description-box">
										{task.task_type === 'checklist'
											? (
												<span className="d-flex align-items-center gap-2">
													<i className="fa-solid fa-circle-check" style={{ color: 'var(--task-color)', fontSize: '14px' }}></i>
													<span className="fw-medium">
														{task.checklist_items ? task.checklist_items.filter(i => i.is_checked).length : 0}/{task.checklist_items ? task.checklist_items.length : 0} completed
													</span>
												</span>
											)
											: (task.description || <em style={{ opacity: 0.5 }}>No description</em>)}
									</div>
									<div className="pt-3 d-flex justify-content-between align-items-center border-top border-secondary task-footer">
										{task.task_type === 'assignment' && (
											<div className="d-flex align-items-center gap-2 task-assignee-badge">
												<i className="fa-solid fa-user task-assignee-text" style={{ fontSize: '10px' }}></i>
												<span className="fw-medium task-assignee-text">
													{task.assignees && task.assignees.length > 0
														? (task.assignees.length === 1 ? task.assignees[0].username : `${task.assignees.length} Assignees`)
														: (task.assigned_to ? task.assigned_to.username : 'Everyone')}
												</span>
											</div>
										)}
										{task.task_type !== 'assignment' && <div></div>}
										<div className="d-flex align-items-center gap-2">
											<i className="fa-regular fa-calendar" style={{ fontSize: '11px' }}></i>
											<span>{new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

		
			{fltrTask.length > tasksPerPage && (
				<div className="d-flex justify-content-center align-items-center gap-2 mt-5 pagination-container">
					<button className={`btn pagination-btn pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`} onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">
						<i className="fa-solid fa-chevron-left"></i>
					</button>
					<div className="d-flex gap-2 pagination-numbers">
						{getPageNbr().map((pageNum, idx) => (
							pageNum === '...' ? (
								<span key={`ellipsis-${idx}`} className="pagination-ellipsis">
									...
								</span>
							) : (
								<button key={pageNum} className={`btn pagination-btn pagination-number ${currentPage === pageNum ? 'active' : ''}`} onClick={() => changePage(pageNum)} aria-label={`Page ${pageNum}`} aria-current={currentPage === pageNum ? 'page' : undefined}>
									{pageNum}
								</button>
							)
						))}
					</div>

					<button className={`btn pagination-btn pagination-arrow ${currentPage === pageNumber ? 'disabled' : ''}`} onClick={() => changePage(currentPage + 1)} disabled={currentPage === pageNumber} aria-label="Next page">
						<i className="fa-solid fa-chevron-right"></i>
					</button>
				</div>
			)}
		</div>
	);
};

export default DashboardTasks;