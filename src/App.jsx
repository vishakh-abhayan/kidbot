import React, { useState } from 'react';
import roboLogo from './assets/robo_logo.jpg';
import './App.css';
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" />


function App() {
  const [displayedAnswer, setDisplayedAnswer] = useState('');



  return (
    <>
      <div className="image">
        <a href="#" target="_blank">
          <img src={roboLogo} className="logo" alt="Robot logo" />
        </a>
      </div>
      <h1>Kid Bot</h1>
      <div className="card">
        <div className="input-container">
          <input type="text" placeholder="Enter your question, buddy" />
          <button className="submit-button" onClick="">Submit</button>
        </div>
        <div className="answer">{displayedAnswer}</div>
      </div>
    </>
  );
}

export default App;
