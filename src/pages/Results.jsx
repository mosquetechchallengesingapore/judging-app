import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Results({ hackathonId, onBack }) {
  const [expandedTeam, setExpandedTeam] = useState(null)
  
  const hackathon = useQuery(api.hackathons.get, { id: hackathonId })
  const teams = useQuery(api.teams.listByHackathon, { hackathonId }) || []
  const criteria = useQuery(api.criteria.listByHackathon, { hackathonId }) || []
  const allScores = useQuery(api.scores.getHackathonScores, { hackathonId }) || []
  const judges = useQuery(api.judges.listByHackathon, { hackathonId }) || []

  // Calculate team scores from actual database scores
  const teamScores = teams.map((team) => {
    let totalScore = 0
    const breakdown = {}
    
    for (const c of criteria) {
      // Get all scores for this team and criterion
      const criteriaScores = allScores.filter(
        s => s.teamId === team._id && s.criteriaId === c._id
      )
      
      if (criteriaScores.length > 0) {
        // Average score from all judges
        const avgScore = criteriaScores.reduce((sum, s) => sum + s.score, 0) / criteriaScores.length
        // Weighted score: (score/10) * weight
        const weightedScore = (avgScore / 10) * c.weight
        // Get judge names who scored this
        const judgeNames = criteriaScores.map(s => {
          const judge = judges.find(j => j._id === s.judgeId)
          return judge ? judge.name : 'Unknown'
        })
        breakdown[c.name] = { 
          score: Math.round(avgScore * 10) / 10, 
          weight: c.weight, 
          weighted: Math.round(weightedScore * 10) / 10,
          judges: judgeNames,
          individualScores: criteriaScores.map(s => ({
            judgeName: judges.find(j => j._id === s.judgeId)?.name || 'Unknown',
            score: s.score
          }))
        }
        totalScore += weightedScore
      } else {
        breakdown[c.name] = { score: 0, weight: c.weight, weighted: 0, judges: [], individualScores: [] }
      }
    }
    
    return { ...team, finalScore: Math.round(totalScore * 10) / 10, breakdown }
  })

  const sorted = [...teamScores].sort((a, b) => b.finalScore - a.finalScore)
  const top3 = sorted.slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f6f8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', backgroundColor: '#f6f6f8', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f6f6f8' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#0f49bd' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
            {hackathon?.name || 'BuildTheFuture 2024'}
          </h1>
          <div style={{ width: '40px' }}></div>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div style={{ padding: '24px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', height: '280px' }}>
            {/* 2nd Place */}
            {top3[1] && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #94a3b8', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#64748b' }}>{top3[1].name.charAt(0)}</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '12px 12px 0 0', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-12px', backgroundColor: '#94a3b8', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>2nd</span>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>{top3[1].name}</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#0f49bd' }}>{top3[1].finalScore}</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-32px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #facc15', backgroundColor: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', boxShadow: '0 8px 16px rgba(250,204,21,0.3)' }}>
                  <span style={{ fontSize: '32px', fontWeight: '700', color: '#ca8a04' }}>{top3[0].name.charAt(0)}</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#0f49bd', borderRadius: '12px 12px 0 0', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '24px', position: 'relative', boxShadow: '0 8px 24px rgba(15,73,189,0.3)' }}>
                  <span style={{ position: 'absolute', top: '-12px', backgroundColor: '#facc15', color: '#1e293b', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '10px', border: '2px solid white' }}>1st</span>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: 'white', textAlign: 'center' }}>{top3[0].name}</p>
                  <p style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>{top3[0].finalScore}</p>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #f97316', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#ea580c' }}>{top3[2].name.charAt(0)}</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '12px 12px 0 0', height: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-12px', backgroundColor: '#f97316', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>3rd</span>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>{top3[2].name}</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#0f49bd' }}>{top3[2].finalScore}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Rankings */}
        <div style={{ padding: '0 16px 100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f49bd" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Live Rankings</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sorted.map((team, idx) => (
              <div key={team._id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedTeam(expandedTeam === team._id ? null : team._id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: 'rgba(15,73,189,0.3)', width: '24px' }}>{idx + 1}</span>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{team.name}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{team.description?.slice(0, 30)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#0f49bd' }}>{team.finalScore}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ transform: expandedTeam === team._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </button>
                {expandedTeam === team._id && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    {/* Get all unique judges who scored this team */}
                    {(() => {
                      const judgeScoreMap = new Map()
                      Object.entries(team.breakdown).forEach(([criteriaName, { individualScores }]) => {
                        if (individualScores) {
                          individualScores.forEach(({ judgeName, score }) => {
                            if (!judgeScoreMap.has(judgeName)) {
                              judgeScoreMap.set(judgeName, {})
                            }
                            judgeScoreMap.get(judgeName)[criteriaName] = score
                          })
                        }
                      })
                      
                      const criteriaNames = Object.keys(team.breakdown)
                      
                      return (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '8px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', fontSize: '10px' }}>Judge</th>
                                {criteriaNames.map(name => (
                                  <th key={name} style={{ textAlign: 'center', padding: '8px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', fontSize: '10px' }}>{name}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from(judgeScoreMap.entries()).map(([judgeName, scores]) => (
                                <tr key={judgeName} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '8px', fontWeight: '600', color: '#1e293b' }}>{judgeName}</td>
                                  {criteriaNames.map(criteriaName => (
                                    <td key={criteriaName} style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#0f49bd' }}>
                                      {scores[criteriaName] || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              <tr style={{ borderTop: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                <td style={{ padding: '8px', fontWeight: '700', color: '#1e293b' }}>Avg</td>
                                {criteriaNames.map(name => (
                                  <td key={name} style={{ textAlign: 'center', padding: '8px', fontWeight: '700', color: '#0f49bd' }}>
                                    {team.breakdown[name].score}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
