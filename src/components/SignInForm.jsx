import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { saveAuthUser } from '../lib/auth'

export default function SignInForm({ onAuthSuccess }) {
  const [step, setStep] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('judge')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const signInMutation = useMutation(api.auth.signIn)
  const signUpMutation = useMutation(api.auth.signUp)
  const resetPasswordMutation = useMutation(api.auth.resetPassword)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const user = await signInMutation({ email, password })
      saveAuthUser(user)
      onAuthSuccess(user)
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const user = await signUpMutation({ email, password, name, role })
      saveAuthUser(user)
      onAuthSuccess(user)
    } catch (err) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const user = await resetPasswordMutation({ email, newPassword: password })
      setSuccess('Password reset successful! You can now sign in.')
      saveAuthUser(user)
      setTimeout(() => {
        onAuthSuccess(user)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            Hackathon Judging
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {step === 'signIn' ? 'Sign in to your account' : step === 'signUp' ? 'Create a new account' : 'Reset your password'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#065f46' }}>{success}</p>
          </div>
        )}

        {step === 'signIn' ? (
          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#94a3b8' : '#0f49bd',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setStep('signUp')}
                style={{ background: 'none', border: 'none', color: '#0f49bd', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign up
              </button>
            </p>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
              <button
                type="button"
                onClick={() => setStep('reset')}
                style={{ background: 'none', border: 'none', color: '#0f49bd', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Forgot password?
              </button>
            </p>
          </form>
        ) : step === 'reset' ? (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#94a3b8' : '#0f49bd',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setStep('signIn')}
                style={{ background: 'none', border: 'none', color: '#0f49bd', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="judge">Judge</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#94a3b8' : '#0f49bd',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setStep('signIn')}
                style={{ background: 'none', border: 'none', color: '#0f49bd', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
