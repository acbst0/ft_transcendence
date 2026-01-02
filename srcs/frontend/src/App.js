import React from 'react';
import Chat from './components/Chat';
import './App.css';

function App() {
  return (
    <main className="page">
      <div className="domain">www.site.com</div>

      <section className="frame" aria-label="Anasayfa Çerçevesi">
        <header className="topbar">
          <div className="brand">Site Adı</div>

          <nav className="nav" aria-label="Üst Menü">
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </nav>
        </header>

        <div className="content">
          <h1>Site Anasayfası</h1>
          
          {/* WebSocket Chat Component */}
          <Chat roomName="general" />
        </div>
      </section>
    </main>
  );
}

export default App;

