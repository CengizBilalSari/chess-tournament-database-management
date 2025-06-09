import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import DBManagerDashboard from './DBManagerDashboard';
import CoachDashboard from './CoachDashboard';
import ArbiterDashboard from './ArbiterDashboard';
import PlayerDashboard from './PlayerDashboard';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/db_manager-dashboard" element={<DBManagerDashboard />} />
        <Route path="/coach-dashboard" element={<CoachDashboard />} />
        <Route path="/arbiter-dashboard" element={<ArbiterDashboard />} />
        <Route path="/player-dashboard" element={<PlayerDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
