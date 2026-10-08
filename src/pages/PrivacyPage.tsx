import React, { useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    updatePageSeo({
      title: 'Privacy Policy – Apex Chronicle',
      description: 'Privacy policy, data collection practices, cookies, reader rights, and security policies of Apex Chronicle.',
      ogType: 'website'
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
      <Breadcrumb items={[{ label: 'Privacy Policy' }]} onNavigate={onNavigate} className="mb-6" />

      <header className="pb-8 border-b border-stone-200 mb-10">
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-stone-500">
          Last revised: October 6, 2026 · Effective immediately
        </p>
      </header>

      <div className="font-sans text-sm sm:text-base text-stone-700 space-y-6 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-stone-900">1. Commitment to Reader Privacy</h2>
          <p>
            Apex Chronicle respects your privacy. We minimize data collection to what is strictly necessary to deliver high-quality editorial content, maintain security, and administer optional newsletter subscriptions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-stone-900">2. Information We Collect</h2>
          <p>We collect information in the following limited circumstances:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
            <li><strong>Newsletter Subscriptions:</strong> Your email address and optional name provided upon voluntarily subscribing to our briefs.</li>
            <li><strong>Contact Submissions:</strong> Information provided when submitting an inquiry or story tip.</li>
            <li><strong>Technical Telemetry:</strong> Standard web server access logs (IP address, browser user-agent, timestamp) stored temporarily for rate limiting and DDoS prevention.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-stone-900">3. Cookies &amp; Local Storage</h2>
          <p>
            We do not use intrusive cross-site tracking cookies. We utilize essential session tokens strictly for authenticating credentialed editorial personnel entering the protected administrative console.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-stone-900">4. Third-Party Disclosures</h2>
          <p>
            We do not sell, rent, or trade reader personal data to third-party data brokers under any condition. Information is only disclosed if required by compulsory legal subpoena or court order.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-stone-900">5. Data Retention &amp; Rights</h2>
          <p>
            Subscribers can unsubscribe from dispatches at any time using the one-click unsubscribe link or by contacting privacy@apexchronicle.com.
          </p>
        </section>
      </div>
    </div>
  );
};
