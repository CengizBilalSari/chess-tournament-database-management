import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './components/DashboardHeader';
import SectionToggleButton from './components/SectionToggleButton';
import StyledInput from './components/StyledInput';
import ActionButton from './components/ActionButton';

export default function ArbiterDashboard() {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingInputs, setRatingInputs] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [showStats, setShowStats] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [statsFetched, setStatsFetched] = useState(false);
  const [matchesFetched, setMatchesFetched] = useState(false);

  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  // Fetch matches to rate
  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const matchesRes = await fetch(`/api/arbiter/${username}/matches-to-rate`);
      if (!matchesRes.ok) throw new Error('Failed to fetch matches');
      const matchesData = await matchesRes.json();
      setMatches(matchesData);
      setMatchesFetched(true);
    } catch (e) {
      setError('Could not load matches.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const statsRes = await fetch(`/api/arbiter/${username}/rating-statistics`);
      if (!statsRes.ok) throw new Error('Failed to fetch statistics');
      const statsData = await statsRes.json();
      setStats(statsData);
      setStatsFetched(true);
    } catch (e) {
      setError('Could not load statistics.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle functions for showing/hiding content
  const handleShowStats = async () => {
    if (!showStats) {
      setShowStats(true);
      if (!statsFetched) {
        await fetchStats();
      }
    } else {
      setShowStats(false);
    }
  };

  const handleShowMatches = async () => {
    if (!showMatches) {
      setShowMatches(true);
      if (!matchesFetched) {
        await fetchMatches();
      }
    } else {
      setShowMatches(false);
    }
  };

  useEffect(() => {
    if (!username) {
      navigate('/', { replace: true });
    }
  }, [username, navigate]);

  const handleRatingChange = (matchId, value) => {
    setRatingInputs(inputs => ({ ...inputs, [matchId]: value }));
  };

  const handleSubmitRating = async (matchId) => {
    const rating = ratingInputs[matchId];
    if (!rating || rating < 1 || rating > 10) {
      setError('Rating must be between 1 and 10.');
      return;
    }
    setSubmitting(sub => ({ ...sub, [matchId]: true }));
    setError('');
    try {
      const res = await fetch(`/api/arbiter/${username}/matches/${matchId}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: Number(rating) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit rating');
      // Refresh data
      if (showMatches) await fetchMatches();
      if (showStats) await fetchStats();
      setRatingInputs(inputs => ({ ...inputs, [matchId]: '' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(sub => ({ ...sub, [matchId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (error) return <div style={{ padding: 32 }}><h2>Arbiter Dashboard</h2><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <>
      <DashboardHeader title="Arbiter Dashboard" onLogout={handleLogout} />
      <div style={{ padding: '96px 32px 32px 32px' }}>
        <div style={{ 
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center'
        }}>
          <SectionToggleButton
            label="Rating Statistics"
            toggled={showStats}
            onClick={handleShowStats}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
          />
          <SectionToggleButton
            label="Matches to Rate"
            toggled={showMatches}
            onClick={handleShowMatches}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
            style={{ marginRight: 0 }}
          />
        </div>
        {showStats && (
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h3>Rating Statistics</h3>
            {loading ? <p>Loading...</p> : (
              stats ? (
                <ul style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto', display: 'inline-block' }}>
                  <li><b>Total Matches Rated:</b> {stats.total_rated ?? stats.totalMatchesRated ?? 0}</li>
                  <li><b>Average Rating:</b> {stats.average_rating?.toFixed(2) ?? stats.averageRating?.toFixed(2) ?? '-'}</li>
                </ul>
              ) : <p>No statistics available.</p>
            )}
          </div>
        )}
        {showMatches && (
          <div style={{ textAlign: 'center' }}>
            <h3>Matches to Rate</h3>
            {loading ? <p>Loading...</p> : (
              matches.length === 0 ? <p>No matches to rate.</p> : (
                <ul style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', display: 'inline-block' }}>
                  {matches.map(match => (
                    <li key={match.matchId} style={{ marginBottom: 20, paddingBottom: 10, textAlign: 'center' }}>
                      <div>
                        <b>Match #{match.matchId}</b> | Date: {match.date} <br />
                        White: {match.whitePlayer || '-'} | Black: {match.blackPlayer || '-'}
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <StyledInput
                          type="number"
                          min={1}
                          max={10}
                          value={ratingInputs[match.matchId] || ''}
                          onChange={e => handleRatingChange(match.matchId, e.target.value)}
                          placeholder="Rate 1-10"
                          style={{
                            width: 110,
                            marginRight: 8,
                            marginBottom: 0
                          }}
                          disabled={submitting[match.matchId]}
                          onFocus={e => e.target.style.boxShadow = '0 0 5px rgba(0,123,255,.5)'}
                          onBlur={e => e.target.style.boxShadow = 'none'}
                        />
                        <ActionButton
                          onClick={() => handleSubmitRating(match.matchId)}
                          disabled={submitting[match.matchId]}
                        >
                          {submitting[match.matchId] ? 'Submitting...' : 'Submit Rating'}
                        </ActionButton>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
} 