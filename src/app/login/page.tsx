'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body: any = { username, password };
      if (tab === 'register') body.displayName = displayName || username;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      localStorage.setItem('memoryos_token', data.token);
      localStorage.setItem('memoryos_user', JSON.stringify(data.user));
      router.push('/');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-3">
            M
          </div>
          <h1 className="text-xl font-bold text-white">MemoryOS</h1>
          <p className="text-sm text-white/40 mt-1">Sign in to your memory system</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex mb-6 rounded-lg bg-white/[0.04] p-1">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${tab === 'login' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white/60'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2 text-sm rounded-md transition-colors ${tab === 'register' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white/60'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/40 transition-colors"
                placeholder="Enter username"
                required
              />
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-xs text-white/50 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/40 transition-colors"
                  placeholder="How others see you"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-white/50 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/40 transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
