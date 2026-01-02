import React from 'react';
import './Home.css';

const Home = () => {
	return (
		<div className="home-container">
			<div className="hero-content">
				<div className="badge">New Era of Gaming</div>
				<h1 className="hero-title">
					Connect, Play, <br />
					<span className="gradient-text">Transcend.</span>
				</h1>
				<p className="hero-subtitle">
					Experience the ultimate multiplayer ping-pong platform.
					Challenge friends, climb leaderboards, and master the game in a
					stunning new dimension.
				</p>
				<div className="hero-actions">
					<button className="cta-btn primary">Start Playing Now</button>
					<button className="cta-btn secondary">Watch Demo</button>
				</div>
			</div>

			<div className="hero-visual">
				{/* Abstract glowing orb or visual representation */}
				<div className="orb orb-1"></div>
				<div className="orb orb-2"></div>
				<div className="glass-card">
					<div className="game-preview">
						{/* Simple CSS representation of a pong game */}
						<div className="pong-table">
							<div className="net"></div>
							<div className="paddle left"></div>
							<div className="paddle right"></div>
							<div className="ball"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
