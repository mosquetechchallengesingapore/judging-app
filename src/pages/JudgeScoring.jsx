import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function JudgeScoring({ hackathonId, onBack }) {
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedJudge, setSelectedJudge] = useState(null)
  const [scores, setScores] = useState({})
  const [notes, setNotes] = useState('')

  const teams = useQuery(api.teams.listByHackathon, { hackathonId }) || []
  const judges = useQuery(api.judges.listByHackathon, { hackathonId }) || []
  const criteria = useQuery(api.criteria.listByHackathon, { hackathonId }) || []
  const submitScore = useMutation(api.scores.submitScore)

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) setSelectedTeam(teams[0]._id)
    if (judges.length > 0 && !selectedJudge) setSelectedJudge(judges[0]._id)
  }, [teams, judges, selectedTeam, selectedJudge])

  const handleScoreChange = (criteriaId, score) => {
    setScores({ ...scores, [criteriaId]: score })
  }

  const handleSubmit = async () => {
    if (!selectedTeam || !selectedJudge) return alert('Please select a team and judge')
    for (const criteriaId of Object.keys(scores)) {
      await submitScore({ hackathonId, judgeId: selectedJudge, teamId: selectedTeam, criteriaId, score: scores[criteriaId], notes: notes || undefined })
    }
    setScores({})
    setNotes('')
    alert('Scores submitted successfully!')
  }

  const selectedTeamName = teams.find(t => t._id === selectedTeam)?.name || 'Alpha'
  const selectedJudgeName = judges.find(j => j._id === selectedJudge)?.name || 'Sarah Jenkins'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
            Score Team: {selectedTeamName}
          </h1>
          <div style={{ width: '40px' }}></div>
        </div>

        {/* Team & Judge Selection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '4px' }}>
              CURRENTLY SCORING
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <select value={selectedTeam || ''} onChange={(e) => setSelectedTeam(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '700', color: '#1e293b', cursor: 'pointer', outline: 'none' }}>
                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '4px' }}>
              ASSIGNED JUDGE
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <select value={selectedJudge || ''} onChange={(e) => setSelectedJudge(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '500', color: '#64748b', cursor: 'pointer', outline: 'none', textAlign: 'right' }}>
                {judges.map((j) => <option key={j._id} value={j._id}>{j.name}</option>)}
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Scoring Section */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {criteria.map((c) => (
            <div key={c._id} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{c.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                    Weight: {c.weight}%
                  </span>
                  <span style={{ backgroundColor: '#e8f0fe', color: '#0f49bd', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '700' }}>
                    {scores[c._id] || 0} / 10
                  </span>
                </div>
              </div>
              {scores[c._id] > 0 && (
                <div style={{ marginBottom: '8px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    Weighted Score: <span style={{ fontWeight: '700', color: '#0f49bd' }}>
                      {((scores[c._id] / 10) * c.weight).toFixed(2)}
                    </span> / {c.weight}
                  </span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleScoreChange(c._id, num)}
                    style={{
                      height: '44px',
                      border: scores[c._id] === num ? 'none' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: scores[c._id] === num ? '#0f49bd' : 'white',
                      color: scores[c._id] === num ? 'white' : '#475569',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Subtotal */}
          {Object.keys(scores).length > 0 && (
            <div style={{ marginTop: '24px', marginBottom: '24px', padding: '20px', backgroundColor: '#f0f9ff', border: '2px solid #0f49bd', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Weighted Score
                </span>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#0f49bd' }}>
                  {criteria.reduce((total, c) => {
                    const score = scores[c._id] || 0;
                    return total + ((score / 10) * c.weight);
                  }, 0).toFixed(2)} / 100
                </span>
              </div>
              <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '12px' }}>
                {criteria.map((c) => scores[c._id] > 0 && (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                    <span>{c.name} ({c.weight}%)</span>
                    <span style={{ fontWeight: '600' }}>
                      {scores[c._id]}/10 × {c.weight}% = {((scores[c._id] / 10) * c.weight).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/>
              </svg>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Notes</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share your thoughts on the project's impact and delivery..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#475569',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: '#0f49bd',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(15, 73, 189, 0.3)'
            }}
          >
            Submit Scores
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '500' }}>
            INTERNAL JUDGING DASHBOARD V2.4
          </p>
        </div>
      </div>
    </div>
  )
}
