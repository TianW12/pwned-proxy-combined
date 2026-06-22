import { useState } from 'react';
import { getStealerLogsByEmail } from '../../lib/api';
import { AlertTriangle, CheckCircle } from 'lucide-react';


type Status = 'idle' | 'loading' | 'done' | 'error';

export default function EmailChecker() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [sites, setSites] = useState<string[]>([]);  
  const [error, setError] = useState('');

  async function handleCheck() {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const data = await getStealerLogsByEmail(trimmed);
      setSites(data);
      setStatus('done');

      // confetti when clean
      if (data.length === 0) {
        import('canvas-confetti').then((mod) => {
          const confetti = mod.default;
          confetti({ particleCount: 100, spread: 70, origin: { x: 0.5, y: 0.7 } });
          confetti({ particleCount: 80, spread: 60, angle: 60, origin: { x: 0.1, y: 0.75 }, colors: ['#C7E333', '#A8CC2A', '#22C55E'] });
          confetti({ particleCount: 80, spread: 60, angle: 120, origin: { x: 0.9, y: 0.75 }, colors: ['#C7E333', '#A8CC2A', '#22C55E'] });
        });
      }
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  }

  return (
    <div className="space-y-8">
      {/* Input row */}
      <div className="flex justify-center">
        <input
          type="email"
          placeholder="Enter the email for check"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          disabled={status === 'loading'}
          className="flex-1 p-3 rounded-l-md border border-gray-300 bg-white text-black focus:outline-none"
        />
        <button
          onClick={handleCheck}
          disabled={status === 'loading' || !email}
          className="bg-[#C7E333] hover:bg-[#A8CC2A] text-white px-6 rounded-r-md font-semibold disabled:opacity-50"
        >
          {status === 'loading' ? 'Checking…' : 'Check'}
        </button>
      </div>

      {/* Error */}
      {(status === 'error' || error) && (
        <div className="text-red-700 text-center">{error}</div>
      )}
      {/* Clean: green card + confetti */}
      {status === 'done' && sites.length === 0 && (
         <div className="bg-white/90 border border-green-200 rounded-xl p-6 shadow max-w-md mx-auto text-gray-700">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-[#22C55E] mr-2" />
            <h2 className="text-xl font-bold text-[#22C55E]">Good news — no stealer logs!</h2>
          </div>
          <p>This email wasn't found in any stealer logs.</p>
        </div>
      )}
      
      {/* Found: red card listing sites */}
      {status === 'done' && sites.length > 0 && (
         <div className="bg-red-100 border border-red-300 rounded-xl p-6 max-w-md mx-auto text-red-700 space-y-3">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-xl font-bold">
              Found in {sites.length} site{sites.length > 1 ? 's' : ''}!
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {sites.map((domain) => (
              <span key={domain} className="bg-red-200 border border-red-300 px-3 py-1 rounded-full text-sm">
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
