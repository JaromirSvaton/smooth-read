import React, { useState } from 'react'
import { User, Lock, LogIn, UserPlus, X } from 'lucide-react'
import { loginUser, registerUser, getCurrentUsername, logoutUser } from '../utils/auth'

interface AuthModalProps {
  onClose: () => void
  onAuthChange: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthChange }) => {
  const [mode, setMode] = useState<'login' | 'register'>(getCurrentUsername() ? 'login' : 'login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      if (mode === 'register') {
        await registerUser(username, password)
      } else {
        await loginUser(username, password)
      }
      onAuthChange()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Authentication failed')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700"><X className="w-5 h-5"/></button>
        </div>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"/>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"/>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-primary-500 text-white rounded-lg py-2 hover:bg-primary-600 flex items-center justify-center gap-2">
              {mode === 'login' ? (<><LogIn className="w-4 h-4"/>Sign in</>) : (<><UserPlus className="w-4 h-4"/>Create</>)}
            </button>
            <button type="button" onClick={()=>setMode(m=> m==='login' ? 'register' : 'login')} className="px-3 py-2 border rounded-lg">
              {mode==='login' ? 'Register' : 'Have account?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthModal

