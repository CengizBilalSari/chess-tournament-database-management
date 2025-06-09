import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './components/DashboardHeader';
import SectionToggleButton from './components/SectionToggleButton';
import StyledDropdown from './components/StyledDropdown';
import StyledInput from './components/StyledInput';
import ActionButton from './components/ActionButton';

const userRoles = [
  { label: 'Player', value: 'player' },
  { label: 'Coach', value: 'coach' },
  { label: 'Arbiter', value: 'arbiter' },
];

export default function DBManagerDashboard() {
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState('');
  const [newHallName, setNewHallName] = useState('');
  const [hallMsg, setHallMsg] = useState('');
  const [hallLoading, setHallLoading] = useState(false);
  const [showHallSection, setShowHallSection] = useState(false);
  const [hallsFetched, setHallsFetched] = useState(false);

  const [activeTab, setActiveTab] = useState('player');
  const [userForm, setUserForm] = useState({
    player: { username: '', password: '', name: '', surname: '', nationality: '', dateOfBirth: '', fideId: '', eloRating: '', titleId: '' },
    coach: { username: '', password: '', name: '', surname: '', nationality: '', certifications: '', teamId: '', contractStart: '', contractFinish: '' },
    arbiter: { username: '', password: '', name: '', surname: '', nationality: '', experienceLevel: '', certifications: '' },
  });
  const [userMsg, setUserMsg] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [showUserSection, setShowUserSection] = useState(false);

  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate('/', { replace: true });
    }
  }, [username, navigate]);

  // Fetch halls when the hall section is shown
  const handleShowHallSection = async () => {
    if (!showHallSection) {
      setShowHallSection(true);
      if (!hallsFetched) {
        setHallLoading(true);
        try {
          const res = await fetch('/api/coach/halls');
          if (!res.ok) throw new Error('Failed to fetch halls');
          const data = await res.json();
          setHalls(data);
          if (data.length > 0) setSelectedHall(data[0].hallId);
          setHallsFetched(true);
        } catch (e) {
          setHallMsg('Could not load halls.');
        } finally {
          setHallLoading(false);
        }
      }
    } else {
      setShowHallSection(false);
    }
  };

  // Toggle show user section
  const handleShowUserSection = () => {
    setShowUserSection(!showUserSection);
  };

  // Handle hall rename
  const handleRenameHall = async (e) => {
    e.preventDefault();
    if (!selectedHall || !newHallName) {
      setHallMsg('Please select a hall and enter a new name.');
      return;
    }
    setHallLoading(true);
    setHallMsg('');
    try {
      const res = await fetch(`/api/db-manager/halls/name/${selectedHall}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: newHallName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rename hall');
      setHallMsg('Hall renamed successfully!');
      // Refresh halls
      const hallsRes = await fetch('/api/coach/halls');
      const hallsData = await hallsRes.json();
      setHalls(hallsData);
      setNewHallName('');
    } catch (e) {
      setHallMsg(e.message);
    } finally {
      setHallLoading(false);
    }
  };

  // Handle user form change
  const handleUserFormChange = (role, field, value) => {
    setUserForm(f => ({ ...f, [role]: { ...f[role], [field]: value } }));
  };

  // Password policy validation function
  function validatePassword(password) {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (password.length < minLength) return 'Password must be at least 8 characters.';
    if (!hasUpper) return 'Password must include at least one uppercase letter.';
    if (!hasLower) return 'Password must include at least one lowercase letter.';
    if (!hasDigit) return 'Password must include at least one digit.';
    if (!hasSpecial) return 'Password must include at least one special character.';
    return '';
  }

  // Handle user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserLoading(true);
    setUserMsg('');
    const role = activeTab;
    let payload = { ...userForm[role] };
    // Password policy check
    const passwordError = validatePassword(payload.password);
    if (passwordError) {
      setUserMsg(passwordError);
      setUserLoading(false);
      return;
    }
    if (role === 'arbiter') {
      payload.certifications = payload.certifications.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (role === 'player') {
      payload.eloRating = Number(payload.eloRating);
      payload.titleId = Number(payload.titleId);
    }
    if (role === 'coach') {
      payload.certifications = payload.certifications.split(',').map(s => s.trim()).filter(Boolean);
      payload.teamId = payload.teamId ? Number(payload.teamId) : null;
      payload.contractStart = payload.contractStart || null;
      payload.contractFinish = payload.contractFinish || null;
      delete payload.specialties;
    }
    try {
      const res = await fetch(`/api/db-manager/users/${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setUserMsg('User created successfully!');
      setUserForm(f => ({ ...f, [role]: Object.fromEntries(Object.keys(f[role]).map(k => [k, ''])) }));
    } catch (e) {
      setUserMsg(e.message);
    } finally {
      setUserLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      <DashboardHeader title="DB Manager Dashboard" onLogout={handleLogout} />
      <div style={{ padding: '96px 32px 32px 32px' }}>
        <div style={{ 
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center'
        }}>
          <SectionToggleButton
            label="Hall Management"
            toggled={showHallSection}
            onClick={handleShowHallSection}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
          />
          <SectionToggleButton
            label="User Management"
            toggled={showUserSection}
            onClick={handleShowUserSection}
            iconOn={<FaEye />}
            iconOff={<FaEyeSlash />}
            style={{ marginRight: 0 }}
          />
        </div>

        {showHallSection && (
          <div style={{ marginBottom: 40 }}>
            <h3>Rename a Hall</h3>
            <form onSubmit={handleRenameHall} style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 12, maxWidth: 800, margin: '0 auto' }}>
              <StyledDropdown 
                value={selectedHall} 
                onChange={e => setSelectedHall(e.target.value)} 
                disabled={hallLoading || halls.length === 0}
                style={{ marginBottom: 0 }}
              >
                {halls.map(hall => (
                  <option key={hall.hallId} value={hall.hallId}>{hall.name} (ID: {hall.hallId})</option>
                ))}
              </StyledDropdown>
              <StyledInput
                type="text"
                placeholder="New hall name"
                value={newHallName}
                onChange={e => setNewHallName(e.target.value)}
                disabled={hallLoading}
                style={{ marginBottom: 0 }}
              />
              <ActionButton type="submit" disabled={hallLoading}>Rename</ActionButton>
            </form>
            {hallMsg && <div style={{ color: hallMsg.includes('success') ? 'green' : 'red', marginTop: 8 }}>{hallMsg}</div>}
          </div>
        )}
        
        {showUserSection && (
          <div>
            <h3>Add New User</h3>
            <div style={{ marginBottom: 16 }}>
              {userRoles.map(r => (
                <ActionButton
                  key={r.value}
                  onClick={() => { setActiveTab(r.value); setUserMsg(''); }}
                  variant={activeTab === r.value ? 'primary' : 'secondary'}
                  style={{ 
                    marginRight: 8, 
                    fontWeight: activeTab === r.value ? 'bold' : 'normal',
                    padding: '0px 12px',
                    
                    
                    transition: 'all 0.2s ease'
                  }}
                >
                  {r.label}
                </ActionButton>
              ))}
            </div>
            <form onSubmit={handleCreateUser} style={{ maxWidth: 400, margin: '0 auto' }}>
              {activeTab === 'player' && (
                <>
                  <StyledInput type="text" placeholder="Username" value={userForm.player.username} onChange={e => handleUserFormChange('player', 'username', e.target.value)} required />
                  <StyledInput type="password" placeholder="Password" value={userForm.player.password} onChange={e => handleUserFormChange('player', 'password', e.target.value)} required />
                  <StyledInput type="text" placeholder="Name" value={userForm.player.name} onChange={e => handleUserFormChange('player', 'name', e.target.value)} required />
                  <StyledInput type="text" placeholder="Surname" value={userForm.player.surname} onChange={e => handleUserFormChange('player', 'surname', e.target.value)} required />
                  <StyledInput type="text" placeholder="Nationality" value={userForm.player.nationality} onChange={e => handleUserFormChange('player', 'nationality', e.target.value)} required />
                  <StyledInput type="date" placeholder="Date of Birth" value={userForm.player.dateOfBirth} onChange={e => handleUserFormChange('player', 'dateOfBirth', e.target.value)} required />
                  <StyledInput type="text" placeholder="FIDE ID" value={userForm.player.fideId} onChange={e => handleUserFormChange('player', 'fideId', e.target.value)} />
                  <StyledInput type="number" placeholder="ELO Rating" value={userForm.player.eloRating} onChange={e => handleUserFormChange('player', 'eloRating', e.target.value)} required />
                  <StyledInput type="number" placeholder="Title ID" value={userForm.player.titleId} onChange={e => handleUserFormChange('player', 'titleId', e.target.value)} required />
                </>
              )}
              {activeTab === 'coach' && (
                <>
                  <StyledInput type="text" placeholder="Username" value={userForm.coach.username} onChange={e => handleUserFormChange('coach', 'username', e.target.value)} required />
                  <StyledInput type="password" placeholder="Password" value={userForm.coach.password} onChange={e => handleUserFormChange('coach', 'password', e.target.value)} required />
                  <StyledInput type="text" placeholder="Name" value={userForm.coach.name} onChange={e => handleUserFormChange('coach', 'name', e.target.value)} required />
                  <StyledInput type="text" placeholder="Surname" value={userForm.coach.surname} onChange={e => handleUserFormChange('coach', 'surname', e.target.value)} required />
                  <StyledInput type="text" placeholder="Nationality" value={userForm.coach.nationality} onChange={e => handleUserFormChange('coach', 'nationality', e.target.value)} required />
                  <StyledInput type="text" placeholder="Certifications (comma separated)" value={userForm.coach.certifications} onChange={e => handleUserFormChange('coach', 'certifications', e.target.value)} />
                  <StyledInput type="number" placeholder="Team ID" value={userForm.coach.teamId} onChange={e => handleUserFormChange('coach', 'teamId', e.target.value)} required />
                  <StyledInput type="date" placeholder="Contract Start" value={userForm.coach.contractStart} onChange={e => handleUserFormChange('coach', 'contractStart', e.target.value)} required />
                  <StyledInput type="date" placeholder="Contract Finish" value={userForm.coach.contractFinish} onChange={e => handleUserFormChange('coach', 'contractFinish', e.target.value)} required />
                </>
              )}
              {activeTab === 'arbiter' && (
                <>
                  <StyledInput type="text" placeholder="Username" value={userForm.arbiter.username} onChange={e => handleUserFormChange('arbiter', 'username', e.target.value)} required />
                  <StyledInput type="password" placeholder="Password" value={userForm.arbiter.password} onChange={e => handleUserFormChange('arbiter', 'password', e.target.value)} required />
                  <StyledInput type="text" placeholder="Name" value={userForm.arbiter.name} onChange={e => handleUserFormChange('arbiter', 'name', e.target.value)} required />
                  <StyledInput type="text" placeholder="Surname" value={userForm.arbiter.surname} onChange={e => handleUserFormChange('arbiter', 'surname', e.target.value)} required />
                  <StyledInput type="text" placeholder="Nationality" value={userForm.arbiter.nationality} onChange={e => handleUserFormChange('arbiter', 'nationality', e.target.value)} required />
                  <StyledInput type="text" placeholder="Experience Level" value={userForm.arbiter.experienceLevel} onChange={e => handleUserFormChange('arbiter', 'experienceLevel', e.target.value)} required />
                  <StyledInput type="text" placeholder="Certifications (comma separated)" value={userForm.arbiter.certifications} onChange={e => handleUserFormChange('arbiter', 'certifications', e.target.value)} />
                </>
              )}
              <ActionButton type="submit" disabled={userLoading} style={{ marginTop: 8 }}>Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</ActionButton>
            </form>
            {userMsg && <div style={{ color: userMsg.includes('success') ? 'green' : 'red', marginTop: 8 }}>{userMsg}</div>}
          </div>
        )}
      </div>
    </>
  );
} 