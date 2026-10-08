import React, { useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';
import { ShieldCheck, Target, Award, Users } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    updatePageSeo({
      title: 'About Our Publication – Apex Chronicle',
      description: 'Our journalistic mission, code of ethics, standards of verification, and editorial background.',
      ogType: 'website'
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
      <Breadcrumb items={[{ label: 'About' }]} onNavigate={onNavigate} className="mb-6" />

      <header className="pb-8 border-b border-stone-200 mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-stone-500 block mb-2">
          Editorial Charter
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
          Independence, Precision, and In-Depth Inquiry
        </h1>
        <p className="font-serif text-lg text-stone-600 leading-relaxed italic">
          Apex Chronicle is an independent digital news and analysis publication committed to investigative depth across engineering, macroeconomics, and global policy.
        </p>
      </header>

      <div className="prose prose-stone font-editorial text-base sm:text-lg leading-relaxed text-stone-800 space-y-8">
        <section className="space-y-4">
          <h2 className="font-editorial text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-stone-700" />
            <span>Our Founding Philosophy</span>
          </h2>
          <p>
            In an era of relentless algorithmic churn and sensationalized commentary, deep technical insight is frequently lost. We founded Apex Chronicle on a singular premise: complex subjects—from semiconductor lithography to sovereign capital reallocations—deserve rigorous, contextual reporting written with clarity and intellectual respect for the reader.
          </p>
          <p>
            Our journalists combine traditional shoe-leather reporting with deep domain knowledge. We review primary source filings, interrogate technical data, and interview practitioners on the ground.
          </p>
        </section>

        <section className="space-y-4 border-t border-stone-200 pt-8">
          <h2 className="font-editorial text-2xl font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-stone-700" />
            <span>Editorial Standards &amp; Independence</span>
          </h2>
          <p>
            Our editorial integrity is sovereign. All editorial decisions, story selections, and investigative conclusions are made solely by our editorial board without commercial interference:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-stone-700 font-sans text-sm sm:text-base">
            <li><strong>Zero Sponsored Influence:</strong> Commercial sponsors have no preview rights, influence, or veto power over any reporting.</li>
            <li><strong>Transparent Sources:</strong> We prioritize named sources and verifiable documentation. Anonymous sourcing requires multi-editor corroboration.</li>
            <li><strong>Prompt Corrections:</strong> When errors occur, we correct them swiftly and transparently at the top of the relevant article.</li>
          </ul>
        </section>

        <section className="space-y-4 border-t border-stone-200 pt-8">
          <h2 className="font-editorial text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-700" />
            <span>Editorial Desks</span>
          </h2>
          <p>
            Our correspondents operate across five dedicated editorial desks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-6">
            <div className="p-4 border border-stone-200 bg-stone-50 rounded">
              <h3 className="font-editorial font-bold text-stone-900 text-base">Technology &amp; Infrastructure</h3>
              <p className="text-xs text-stone-600 mt-1">Foundry semiconductors, space systems, networking protocols, and enterprise software architectures.</p>
            </div>
            <div className="p-4 border border-stone-200 bg-stone-50 rounded">
              <h3 className="font-editorial font-bold text-stone-900 text-base">Business &amp; Macro Markets</h3>
              <p className="text-xs text-stone-600 mt-1">Sovereign wealth funds, supply chain logistics, private capital flows, and trade balances.</p>
            </div>
            <div className="p-4 border border-stone-200 bg-stone-50 rounded">
              <h3 className="font-editorial font-bold text-stone-900 text-base">Science &amp; Clean Energy</h3>
              <p className="text-xs text-stone-600 mt-1">Long-duration grid storage, chemical breakthroughs, orbital astronomy, and ecological resilience.</p>
            </div>
            <div className="p-4 border border-stone-200 bg-stone-50 rounded">
              <h3 className="font-editorial font-bold text-stone-900 text-base">Policy &amp; Global Governance</h3>
              <p className="text-xs text-stone-600 mt-1">International trade agreements, regulatory statutes, and the diplomatic architecture of global technology.</p>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 pt-8 text-sm font-sans text-stone-600">
          <p>
            For tips, confidential leak drops, or general correspondence, reach out to our team at{' '}
            <a href="/contact" className="text-stone-900 font-semibold underline underline-offset-4 hover:text-stone-700">
              our Contact page
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};
