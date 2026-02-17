import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="home-container">
      <div className="home-content container"> { }

        { }
        <section className="hero-section text-center"> { }
          <h1 className="hero-title">ORGANIZE YOUR MIND,<br />PLAN YOUR SUCCESS</h1>
          <p className="hero-subtitle">Notes, tasks, and a little Sudoku break—all in one place.</p>

          <div className="toggle-area">
            <button className="btn-how-it-works" onClick={() => setIsOpen(!isOpen)}>HOW IT WORKS</button>

            {isOpen && (
              <div className="how-it-works-box mx-auto"> { }
                <p>
                  Planora allows you to manage your notes and shared checklists from a single place.
                  You can collaborate with your friends in real time, and once your tasks are finished,
                  you can refresh your mind with Sudoku.
                </p>
              </div>
            )}
          </div>
        </section>

        { }
        <section className="row justify-content-center g-4 w-100">
          { }
          <div className="col-12 col-md-4 d-flex justify-content-center">
            <div className="feature-card light-mint w-100">
              <i className="fa-solid fa-pen-to-square card-icon"></i>
              <div className="card-info">
                <h3>NOTES</h3>
                <p>Capture ideas, journal thoughts and keep it safe.</p>
              </div>
            </div>
          </div>

          { }
          <div className="col-12 col-md-4 d-flex justify-content-center">
            <div className="feature-card moss-green w-100">
              <i className="fa-solid fa-users-viewfinder card-icon"></i>
              <div className="card-info">
                <h3>SHARED CHECKLISTS</h3>
                <p>Assign, track, and collaborate on todos with real-time sync.</p>
              </div>
            </div>
          </div>

          { }
          <div className="col-12 col-md-4 d-flex justify-content-center">
            <div className="feature-card light-mint w-100">
              <i className="fa-solid fa-puzzle-piece card-icon"></i>
              <div className="card-info">
                <h3>SUDOKU BREAK</h3>
                <p>Relax your mind with a puzzle between your tasks.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;