import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function HackathonSetup({ hackathonId, onBack }) {
  const [activeTab, setActiveTab] = useState('criteria')
  const [formData, setFormData] = useState({})
  const [hackathonData, setHackathonData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  })
  const [currentHackathonId, setCurrentHackathonId] = useState(hackathonId)
  
  // Local cache for new hackathon setup
  const [localCriteria, setLocalCriteria] = useState([])
  const [localJudges, setLocalJudges] = useState([])
  const [localTeams, setLocalTeams] = useState([])

  const hackathon = useQuery(api.hackathons.get, currentHackathonId ? { id: currentHackathonId } : 'skip')
  const dbCriteria = useQuery(api.criteria.listByHackathon, currentHackathonId ? { hackathonId: currentHackathonId } : 'skip') || []
  const dbJudges = useQuery(api.judges.listByHackathon, currentHackathonId ? { hackathonId: currentHackathonId } : 'skip') || []
  const dbTeams = useQuery(api.teams.listByHackathon, currentHackathonId ? { hackathonId: currentHackathonId } : 'skip') || []

  // Use local cache for new hackathons, DB data for existing ones
  const criteria = currentHackathonId ? dbCriteria : localCriteria
  const judges = currentHackathonId ? dbJudges : localJudges
  const teams = currentHackathonId ? dbTeams : localTeams

  const createHackathon = useMutation(api.hackathons.create)
  const createCriteria = useMutation(api.criteria.create)
  const createJudge = useMutation(api.judges.create)
  const createTeam = useMutation(api.teams.create)
  const deleteCriteria = useMutation(api.criteria.remove)
  const deleteJudge = useMutation(api.judges.remove)
  const deleteTeam = useMutation(api.teams.remove)

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)

  const handleSave = async () => {
    if (!currentHackathonId) {
      // Creating new hackathon with all cached data
      if (!hackathonData.name || !hackathonData.startDate || !hackathonData.endDate) {
        alert('Please fill in hackathon name and dates')
        return
      }
      if (totalWeight !== 100) {
        alert('Total weight must equal 100% before saving')
        return
      }
      if (localCriteria.length === 0) {
        alert('Please add at least one criterion')
        return
      }
      
      try {
        // Create hackathon
        const newId = await createHackathon({
          name: hackathonData.name,
          description: hackathonData.description || '',
          startDate: hackathonData.startDate,
          endDate: hackathonData.endDate,
        })
        
        // Save all criteria
        for (const criterion of localCriteria) {
          await createCriteria({
            hackathonId: newId,
            name: criterion.name,
            weight: criterion.weight,
          })
        }
        
        // Save all judges
        for (const judge of localJudges) {
          await createJudge({
            hackathonId: newId,
            name: judge.name,
            role: judge.role,
          })
        }
        
        // Save all teams
        for (const team of localTeams) {
          await createTeam({
            hackathonId: newId,
            name: team.name,
            description: team.description,
          })
        }
        
        alert('Hackathon created successfully!')
        onBack()
      } catch (error) {
        alert('Error creating hackathon: ' + error.message)
      }
    } else {
      // Saving existing hackathon setup
      if (totalWeight !== 100) {
        alert('Total weight must equal 100% before saving')
        return
      }
      alert('Hackathon setup saved!')
      onBack()
    }
  }

  const handleAddCriteria = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.weight) return
    
    if (!currentHackathonId) {
      // Add to local cache for new hackathon
      setLocalCriteria([...localCriteria, {
        _id: Date.now().toString(), // Temporary ID
        name: formData.name,
        weight: parseInt(formData.weight),
      }])
      setFormData({})
    } else {
      // Save directly to DB for existing hackathon
      await createCriteria({ hackathonId: currentHackathonId, name: formData.name, weight: parseInt(formData.weight) })
      setFormData({})
    }
  }

  const handleAddJudge = async (e) => {
    e.preventDefault()
    if (!formData.judgeName || !formData.judgeRole) return
    
    if (!currentHackathonId) {
      // Add to local cache for new hackathon
      setLocalJudges([...localJudges, {
        _id: Date.now().toString(), // Temporary ID
        name: formData.judgeName,
        role: formData.judgeRole,
      }])
      setFormData({})
    } else {
      // Save directly to DB for existing hackathon
      await createJudge({ hackathonId: currentHackathonId, name: formData.judgeName, role: formData.judgeRole })
      setFormData({})
    }
  }

  const handleAddTeam = async (e) => {
    e.preventDefault()
    if (!formData.teamName || !formData.teamDescription) return
    
    if (!currentHackathonId) {
      // Add to local cache for new hackathon
      setLocalTeams([...localTeams, {
        _id: Date.now().toString(), // Temporary ID
        name: formData.teamName,
        description: formData.teamDescription,
      }])
      setFormData({})
    } else {
      // Save directly to DB for existing hackathon
      await createTeam({ hackathonId: currentHackathonId, name: formData.teamName, description: formData.teamDescription })
      setFormData({})
    }
  }

  const criteriaIcons = ['😊', '💻', '💼', '👁️']

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f6f8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', backgroundColor: '#f6f6f8', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>&lt;{hackathon?.name || hackathonData.name || 'New Hackathon'}&gt;</h1>
          <button 
            onClick={handleSave}
            style={{ 
              padding: '6px 16px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: (!currentHackathonId || totalWeight === 100) ? '#0f49bd' : '#e2e8f0', 
              color: (!currentHackathonId || totalWeight === 100) ? 'white' : '#94a3b8', 
              fontSize: '14px', 
              fontWeight: '700', 
              cursor: (!currentHackathonId || totalWeight === 100) ? 'pointer' : 'not-allowed' 
            }}
          >
            Save
          </button>
        </div>

        {/* Hackathon Details Form - Only show when creating new hackathon */}
        {!currentHackathonId && (
          <div style={{ backgroundColor: '#f6f6f8', padding: '24px 16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>Hackathon Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>HACKATHON NAME</label>
                  <input
                    type="text"
                    value={hackathonData.name}
                    onChange={(e) => setHackathonData({ ...hackathonData, name: e.target.value })}
                    placeholder="e.g. Global AI Hackathon 2024"
                    style={{ width: '100%', padding: '14px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa', transition: 'all 0.2s' }}
                    onFocus={(e) => e.target.style.backgroundColor = 'white'}
                    onBlur={(e) => e.target.style.backgroundColor = '#fafafa'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>DESCRIPTION (OPTIONAL)</label>
                  <textarea
                    value={hackathonData.description}
                    onChange={(e) => setHackathonData({ ...hackathonData, description: e.target.value })}
                    placeholder="Brief description of the hackathon"
                    style={{ width: '100%', padding: '14px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', minHeight: '80px', resize: 'vertical', backgroundColor: '#fafafa', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.5' }}
                    onFocus={(e) => e.target.style.backgroundColor = 'white'}
                    onBlur={(e) => e.target.style.backgroundColor = '#fafafa'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>START DATE</label>
                    <input
                      type="date"
                      value={hackathonData.startDate}
                      onChange={(e) => setHackathonData({ ...hackathonData, startDate: e.target.value })}
                      style={{ width: '100%', padding: '14px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>END DATE</label>
                    <input
                      type="date"
                      value={hackathonData.endDate}
                      onChange={(e) => setHackathonData({ ...hackathonData, endDate: e.target.value })}
                      style={{ width: '100%', padding: '14px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa' }}
                    />
                  </div>
                </div>
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginTop: '4px' }}>
                  <p style={{ fontSize: '13px', color: '#1e40af', margin: 0, lineHeight: '1.5' }}>
                    💡 Add criteria, judges, and teams below. Click "Save" when done to create the hackathon with all your settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
          {['criteria', 'judges', 'participants'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #0f49bd' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab ? '#0f49bd' : '#64748b',
                fontSize: '14px',
                fontWeight: activeTab === tab ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {/* Criteria Tab */}
          {activeTab === 'criteria' && (
            <>
              {/* Add Form */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0f49bd', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700' }}>+</div>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Add New Criterion</span>
                </div>
                <form onSubmit={handleAddCriteria}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>NAME</label>
                    <input type="text" placeholder="e.g. Creativity" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '14px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa' }} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>WEIGHT (%)</label>
                    <input type="number" placeholder="25" min="0" max="100" value={formData.weight || ''} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} style={{ width: '100%', padding: '14px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa' }} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: '#0f49bd', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(15,73,189,0.2)' }}>Save Criterion</button>
                </form>
              </div>

              {/* Existing Criteria */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Existing Criteria</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f49bd', backgroundColor: '#e8f0fe', padding: '4px 12px', borderRadius: '20px' }}>Total Weight: {totalWeight}%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {criteria.map((c, idx) => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {criteriaIcons[idx % criteriaIcons.length]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{c.name}</p>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>Weight: {c.weight}%</p>
                    </div>
                    <button onClick={() => {}} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#94a3b8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => {
                      if (!currentHackathonId) {
                        setLocalCriteria(localCriteria.filter(item => item._id !== c._id))
                      } else {
                        deleteCriteria({ id: c._id })
                      }
                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#94a3b8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Judges Tab */}
          {activeTab === 'judges' && (
            <>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Add New Judge</h2>
                <form onSubmit={handleAddJudge}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>FULL NAME</label>
                    <input type="text" placeholder="e.g. Sarah Johnson" value={formData.judgeName || ''} onChange={(e) => setFormData({ ...formData, judgeName: e.target.value })} style={{ width: '100%', padding: '14px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa' }} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>ROLE</label>
                    <select value={formData.judgeRole || ''} onChange={(e) => setFormData({ ...formData, judgeRole: e.target.value })} style={{ width: '100%', padding: '14px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa' }}>
                      <option value="">Select a role</option>
                      <option value="Technical Judge">Technical Judge</option>
                      <option value="Business Judge">Business Judge</option>
                      <option value="Design Judge">Design Judge</option>
                    </select>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: '#0f49bd', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(15,73,189,0.2)' }}>Add Judge</button>
                </form>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Current Judges</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f49bd', backgroundColor: '#e8f0fe', padding: '4px 12px', borderRadius: '20px' }}>{judges.length} Active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {judges.map((j) => (
                  <div key={j._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#0f49bd' }}>
                      {j.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{j.name}</p>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>{j.email}</p>
                    </div>
                    <button onClick={() => deleteJudge({ id: j._id })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#94a3b8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Add New Team</h2>
                <form onSubmit={handleAddTeam}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>TEAM NAME</label>
                    <input type="text" placeholder="Enter team name" value={formData.teamName || ''} onChange={(e) => setFormData({ ...formData, teamName: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>PROJECT DESCRIPTION</label>
                    <textarea placeholder="Describe the project goals and tech stack" value={formData.teamDescription || ''} onChange={(e) => setFormData({ ...formData, teamDescription: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', minHeight: '80px', resize: 'vertical' }} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#0f49bd', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Add Team to List</button>
                </form>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Current Teams</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f49bd', backgroundColor: '#e8f0fe', padding: '4px 12px', borderRadius: '20px' }}>{teams.length} Teams</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {teams.map((t) => (
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👥</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{t.name}</p>
                      <p style={{ fontSize: '13px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>
                    </div>
                    <button onClick={() => deleteTeam({ id: t._id })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#94a3b8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
