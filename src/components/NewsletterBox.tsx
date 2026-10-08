import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface NewsletterBoxProps {
  className?: string;
}

export const NewsletterBox: React.FC<NewsletterBoxProps> = ({ className = '' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please provide a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await api.subscribeNewsletter({ name, email });
      setStatus('success');
      setMessage(res.message || 'You have been successfully added to our morning dispatch.');
      setName('');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Unable to subscribe. Please try again.');
    }
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className={`border border-stone-200 bg-stone-100/60 p-6 sm:p-8 rounded ${className}`}
    >
      <div className="max-w-xl mx-auto text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-stone-900 text-white flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>

        <h3 id="newsletter-heading" className="font-editorial text-2xl font-bold text-stone-900">
          The Morning Briefing
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
          Delivered every weekday at 06:00 UTC. Essential market intelligence, geopolitical shifts, and deep-tech discoveries curated by our senior editors.
        </p>

        {status === 'success' ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name (optional)"
                className="w-full sm:w-1/3 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                required
                className="w-full sm:flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-2 bg-stone-900 text-white text-xs sm:text-sm font-semibold rounded hover:bg-stone-800 disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                {status === 'loading' ? 'Joining...' : 'Subscribe'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-xs text-rose-600 flex items-center justify-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{message}</span>
              </p>
            )}

            <p className="text-[11px] text-stone-500">
              Zero sponsored spam. Unsubscribe at any time with a single click.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
