import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function EditScores({ hackathonId, onBack }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [teamScores, setTeamScores] = useState({})

  const hackathon = useQuery(api.hackathons.get, { id: hackathonId })
  const teams = useQuery(api.teams.listByHackathon, { hackathonId }) || []
  const criteria = useQuery(api.criteria.listByHackathon, { hackathonId }) || []
  const allScores = useQuery(api.scores.getHackathonScores, { hackathonId }) || []
  const updateScore = useMutation(api.scores.updateScore)

  // Load existing scores into state
  useEffect(() => {
    if (allScores.length > 0 && Object.keys(teamScores).length === 0) {
      const loadedScores = {}
      for (const score of allScores) {
        if (!loadedScores[score.teamId]) loadedScores[score.teamId] = {}
        loadedScores[score.teamId][score.criteriaId] = score.score
      }
      setTeamScores(loadedScores)
    }
  }, [allScores])

  const filtered = teams.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleScoreChange = (teamId, criteriaId, value) => {
    const newValue = Math.min(10, Math.max(0, parseInt(value) || 0))
    setTeamScores(prev => ({ ...prev, [teamId]: { ...prev[teamId], [criteriaId]: newValue } }))
  }

  const getTeamTotal = (teamId) => {
    const scores = teamScores[teamId] || {}
    let total = 0
    for (const c of criteria) {
      const score = scores[c._id] || 0
      total += (score / 10) * c.weight
    }
    return Math.round(total * 10) / 10
  }

  const handleSave = async () => {
    try {
      for (const score of allScores) {
        const newValue = teamScores[score.teamId]?.[score.criteriaId]
        if (newValue !== undefined && newValue !== score.score) {
          await updateScore({ scoreId: score._id, score: newValue })
        }
      }
      alert('Scores updated successfully!')
    } catch (error) {
      alert('Error updating scores: ' + error.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f6f8', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', backgroundColor: '#f6f6f8', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f6f6f8', borderBottom: '1px solid #e2e8f0' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{hackathon?.name || 'Global AI Hackathon 2024'}</h1>
          <button onClick={handleSave} style={{ background: 'none', border: 'none', color: '#0f49bd', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>Save</button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '16px', paddingBottom: '100px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Edit Final Scores</h2>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by team name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', backgroundColor: 'white', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Team Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((team) => (
              <div key={team._id} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* Team Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f49bd" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{team.name}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{team.description?.slice(0, 25) || 'AI Health Assistant'}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>TOTAL</p>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f49bd' }}>{getTeamTotal(team._id) || 88}</p>
                  </div>
                </div>

                {/* Score Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px' }}>
                  {criteria.map((c) => (
                    <div key={c._id}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>{c.name}</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={teamScores[team._id]?.[c._id] || ''}
                        onChange={(e) => handleScoreChange(team._id, c._id, e.target.value)}
                        placeholder="0"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', fontWeight: '600', textAlign: 'center', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '420px', margin: '0 auto', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', padding: '8px 0', zIndex: 50 }}>
          <button onClick={onBack} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span style={{ fontSize: '10px', fontWeight: '500' }}>Dashboard</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span style={{ fontSize: '10px', fontWeight: '500' }}>Teams</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#0f49bd' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span style={{ fontSize: '10px', fontWeight: '500' }}>Scoring</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span style={{ fontSize: '10px', fontWeight: '500' }}>Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}
