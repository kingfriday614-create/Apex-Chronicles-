import React, { useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    updatePageSeo({
      title: 'Terms of Service – Apex Chronicle',
      description: 'Terms and conditions governing reader access, intellectual property, syndication, and service usage at Apex Chronicle.',
      ogType: 'website'
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
      <Breadcrumb items={[{ label: 'Terms of Service' }]} onNavigate={onNavigate} className="mb-6" />

      <header className="pb-8 border-b border-stone-200 mb-10">
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-stone-500">
          Last revised: October 6, 2026 · Effective immediately
        </p>
      </header>

      <div className="font-sans text-sm sm:text-base text-stone-700 space-y-6 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-stone-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or reading content on Apex Chronicle, you agree to comply with and be bound by these Terms of Service. If you disagree with any portion of these terms, you should cease access to the publication.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-stone-900">2. Intellectual Property Rights</h2>
          <p>
            All original investigative reports, essays, photographs, graphic visualizations, charts, and proprietary materials published on Apex Chronicle are protected by copyright, trademark, and intellectual property statutes.
          </p>
          <p>
            You may quote brief excerpts (under 150 words) with clear editorial attribution and a hyperlink back to the original article on Apex Chronicle. Full unauthorized republication or scraping without written syndication agreements is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-stone-900">3. Disclaimer of Warranties</h2>
          <p>
            While our correspondents and editors strive for rigorous factual accuracy, all content is provided on an &quot;as is&quot; basis for informative, educational, and journalistic purposes. Content does not constitute individual legal, financial, or engineering advisory services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-stone-900">4. Editorial Inquiries &amp; Licensing</h2>
          <p>
            For commercial licensing, academic course packs, or print syndication rights, please submit requests through our{' '}
            <button
              onClick={() => onNavigate('/contact')}
              className="text-stone-900 font-semibold underline underline-offset-2 hover:text-stone-700 cursor-pointer"
            >
              Contact page
            </button>.
          </p>
        </section>
      </div>
    </div>
  );
};
