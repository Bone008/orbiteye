import React from 'react';
import logo from './logo.svg';
import './App.css';
import Timeline from './components/Timeline';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          OrbitEye
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

      <Timeline minDate={new Date('1980-01-01')} maxDate={new Date()} />
    </div>
  );
}

export default App;
