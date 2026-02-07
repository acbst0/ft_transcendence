import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  // Yazının açık mı kapalı mı olduğunu tutan state
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="home-container">
      <div className="home-content">
        
        {}
        <section className="hero-section">
          <h1 className="hero-title">ORGANIZE YOUR MIND,<br />PLAN YOUR SUCCESS</h1>
          <p className="hero-subtitle">Notes, tasks, and a little Sudoku break—all in one place.</p>
          
          <div className="toggle-area">
            <button 
              className="btn-how-it-works" 
              onClick={() => setIsOpen(!isOpen)}
            >
              HOW IT WORKS
            </button>
            
            {}
            {isOpen && (
              <div className="how-it-works-box">
                <p>
                  Planora allows you to manage your notes and shared checklists from a single place. 
                  You can collaborate with your friends in real time, and once your tasks are finished, 
                  you can refresh your mind with Sudoku.
                </p>
              </div>
            )}
          </div>
        </section>

        {}
        <section className="cards-section">
          <div className="feature-card light-mint">
            <span className="card-emoji">📝</span>
            <div className="card-info">
              <h3>NOTES</h3>
              <p>Capture ideas, journal thoughts and keep it safe.</p>
            </div>
          </div>

          <div className="feature-card moss-green">
            <span className="card-emoji">👥</span>
            <div className="card-info">
              <h3>SHARED CHECKLISTS</h3>
              <p>Assign, track, and collaborate on todos with real-time sync.</p>
            </div>
          </div>

          <div className="feature-card light-mint">
            <span className="card-emoji">🔢</span>
            <div className="card-info">
              <h3>SUDOKU BREAK</h3>
              <p>Relax your mind with a puzzle between your tasks.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;