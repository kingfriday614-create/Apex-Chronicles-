import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';
import { api } from '../services/api';
import { Mail, CheckCircle2, AlertCircle, MessageSquare, Building2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { settings } = useSite();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Editorial Inquiry',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    updatePageSeo({
      title: 'Contact Editorial Desk – Apex Chronicle',
      description: 'Submit confidential tips, press inquiries, syndication requests, and feedback to the editors of Apex Chronicle.',
      ogType: 'website'
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setFeedback('Please fill out all required fields.');
      return;
    }

    try {
      setStatus('loading');
      setFeedback('');

      const res = await api.submitContact(formData);
      setStatus('success');
      setFeedback(res.message || 'Your inquiry has been submitted successfully to our editorial desk.');
      setFormData({ name: '', email: '', subject: 'Editorial Inquiry', message: '' });
    } catch (err: any) {
      setStatus('error');
      setFeedback(err.message || 'Failed to submit message. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
      <Breadcrumb items={[{ label: 'Contact' }]} onNavigate={onNavigate} className="mb-6" />

      <header className="pb-8 border-b border-stone-200 mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-stone-500 block mb-2">
          Correspondence
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
          Contact Our Newsroom
        </h1>
        <p className="text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
          We welcome confidential news tips, corrections, academic feedback, and syndication inquiries from readers and organizations worldwide.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="border border-stone-200 bg-white p-6 sm:p-8 rounded shadow-sm">
            <h2 className="font-editorial text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-stone-700" />
              <span>Send a Message</span>
            </h2>

            {status === 'success' ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Dispatch Received</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
                  {feedback}
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded hover:bg-emerald-800 cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="j.doe@institution.edu"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Department / Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900 cursor-pointer"
                  >
                    <option value="Editorial Inquiry">Editorial &amp; Reporting Inquiry</option>
                    <option value="Confidential News Tip">Confidential News Tip</option>
                    <option value="Correction or Clarification">Correction or Clarification Request</option>
                    <option value="Syndication & Licensing">Syndication &amp; Republication</option>
                    <option value="Sponsorship & Advertising">Sponsorship &amp; Media Kit Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Correspondence <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details regarding your tip, story suggestion, or question..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
                  />
                </div>

                {status === 'error' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{feedback}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-2.5 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {status === 'loading' ? 'Transmitting Message...' : 'Transmit Message to Editors'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bureau Information */}
        <div className="md:col-span-5 space-y-6">
          <div className="border border-stone-200 bg-stone-50 p-6 rounded space-y-4">
            <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-stone-700" />
              <span>Direct Addresses</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-stone-900 block">Editorial Desk:</span>
                <span className="text-stone-600">{settings?.contact_email || 'editorial@apexchronicle.com'}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-900 block">Confidential Tips:</span>
                <span className="text-stone-600">tips@apexchronicle.com</span>
              </div>
              <div>
                <span className="font-semibold text-stone-900 block">Syndication &amp; Rights:</span>
                <span className="text-stone-600">syndication@apexchronicle.com</span>
              </div>
            </div>
          </div>

          <div className="border border-stone-200 bg-white p-6 rounded space-y-3">
            <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-stone-700" />
              <span>Operating Headquarters</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Apex Chronicle Media Group<br />
              500 Howard Street, Suite 800<br />
              San Francisco, CA 94105, United States
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
