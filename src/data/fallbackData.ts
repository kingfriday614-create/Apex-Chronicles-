import { Article, Category, SiteSettings, AdSlot, Tag } from '../types';

export const FALLBACK_SETTINGS: SiteSettings = {
  id: 'default',
  site_name: 'Apex Chronicle',
  site_description: 'An independent digital publication providing in-depth reporting, global technology analysis, and cultural commentary.',
  site_url: 'https://apexchronicle.com',
  default_seo_title: 'Apex Chronicle – Digital News & Editorial Publication',
  default_seo_description: 'In-depth investigations, authoritative technology coverage, economic trends, and cultural essays from award-winning journalists.',
  social_twitter: 'https://x.com/apexchronicle',
  social_linkedin: 'https://linkedin.com/company/apexchronicle',
  social_facebook: 'https://facebook.com/apexchronicle',
  footer_copyright: '© 2026 Apex Chronicle Media Group. All rights reserved.',
  contact_email: 'editorial@apexchronicle.com'
};

export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'cat_technology',
    name: 'Technology',
    slug: 'technology',
    description: 'Semiconductors, software architecture, space flight, and hardware engineering.',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    sort_order: 1,
    article_count: 1
  },
  {
    id: 'cat_business',
    name: 'Business & Markets',
    slug: 'business',
    description: 'Venture capital, macroeconomics, emerging industries, and corporate strategy.',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    sort_order: 2,
    article_count: 1
  },
  {
    id: 'cat_science',
    name: 'Science & Environment',
    slug: 'science',
    description: 'Renewable energy frontiers, quantum discoveries, and ecological stewardship.',
    image_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    sort_order: 3,
    article_count: 1
  },
  {
    id: 'cat_culture',
    name: 'Culture & Ideas',
    slug: 'culture',
    description: 'Architectural essays, urban design, literary critique, and digital sociology.',
    image_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    sort_order: 4,
    article_count: 1
  },
  {
    id: 'cat_policy',
    name: 'Policy & Global Affairs',
    slug: 'policy',
    description: 'Geopolitical diplomacy, international trade accords, and digital governance.',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    sort_order: 5,
    article_count: 0
  }
];

export const FALLBACK_TAGS: Tag[] = [
  { id: 'tag_semiconductors', name: 'Semiconductors', slug: 'semiconductors', article_count: 1 },
  { id: 'tag_clean_energy', name: 'Clean Energy', slug: 'clean-energy', article_count: 1 },
  { id: 'tag_investing', name: 'Investing', slug: 'investing', article_count: 1 },
  { id: 'tag_urbanism', name: 'Urbanism', slug: 'urbanism', article_count: 1 },
  { id: 'tag_deep_tech', name: 'Deep Tech', slug: 'deep-tech', article_count: 2 },
  { id: 'tag_global_trade', name: 'Global Trade', slug: 'global-trade', article_count: 1 }
];

export const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'art_01',
    title: 'The Silicon Renaissance: How Next-Gen Lithography Is Redefining Global Foundry Dominance',
    slug: 'the-silicon-renaissance-next-gen-lithography',
    excerpt: 'Sub-nanometer precision and high-NA ultraviolet optics are transforming wafer yields, sparking a billion-dollar race among semiconductor titans across Europe, Asia, and North America.',
    content: `<h2>The Physics Behind High-NA Extreme Ultraviolet</h2>
<p>In modern chip fabrication, physics meets manufacturing at tolerances measured in angstroms. Over the past five years, semiconductor fabrication facilities have confronted the physical limits of traditional extreme ultraviolet (EUV) light. The introduction of high numerical aperture systems changes the calculus fundamentally, permitting circuit density gains previously thought unattainable without multi-patterning overhead.</p>

<blockquote>"We are no longer just printing circuits; we are orchestrating atomic lattices with optical precision once reserved for orbital telescopes."</blockquote>

<h3>Supply Chains and Geopolitical Resilience</h3>
<p>Foundry operators in Taiwan, Germany, Arizona, and Japan are investing tens of billions to accommodate these colossal machines. Each system weighs over 150 metric tons and requires bespoke cleanrooms with active seismic dampening. The capital commitment underscores how national sovereignty is now intrinsically tied to nanoscale manufacturing capacity.</p>

<p>For industrial design teams, the immediate upside is measurable: thermal dissipation profiles drop by up to 28% while compute throughput per square millimeter advances significantly. As enterprise applications shift toward local edge processing, these chips form the foundation of next-decade infrastructure.</p>

<h3>Key Takeaways for Hardware Architects</h3>
<ul>
  <li>Transistor density gains reach double digits without requiring quadrupled mask iterations.</li>
  <li>Operational power requirements at foundry scale demand dedicated renewable substation feeds.</li>
  <li>Packaging innovation—including silicon photonics interconnects—will determine real-world bandwidth.</li>
</ul>

<p>The road ahead is demanding, but the manufacturing results recorded in early trial runs confirm that Moore's Law continues to adapt, driven by engineering ingenuity.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    featured_image_alt: 'High-tech silicon wafer circuit board under cleanroom lighting',
    image_caption: 'High-precision wafer inspection inside an advanced fabrication research lab.',
    author_id: 'author_elena_vance',
    author_name: 'Dr. Elena Vance',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    author_role: 'Senior Technology Editor',
    category_id: 'cat_technology',
    category_name: 'Technology',
    category_slug: 'technology',
    status: 'published',
    is_featured: 1,
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    views_count: 1420,
    tags: [
      { id: 'tag_semiconductors', name: 'Semiconductors', slug: 'semiconductors' },
      { id: 'tag_deep_tech', name: 'Deep Tech', slug: 'deep-tech' }
    ],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'art_02',
    title: 'Grid Architecture for the 2030s: Storing Terawatts in Solid-State Gravity and Iron Flow',
    slug: 'grid-architecture-2030s-energy-storage',
    excerpt: 'As wind and solar generation reach historic milestones, electrical grids require multi-day storage systems. How iron-air chemistry and mechanical reservoirs are closing the intermittency gap.',
    content: `<h2>Beyond Lithium: The Quest for Long-Duration Storage</h2>
<p>Lithium-ion batteries excel at frequency regulation and short four-hour dispatch windows. However, when regional atmospheric systems produce consecutive days of calm winds and heavy cloud cover, utilities require storage mechanisms capable of discharging steady power across 72 to 100 continuous hours.</p>

<p>Enter iron-air and sodium battery systems. Operating on abundant, low-cost domestic minerals, iron-air systems use a reversible rusting cycle: breathing in oxygen to discharge electricity, and expelling it during charging. While their spatial footprint is larger than lithium, grid-scale substations prioritize low cost per kilowatt-hour over compact volume.</p>

<h3>Mechanical Gravity and Thermal Storage</h3>
<p>Simultaneously, mechanical gravity storage installations—utilizing deep mine shafts and heavy composite blocks—offer zero degradation over thirty-year operational lifespans. Unlike chemical cells, mechanical kinetic systems do not suffer from thermal runaway risks and maintain 85% round-trip efficiency across decades.</p>

<p>Forward-thinking utility operators across the Midwest and Southern Europe are constructing pilot installations that pair 500-megawatt solar farms directly with dual-tier storage hubs.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
    featured_image_alt: 'Wind turbines against a twilight sky above rolling hills',
    image_caption: 'Renewable energy farm connected to high-voltage long-duration storage grids.',
    author_id: 'author_marcus_reid',
    author_name: 'Marcus Reid',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    author_role: 'Chief Economics Correspondent',
    category_id: 'cat_science',
    category_name: 'Science & Environment',
    category_slug: 'science',
    status: 'published',
    is_featured: 0,
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    views_count: 890,
    tags: [
      { id: 'tag_clean_energy', name: 'Clean Energy', slug: 'clean-energy' },
      { id: 'tag_deep_tech', name: 'Deep Tech', slug: 'deep-tech' }
    ],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'art_03',
    title: 'The Sovereign Wealth Realignment: Where Capital Is Flowing in an Age of Nearshoring',
    slug: 'sovereign-wealth-realignment-nearshoring-capital',
    excerpt: 'Global institutional funds are shifting trillions from speculative financial instruments into tangible port infrastructure, cold-chain transport corridors, and regional manufacturing clusters.',
    content: `<h2>The Repatriation of Critical Logistics</h2>
<p>Over three decades of hyper-globalization created single points of failure in pharmaceutical precursors, precision tooling, and cargo container throughput. Recent geopolitical reassessments have prompted institutional asset managers and pension funds to re-examine resilience over pure marginal cost reduction.</p>

<p>Capital commitments to inland dry ports, automated transshipment hubs, and localized automated assembly centers have outpaced traditional commercial real estate by nearly three to one over the past fiscal year.</p>

<blockquote>"True financial durability is no longer measured in arbitrage speed, but in the physical continuity of goods moving through resilient borders."</blockquote>

<h3>Emerging Regional Corridors</h3>
<p>Key transit corridors throughout the Americas and Southeast Asia are seeing double-digit capital expenditure growth. Private-public partnerships are standardizing rail electrification and digital customs clearing to reduce cross-border cycle times from days to hours.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    featured_image_alt: 'Modern glass corporate towers reflecting sunset clouds',
    image_caption: 'Financial district headquarters spearheading international infrastructure allocations.',
    author_id: 'author_marcus_reid',
    author_name: 'Marcus Reid',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    author_role: 'Chief Economics Correspondent',
    category_id: 'cat_business',
    category_name: 'Business & Markets',
    category_slug: 'business',
    status: 'published',
    is_featured: 0,
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    views_count: 1105,
    tags: [
      { id: 'tag_investing', name: 'Investing', slug: 'investing' },
      { id: 'tag_global_trade', name: 'Global Trade', slug: 'global-trade' }
    ],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'art_04',
    title: 'Civic Geometry: How 15-Minute Urban Districts Are Restoring Neighborhood Commerce',
    slug: 'civic-geometry-15-minute-urban-districts',
    excerpt: 'Rethinking arterial transit in favor of human-scale walkable boulevards has triggered an unexpected resurgence in independent bakeries, artisanal bookshops, and community squares.',
    content: `<h2>The Human Scale of Modern Cities</h2>
<p>When city planners prioritize pedestrians, micro-mobility corridors, and mixed-use ground floor zoning over multi-lane automotive thoroughfares, local economies thrive. Recent longitudinal studies across European and Nordic metropolises reveal that neighborhood commercial vitality increases by over 34% when residents can meet daily needs within a ten-to-fifteen-minute stroll.</p>

<p>Rather than bedroom suburbs and segregated commercial downtowns, integrated neighborhoods foster spontaneous social interactions, reduce particulate emissions, and establish sustainable retail foot-traffic.</p>

<h3>Designing for Longevity and Community</h3>
<p>The successful revitalization projects share clear architectural patterns: wide tree-lined sidewalks, flexible parklets, shared bicycle logistics lanes, and adaptive reuse of historic masonry buildings.</p>`,
    featured_image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
    featured_image_alt: 'Pedestrian-friendly city boulevard with trees and storefronts',
    image_caption: 'Walkable civic plaza with active ground-floor retail and bicycle transit lanes.',
    author_id: 'author_elena_vance',
    author_name: 'Dr. Elena Vance',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    author_role: 'Senior Technology Editor',
    category_id: 'cat_culture',
    category_name: 'Culture & Ideas',
    category_slug: 'culture',
    status: 'published',
    is_featured: 0,
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    views_count: 760,
    tags: [
      { id: 'tag_urbanism', name: 'Urbanism', slug: 'urbanism' }
    ],
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const FALLBACK_ADS: AdSlot[] = [
  {
    id: 'ad_homepage_top',
    slot_key: 'homepage_top',
    name: 'Homepage Leaderboard (Top)',
    description: 'Full-width banner directly under main navigation',
    is_enabled: 1,
    label: 'Sponsored',
    display_target: 'all',
    ad_html: `<div class="border border-stone-200 bg-stone-100/70 p-6 text-center rounded">
  <p class="text-xs font-semibold tracking-wider text-stone-500 uppercase">Sponsorship Announcement</p>
  <p class="text-stone-800 font-medium text-sm mt-1">Connect your brand with 250,000+ daily decision-makers and founders.</p>
  <a href="/contact" class="inline-block mt-3 text-xs font-semibold text-stone-900 underline underline-offset-4 hover:text-stone-700">Inquire About Media Kit &rarr;</a>
</div>`
  },
  {
    id: 'ad_sidebar',
    slot_key: 'sidebar',
    name: 'Universal Sidebar Unit',
    description: 'Sticky desktop sidebar box (300x250 or responsive)',
    is_enabled: 1,
    label: 'Sponsored',
    display_target: 'all',
    ad_html: `<div class="border border-stone-200 bg-stone-100/70 p-6 text-center rounded">
  <p class="text-xs font-semibold tracking-wider text-stone-500 uppercase">Sponsorship Announcement</p>
  <p class="text-stone-800 font-medium text-sm mt-1">Apex Chronicle Executive Briefing – Q2 2026 Edition</p>
  <a href="/contact" class="inline-block mt-3 text-xs font-semibold text-stone-900 underline underline-offset-4 hover:text-stone-700">Download Media Kit &rarr;</a>
</div>`
  }
];
