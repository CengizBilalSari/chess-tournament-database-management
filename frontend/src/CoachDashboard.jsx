import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './components/DashboardHeader';
import SectionToggleButton from './components/SectionToggleButton';
import StyledDropdown from './components/StyledDropdown';
import StyledInput from './components/StyledInput';
import ActionButton from './components/ActionButton';

export default function CoachDashboard() {
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  // State for halls
  const [halls, setHalls] = useState([]);
  const [hallMsg, setHallMsg] = useState('');

  // State for match deletion
  const [createdMatches, setCreatedMatches] = useState([]);
  const [selectedDeleteMatch, setSelectedDeleteMatch] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  // State for player assignment
  const [ownMatches, setOwnMatches] = useState([]);
  const [selectedAssignMatch, setSelectedAssignMatch] = useState('');
  const [assignableColor, setAssignableColor] = useState('');
  const [assignPlayers, setAssignPlayers] = useState([]);
  const [selectedAssignPlayer, setSelectedAssignPlayer] = useState('');
  const [assignMsg, setAssignMsg] = useState('');

  // State for match creation
  const [infoForMatches, setInfoForMatches] = useState({ teams: [], arbiters: [], tables: [] });
  const [createMsg, setCreateMsg] = useState('');
  const [matchForm, setMatchForm] = useState({
    date: '',
    timeSlot: '',
    hallId: '',
    tableId: '',
    whitePlayerTeamId: '',
    blackPlayerTeamId: '',
    arbiterUsername: '',
  });

  // Section toggle state (multiple open allowed)
  const [sectionOpen, setSectionOpen] = useState({
    halls: false,
    create: false,
    assign: false,
    delete: false
  });

  // Fetch all needed data on mount
  useEffect(() => {
    if (!username) {
      navigate('/', { replace: true });
    }
    // Halls
    fetch('/api/coach/halls')
      .then(res => res.json())
      .then(setHalls)
      .catch(() => setHallMsg('Could not load halls.'));
    // Own matches for assignment
    fetch(`/api/coach/ownMatches/${username}`)
      .then(res => res.json())
      .then(setOwnMatches);
    // Info for match creation
    fetch('/api/coach/infoForMatches')
      .then(res => res.json())
      .then(setInfoForMatches);
  }, [username, navigate]);

  // Fetch created matches for deletion
  const fetchCreatedMatches = () => {
    fetch(`/api/coach/createdMatches/${username}`)
      .then(res => res.json())
      .then(setCreatedMatches);
  };

  // Handle match deletion
  const handleDeleteMatch = async () => {
    setDeleteMsg('');
    if (!selectedDeleteMatch) return setDeleteMsg('Select a match to delete.');
    try {
      const res = await fetch(`/api/coach/matches/${selectedDeleteMatch}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete match');
      setDeleteMsg('Match deleted successfully!');
      setCreatedMatches(matches => matches.filter(m => m.matchId !== Number(selectedDeleteMatch)));
      setSelectedDeleteMatch('');
    } catch (e) {
      setDeleteMsg(e.message);
    }
  };

  // Handle match selection for assignment
  const handleSelectAssignMatch = async () => {
    setAssignMsg('');
    setAssignPlayers([]);
    setSelectedAssignPlayer('');
    if (!selectedAssignMatch) return setAssignMsg('Select a match.');
    const match = ownMatches.find(m => m.matchId === Number(selectedAssignMatch));
    if (!match) return setAssignMsg('Match not found.');
    // Determine which color the coach can assign
    const color = match.assignablePlayerColor;
    setAssignableColor(color);
    const teamId = color === 'white' ? match.whitePlayerTeamId : match.blackPlayerTeamId;
    // Fetch players for that team
    fetch(`/api/coach/players/${teamId}`)
      .then(res => res.json())
      .then(setAssignPlayers)
      .catch(() => setAssignMsg('Could not load players.'));
  };

  // Handle player assignment
  const handleAssignPlayer = async () => {
    setAssignMsg('');
    if (!selectedAssignMatch || !selectedAssignPlayer) return setAssignMsg('Select both match and player.');
    try {
      const res = await fetch(`/api/coach/matches/${selectedAssignMatch}/assign-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerUsername: selectedAssignPlayer, whitePlayer: assignableColor === 'white' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign player');
      setAssignMsg('Player assigned successfully!');
      // Re-fetch the matches from the backend to get the updated list
      fetch(`/api/coach/ownMatches/${username}`)
        .then(res => res.json())
        .then(setOwnMatches);
      setSelectedAssignMatch('');
      setAssignPlayers([]);
      setSelectedAssignPlayer('');
    } catch (e) {
      setAssignMsg(e.message);
    }
  };

  // Handle match creation form change
  const handleMatchFormChange = (field, value) => {
    setMatchForm(f => ({ ...f, [field]: value }));
  };

  // Handle match creation
  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setCreateMsg('');
    // Coach must select their own team for one color
    if (!(matchForm.whitePlayerTeamId && matchForm.blackPlayerTeamId)) {
      setCreateMsg('Select both teams.');
      return;
    }
    if (matchForm.whitePlayerTeamId === matchForm.blackPlayerTeamId) {
      setCreateMsg('Teams must be different.');
      return;
    }
    try {
      const payload = {
        date: matchForm.date,
        timeSlot: Number(matchForm.timeSlot),
        hallId: Number(matchForm.hallId),
        tableId: Number(matchForm.tableId),
        whitePlayerTeamId: Number(matchForm.whitePlayerTeamId),
        blackPlayerTeamId: Number(matchForm.blackPlayerTeamId),
        arbiterUsername: matchForm.arbiterUsername,
        creatorCoachUsername: username,
      };
      const res = await fetch('/api/coach/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create match');
      setCreateMsg('Match created successfully!');
      setMatchForm({ date: '', timeSlot: '', hallId: '', tableId: '', whitePlayerTeamId: '', blackPlayerTeamId: '', arbiterUsername: '' });
    } catch (e) {
      setCreateMsg(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      <DashboardHeader title="Coach Dashboard" onLogout={handleLogout} />
      <div style={{ padding: '96px 32px 32px 32px' }}>
        <div style={{
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'row'
        }}>
          <SectionToggleButton
            label="Halls"
            toggled={sectionOpen.halls}
            onClick={() => setSectionOpen(s => ({ ...s, halls: !s.halls }))}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
          />
          <SectionToggleButton
            label="Create Match"
            toggled={sectionOpen.create}
            onClick={() => setSectionOpen(s => ({ ...s, create: !s.create }))}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
          />
          <SectionToggleButton
            label="Assign Player"
            toggled={sectionOpen.assign}
            onClick={() => setSectionOpen(s => ({ ...s, assign: !s.assign }))}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
          />
          <SectionToggleButton
            label="Delete Match"
            toggled={sectionOpen.delete}
            onClick={() => {
              setSectionOpen(s => {
                const next = { ...s, delete: !s.delete };
                if (!s.delete) fetchCreatedMatches();
                return next;
              });
            }}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
            style={{ marginRight: 0 }}
          />
        </div>
        {/* Halls */}
        {sectionOpen.halls && (
          <div style={{ marginBottom: 32 }}>
            <h3>Available Halls</h3>
            {hallMsg && <div style={{ color: 'red' }}>{hallMsg}</div>}
            <ul>
              {halls.map(hall => (
                <li key={hall.hallId}>{hall.name} ({hall.country}) - Tables: {hall.capacity}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Match Creation */}
        {sectionOpen.create && (
          <div style={{ marginBottom: 32 }}>
            <h3>Create a Match</h3>
            <form onSubmit={handleCreateMatch} style={{ maxWidth: 500, margin: '0 auto' }}>
              <StyledInput type="date" value={matchForm.date} onChange={e => handleMatchFormChange('date', e.target.value)} required style={{ marginBottom: 8, width: '100%' }} />
              <StyledDropdown value={matchForm.timeSlot} onChange={e => handleMatchFormChange('timeSlot', e.target.value)} required style={{ marginBottom: 8, width: '100%' }}>
                <option value="">Select Time Slot</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </StyledDropdown>
              <StyledDropdown value={matchForm.hallId} onChange={e => handleMatchFormChange('hallId', e.target.value)} required style={{ marginBottom: 8, width: '100%' }}>
                <option value="">Select Hall</option>
                {halls.map(hall => (
                  <option key={hall.hallId} value={hall.hallId}>{hall.name}</option>
                ))}
              </StyledDropdown>
              <StyledDropdown value={matchForm.tableId} onChange={e => handleMatchFormChange('tableId', e.target.value)} required style={{ marginBottom: 8, width: '100%' }} disabled={!matchForm.hallId}>
                <option value="">Select Table</option>
                {infoForMatches.tables
                  ?.filter(table => matchForm.hallId && table.hallId === Number(matchForm.hallId))
                  .map(table => (
                    <option key={table.tableId} value={table.tableId}>Hall {table.hallId} - Table {table.tableId}</option>
                  ))}
              </StyledDropdown>
              <StyledDropdown value={matchForm.whitePlayerTeamId} onChange={e => handleMatchFormChange('whitePlayerTeamId', e.target.value)} required style={{ marginBottom: 8, width: '100%' }}>
                <option value="">Select White Team</option>
                {infoForMatches.teams?.map(teamId => (
                  <option key={teamId} value={teamId}>{teamId}</option>
                ))}
              </StyledDropdown>
              <StyledDropdown value={matchForm.blackPlayerTeamId} onChange={e => handleMatchFormChange('blackPlayerTeamId', e.target.value)} required style={{ marginBottom: 8, width: '100%' }}>
                <option value="">Select Black Team</option>
                {infoForMatches.teams?.map(teamId => (
                  <option key={teamId} value={teamId}>{teamId}</option>
                ))}
              </StyledDropdown>
              <StyledDropdown value={matchForm.arbiterUsername} onChange={e => handleMatchFormChange('arbiterUsername', e.target.value)} required style={{ marginBottom: 8, width: '100%' }}>
                <option value="">Select Arbiter</option>
                {infoForMatches.arbiters?.map(arb => (
                  <option key={arb} value={arb}>{arb}</option>
                ))}
              </StyledDropdown>
              <ActionButton type="submit">Create Match</ActionButton>
            </form>
            {createMsg && <div style={{ color: createMsg.includes('success') ? 'green' : 'red', marginTop: 8 }}>{createMsg}</div>}
          </div>
        )}
        {/* Player Assignment */}
        {sectionOpen.assign && (
          <div style={{ marginBottom: 32 }}>
            <h3>Assign Player to Match</h3>
            {assignMsg && <div style={{ color: assignMsg.includes('success') ? 'green' : 'red', marginTop: 8 }}>{assignMsg}</div>}
            <div style={{ marginBottom: 8 }}>
              <StyledDropdown value={selectedAssignMatch} onChange={e => setSelectedAssignMatch(e.target.value)} style={{ marginRight: 8 }}>
                <option value="">Select Match</option>
                {ownMatches.map(match => (
                  <option key={match.matchId} value={match.matchId}>
                    #{match.matchId} {match.date} | Table: {match.tableId} (Assign {match.assignablePlayerColor} player)
                  </option>
                ))}
              </StyledDropdown>
              <ActionButton onClick={handleSelectAssignMatch}>Select Match</ActionButton>
            </div>
            {assignPlayers.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <StyledDropdown value={selectedAssignPlayer} onChange={e => setSelectedAssignPlayer(e.target.value)} style={{ marginRight: 8 }}>
                  <option value="">Select Player</option>
                  {assignPlayers.map(username => (
                    <option key={username} value={username}>{username}</option>
                  ))}
                </StyledDropdown>
                <ActionButton onClick={handleAssignPlayer}>Select Player</ActionButton>
              </div>
            )}
          </div>
        )}
        {/* Match Deletion */}
        {sectionOpen.delete && (
          <div>
            <h3>Delete a Match</h3>
            {deleteMsg && <div style={{ color: deleteMsg.includes('success') ? 'green' : 'red', marginTop: 8 }}>{deleteMsg}</div>}
            <div style={{ marginBottom: 8 }}>
              <StyledDropdown value={selectedDeleteMatch} onChange={e => setSelectedDeleteMatch(e.target.value)} onFocus={fetchCreatedMatches} style={{ marginRight: 8 }}>
                <option value="">Select Match</option>
                {createdMatches.map(match => (
                  <option key={match.matchId} value={match.matchId}>
                    #{match.matchId} {match.date} | Table: {match.tableId}
                  </option>
                ))}
              </StyledDropdown>
              <ActionButton onClick={handleDeleteMatch} variant="danger">Delete Match</ActionButton>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 