import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TicTacToe.css';

const TicTacToe = ({ circleId, showToast }) => {
	const [board, setBoard] = useState(Array(3).fill().map(() => Array(3).fill(null)));
	const [turn, setTurn] = useState('X');
	const [players, setPlayers] = useState({ X: null, O: null }); // { X: {username, id}, O: ... }
	const [winner, setWinner] = useState(null);
	const [isDraw, setIsDraw] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [currentUser, setCurrentUser] = useState(null);

	const ws = useRef(null);

	// Get current user from local storage
	useEffect(() => {
		const userStr = localStorage.getItem('user');
		if (userStr) {
			setCurrentUser(JSON.parse(userStr));
		}
	}, []);

	useEffect(() => {
		if (!circleId) return;

		const token = localStorage.getItem('token');
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = window.location.host.replace(':3000', '');
		const wsUrl = `${protocol}//${host}/ws/tictactoe/${circleId}/?token=${token}`;

		ws.current = new WebSocket(wsUrl);

		ws.current.onopen = () => {
			setIsConnected(true);
		};

		ws.current.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'game_state') {
				updateGameState(data.state);
			}
		};

		ws.current.onclose = () => {
			setIsConnected(false);
		};

		return () => {
			if (ws.current) ws.current.close();
		};
	}, [circleId]);

	const updateGameState = (state) => {
		setBoard(state.board);
		setTurn(state.current_turn);
		setPlayers({
			X: state.player_x ? { id: state.player_x, username: state.player_x_username } : null,
			O: state.player_o ? { id: state.player_o, username: state.player_o_username } : null
		});
		setWinner(state.winner);
		setIsDraw(state.is_draw);
	};

	const handleCellClick = (row, col) => {
		if (!isConnected || winner || isDraw || board[row][col]) return;

		// Check turn
		if (turn === 'X' && players.X?.id !== currentUser?.id) return;
		if (turn === 'O' && players.O?.id !== currentUser?.id) return;

		ws.current.send(JSON.stringify({
			type: 'make_move',
			row,
			col
		}));
	};

	const joinGame = (role) => {
		if (!isConnected) return;
		ws.current.send(JSON.stringify({
			type: 'join_game',
			role
		}));
	};

	const resetGame = () => {
		if (!isConnected) return;
		ws.current.send(JSON.stringify({
			type: 'reset_game'
		}));
	};

	const leaveGame = () => {
		if (!isConnected) return;
		ws.current.send(JSON.stringify({
			type: 'leave_game'
		}));
	};

	const isMyTurn = () => {
		if (winner || isDraw) return false;
		if (turn === 'X' && players.X?.id === currentUser?.id) return true;
		if (turn === 'O' && players.O?.id === currentUser?.id) return true;
		return false;
	};

	if (!circleId) return <div className="text-center mt-5 text-white">Please join a circle to play.</div>;

	return (
		<div className="tictactoe-container">
			<div className="tictactoe-header">
				<h2 className="display-6 fw-bold mb-3">Tic-Tac-Toe</h2>
				{!isConnected && <span className="badge bg-danger mb-3">Disconnected</span>}

				<div className="tictactoe-status">
					<div className={`player-badge ${turn === 'X' ? 'active' : ''}`}>
						<span className="fw-bold text-danger">X</span>
						<span>{players.X?.username || 'Waiting...'}</span>
						{!players.X && !players.O && (
							<button className="btn btn-sm btn-outline-light ms-2" onClick={() => joinGame('X')}>
								Join
							</button>
						)}
						{players.X?.id === currentUser?.id && (
							<button className="btn btn-sm btn-outline-danger ms-2" onClick={leaveGame} title="Leave Game">
								<i className="fa-solid fa-arrow-right-from-bracket"></i>
							</button>
						)}
					</div>
					<div className="text-muted align-self-center">VS</div>
					<div className={`player-badge ${turn === 'O' ? 'active' : ''}`}>
						<span className="fw-bold text-primary">O</span>
						<span>{players.O?.username || 'Waiting...'}</span>
						{!players.O && !players.X && (
							<button className="btn btn-sm btn-outline-light ms-2" onClick={() => joinGame('O')}>
								Join
							</button>
						)}
						{players.O?.id === currentUser?.id && (
							<button className="btn btn-sm btn-outline-danger ms-2" onClick={leaveGame} title="Leave Game">
								<i className="fa-solid fa-arrow-right-from-bracket"></i>
							</button>
						)}
					</div>
				</div>

				{(winner || isDraw) && (
					<div className="game-result">
						{winner ? (
							<span>
								<i className="fa-solid fa-trophy me-2"></i>
								Winner: <span className={winner === 'X' ? 'text-danger' : 'text-primary'}>{winner}</span>
							</span>
						) : (
							<span><i className="fa-solid fa-handshake me-2"></i>Draw!</span>
						)}
						<div className="mt-2 text-muted small mb-2">
							Starting a new game will reset players.
						</div>
						<div>
							<button className="btn btn-primary btn-sm" onClick={resetGame}>New Game</button>
						</div>
					</div>
				)}
			</div>

			<div className="tictactoe-board">
				{board.map((row, rIndex) => (
					row.map((cell, cIndex) => {
						const cellContent = cell || '';
						const isInteractable = !cell && isMyTurn();
						return (
							<div
								key={`${rIndex}-${cIndex}`}
								className={`tt-cell ${cellContent.toLowerCase()} ${!isInteractable ? 'disabled' : ''}`}
								onClick={() => handleCellClick(rIndex, cIndex)}
							>
								{cellContent}
							</div>
						);
					})
				))}
			</div>

			<div className="tictactoe-controls text-muted small">
				{isMyTurn() ?
					<span className="text-warning"><i className="fa-solid fa-arrow-pointer me-1"></i>Your Turn!</span> :
					<span>Waiting for move...</span>
				}
			</div>
		</div>
	);
};

export default TicTacToe;
