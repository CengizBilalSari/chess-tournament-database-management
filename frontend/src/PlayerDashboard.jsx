import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './components/DashboardHeader';
import SectionToggleButton from './components/SectionToggleButton';
import StyledInput from './components/StyledInput';

export default function PlayerDashboard() {
  const [opponents, setOpponents] = useState([]);
  const [frequentOpponent, setFrequentOpponent] = useState(null);
  const [loadingOpponents, setLoadingOpponents] = useState(false);
  const [loadingFrequent, setLoadingFrequent] = useState(false);
  const [error, setError] = useState('');
  const [showOpponents, setShowOpponents] = useState(false);
  const [showFrequent, setShowFrequent] = useState(false);
  const [opponentsFetched, setOpponentsFetched] = useState(false);
  const [frequentFetched, setFrequentFetched] = useState(false);

  // Assume username is stored in localStorage after login
  const username = localStorage.getItem('username');

  const navigate = useNavigate();

  // Fetch opponents only when button is clicked
  const handleShowOpponents = async () => {
    if (!showOpponents) {
      setShowOpponents(true);
      if (!opponentsFetched) {
        setLoadingOpponents(true);
        setError('');
        try {
          const res = await fetch(`/api/player/opponents/${username}`);
          if (!res.ok) throw new Error('Failed to fetch opponents');
          const data = await res.json();
          setOpponents(data);
          setOpponentsFetched(true);
        } catch (e) {
          setError('Could not load opponents.');
        } finally {
          setLoadingOpponents(false);
        }
      }
    } else {
      setShowOpponents(false);
    }
  };

  // Fetch frequent opponent only when button is clicked
  const handleShowFrequent = async () => {
    if (!showFrequent) {
      setShowFrequent(true);
      if (!frequentFetched) {
        setLoadingFrequent(true);
        setError('');
        try {
          const res = await fetch(`/api/player/frequent-opponent/${username}`);
          if (!res.ok) throw new Error('Failed to fetch frequent opponent');
          const data = await res.json();
          setFrequentOpponent(data);
          setFrequentFetched(true);
        } catch (e) {
          setError('Could not load frequent opponent.');
        } finally {
          setLoadingFrequent(false);
        }
      }
    } else {
      setShowFrequent(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    if (!username) {
      navigate('/', { replace: true });
    }
  }, [username, navigate]);

  if (error) return <div style={{ padding: 32 }}><h2>Player Dashboard</h2><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <>
      <DashboardHeader title="Player Dashboard" onLogout={handleLogout} />
      <div style={{ padding: '96px 32px 32px 32px' }}>
        
        <div style={{ 
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'row'
        }}>
          <SectionToggleButton
            label="All Opponents"
            toggled={showOpponents}
            onClick={handleShowOpponents}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
          />
          <SectionToggleButton
            label="Most Frequent Opponent"
            toggled={showFrequent}
            onClick={handleShowFrequent}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
            style={{ marginRight: 0 }}
          />
        </div>
        {showOpponents && (
          <div style={{ 
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h3>Players You&apos;ve Played Against</h3>
            {loadingOpponents ? <p>Loading...</p> : (
              opponents.length === 0 ? <p>No opponents found.</p> : (
                <ul style={{ textAlign: 'left', maxWidth: 400, margin: 0, padding: 0, listStyle: 'none' }}>
                  {opponents.map((op, idx) => (
                    <li key={op.username || idx} style={{ padding: '4px 0', textAlign: 'center' }}>
                      {op.name} {op.surname} (<b>{op.username}</b>) - ELO: {op.elo_rating || op.eloRating}
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}
        {showFrequent && (
          <div>
            <h3>Most Frequent Co-Player(s)</h3>
            {loadingFrequent ? <p>Loading...</p> : (
              frequentOpponent && frequentOpponent.opponents && frequentOpponent.opponents.length > 0 ? (
                <>
                  <p>
                    {frequentOpponent.opponents.length === 1 ? (
                      <>Most frequent: <b>{frequentOpponent.opponents[0]}</b></>
                    ) : (
                      <>Tied: {frequentOpponent.opponents.map((op, i) => <span key={op}>{op}{i < frequentOpponent.opponents.length - 1 ? ', ' : ''}</span>)} (average ELO shown)</>
                    )}
                  </p>
                  <p>Average ELO: <b>{frequentOpponent.average_elo_rating?.toFixed(1)}</b></p>
                </>
              ) : (
                <p>No frequent co-player data available.</p>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}