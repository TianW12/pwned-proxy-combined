import { useState } from 'react';
import { getPasswordPwnedCount } from '../../lib/api'; // ← talks to the api layer
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function PasswordChecker() {
  const [password, setPassword] = useState(''); // what the user typed
  const [count, setCount] = useState<number | null>(null); // the result
  const [loading, setLoading] = useState(false); // "checking…" flag
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    if (!password) return;
    setLoading(true);
    setError(null);
    setCount(null);
    try {
      const hits = await getPasswordPwnedCount(password);
      setCount(hits);
      if (hits === 0) {
        import('canvas-confetti').then((mod) => {
          const confetti = mod.default;
          confetti({ particleCount: 100, spread: 70, origin: { x: 0.5, y: 0.7 } });
          confetti({ particleCount: 80, spread: 60, angle: 60, origin: { x: 0.1, y: 0.75 }, colors: ['#C7E333', '#A8CC2A', '#22C55E'] });
          confetti({ particleCount: 80, spread: 60, angle: 120, origin: { x: 0.9, y: 0.75 }, colors: ['#C7E333', '#A8CC2A', '#22C55E'] });
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setPassword('');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center max-w-xl mx-auto">
        <input
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          disabled={loading}
          className="flex-1 p-3 rounded-l-md border border-gray-300 bg-white text-black focus:outline-none"
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className="bg-[#C7E333] hover:bg-[#A8CC2A] text-white px-6 rounded-r-md font-semibold"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>

      {error && <div className="text-red-700 text-center">{error}</div>}

      {count !== null && (
        count > 0 ? (
          <div className="bg-red-100 border border-red-300 rounded-xl p-6 max-w-md mx-auto text-red-700 space-y-2">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-xl font-bold">Oh no — pwned!</h2>
            </div>
            <p>This password has been seen {count.toLocaleString()} times in data breaches!</p>
            <p>If you've used it anywhere, change it immediately.</p>
          </div>
        ) : (
          <div className="bg-white/90 border border-green-200 rounded-xl p-6 shadow max-w-md mx-auto text-gray-700">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-[#22C55E] mr-2" />
              <h2 className="text-xl font-bold text-[#22C55E]">Good news — no pwnage found!</h2>
            </div>
            <p>This password wasn't found in any known breach. That doesn't guarantee it's strong — just that it's not indexed here.</p>
          </div>
        )
      )}

      <p className="text-sm text-gray-500 text-center">
        The password is hashed in your browser; only a partial hash is sent to the API.
      </p>
    </div>
  );
}