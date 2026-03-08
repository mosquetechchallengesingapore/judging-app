import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function Lobby({ onSelectHackathon, onViewResults, onEditResults, onEnterScoring, onNavigate, onSignOut, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('')

  const hackathons = useQuery(api.hackathons.list) || []
  const deleteHackathon = useMutation(api.hackathons.remove)

  const filtered = hackathons.filter((h) =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f6f8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', backgroundColor: '#f6f6f8', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{currentUser?.name || 'User'}</span>
            <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>{currentUser?.role || 'Judge'}</span>
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', textAlign: 'center', flex: 1 }}>
            My Hackathons
          </h1>
          <button
            onClick={onSignOut}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#64748b', fontSize: '12px', fontWeight: '600' }}
          >
            Sign Out
          </button>
        </div>

        {/* Create Button - Only for Admins */}
        {currentUser?.role === 'admin' && (
          <div style={{ padding: '0 16px 16px' }}>
            <button
              onClick={() => onNavigate('setup', null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#0f49bd',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span> Create
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(226, 232, 240, 0.5)',
            borderRadius: '12px',
            padding: '12px 16px',
            gap: '8px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search hackathons"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '16px',
                color: '#1e293b',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Hackathon List */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
          {filtered.map((hackathon) => (
            <div
              key={hackathon._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ padding: '16px' }}>
                {/* Title */}
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  {hackathon.name}
                </h3>
                
                {/* Date */}
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                </p>

                {/* Buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <button
                    onClick={() => onNavigate('results', hackathon._id)}
                    style={{
                      flex: 1,
                      height: '36px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    View Results
                  </button>

                  {hackathon.status !== 'completed' ? (
                    <button
                      onClick={() => onNavigate('scoring', hackathon._id)}
                      style={{
                        flex: 1,
                        height: '36px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#0f49bd',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Enter<br/>Scoring
                    </button>
                  ) : (
                    <div style={{ flex: 1 }}></div>
                  )}

                  <button
                    onClick={() => onNavigate('editScores', hackathon._id)}
                    style={{
                      flex: 1,
                      height: '36px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Edit Results
                  </button>

                  <button
                    onClick={() => deleteHackathon({ id: hackathon._id })}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
              <p style={{ fontSize: '18px', fontWeight: '500' }}>No hackathons yet</p>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>Click "+ Create" to add your first hackathon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
