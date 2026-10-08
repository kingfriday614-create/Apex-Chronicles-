import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'apex_chronicle.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance and integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin', -- 'superadmin' | 'admin' | 'editor'
      is_initial_admin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS authors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      bio TEXT,
      avatar_url TEXT,
      role_title TEXT DEFAULT 'Staff Writer',
      twitter TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      featured_image TEXT,
      featured_image_alt TEXT,
      image_caption TEXT,
      author_id TEXT REFERENCES authors(id) ON DELETE SET NULL,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'scheduled' | 'published' | 'archived'
      is_featured INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      scheduled_for TEXT,
      seo_title TEXT,
      seo_description TEXT,
      canonical_url TEXT,
      social_image TEXT,
      views_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS article_tags (
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      url TEXT NOT NULL,
      alt_text TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      site_name TEXT NOT NULL,
      site_description TEXT NOT NULL,
      logo_url TEXT,
      favicon_url TEXT,
      site_url TEXT NOT NULL,
      default_seo_title TEXT,
      default_seo_description TEXT,
      social_facebook TEXT,
      social_twitter TEXT,
      social_instagram TEXT,
      social_linkedin TEXT,
      social_youtube TEXT,
      default_share_image TEXT,
      footer_copyright TEXT,
      contact_email TEXT,
      analytics_id TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS advertisement_slots (
      id TEXT PRIMARY KEY,
      slot_key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_enabled INTEGER NOT NULL DEFAULT 1,
      ad_html TEXT,
      label TEXT DEFAULT 'Advertisement',
      display_target TEXT NOT NULL DEFAULT 'all', -- 'all' | 'desktop' | 'mobile'
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at);
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
  `);

  seedInitialData();
}

function seedInitialData() {
  // 1. Ensure Initial Administrator exists
  const initialAdminEmail = 'myall5148@gmail.com';
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(initialAdminEmail) as any;
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, is_initial_admin, created_at, updated_at)
      VALUES (?, ?, NULL, ?, 'superadmin', 1, datetime('now'), datetime('now'))
    `).run('usr_superadmin_01', initialAdminEmail, 'Primary Administrator');
    console.log(`[Database] Initial administrator registered: ${initialAdminEmail} (Setup required on first login)`);
  }

  // 2. Default Site Settings
  const existingSettings = db.prepare("SELECT id FROM site_settings WHERE id = 'default'").get() as any;
  if (!existingSettings) {
    db.prepare(`
      INSERT INTO site_settings (
        id, site_name, site_description, site_url,
        default_seo_title, default_seo_description,
        social_twitter, social_linkedin, social_facebook,
        footer_copyright, contact_email
      ) VALUES (
        'default',
        'Apex Chronicle',
        'An independent digital publication providing in-depth reporting, global technology analysis, and cultural commentary.',
        'https://apexchronicle.com',
        'Apex Chronicle – Insightful Journalism & Global Analysis',
        'In-depth investigations, authoritative technology coverage, economic trends, and cultural essays from award-winning journalists.',
        'https://x.com/apexchronicle',
        'https://linkedin.com/company/apexchronicle',
        'https://facebook.com/apexchronicle',
        '© 2026 Apex Chronicle Media Group. All rights reserved.',
        'editorial@apexchronicle.com'
      )
    `).run();
  }

  // 3. Default Advertisement Slots
  const defaultAdSlots = [
    { key: 'homepage_top', name: 'Homepage Leaderboard (Top)', desc: 'Full-width banner directly under main navigation' },
    { key: 'homepage_middle', name: 'Homepage Mid-Feed', desc: 'Embedded between featured stories and category grids' },
    { key: 'homepage_bottom', name: 'Homepage Bottom Banner', desc: 'Pre-footer sponsor placement' },
    { key: 'article_top', name: 'Article Header Banner', desc: 'Positioned above article headline' },
    { key: 'article_middle', name: 'In-Article Inline Placement', desc: 'Embedded mid-way through article narrative' },
    { key: 'article_bottom', name: 'Article Post-Body Banner', desc: 'Directly below comments/author bio' },
    { key: 'sidebar', name: 'Universal Sidebar Unit', desc: 'Sticky desktop sidebar box (300x250 or responsive)' },
    { key: 'category_page', name: 'Category Header Banner', desc: 'Displayed on archive and topic pages' },
    { key: 'search_page', name: 'Search Results Banner', desc: 'Displayed alongside query results' }
  ];

  const checkAd = db.prepare('SELECT id FROM advertisement_slots WHERE slot_key = ?');
  const insertAd = db.prepare(`
    INSERT INTO advertisement_slots (id, slot_key, name, description, is_enabled, ad_html, label, display_target)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ad of defaultAdSlots) {
    if (!checkAd.get(ad.key)) {
      const placeholderHtml = `<!-- Partner Showcase Banner -->
<div class="border border-stone-200 bg-stone-100/70 p-6 text-center rounded">
  <p class="text-xs font-semibold tracking-wider text-stone-500 uppercase">Sponsorship Announcement</p>
  <p class="text-stone-800 font-medium text-sm mt-1">Connect your brand with 250,000+ daily decision-makers and founders.</p>
  <a href="/contact" class="inline-block mt-3 text-xs font-semibold text-stone-900 underline underline-offset-4 hover:text-stone-700">Inquire About Media Kit &rarr;</a>
</div>`;
      insertAd.run(`ad_${ad.key}`, ad.key, ad.name, ad.desc, 1, placeholderHtml, 'Sponsored', 'all');
    }
  }

  // 4. Default Author
  const existingAuthor = db.prepare('SELECT id FROM authors WHERE id = ?').get('author_elena_vance') as any;
  if (!existingAuthor) {
    db.prepare(`
      INSERT INTO authors (id, name, email, bio, avatar_url, role_title, twitter)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'author_elena_vance',
      'Dr. Elena Vance',
      'e.vance@apexchronicle.com',
      'Senior Technology Editor at Apex Chronicle. Covering advanced computing, semiconductors, and the global infrastructure of data.',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'Senior Technology Editor',
      'elenavance_tech'
    );
  }

  const existingAuthor2 = db.prepare('SELECT id FROM authors WHERE id = ?').get('author_marcus_reid') as any;
  if (!existingAuthor2) {
    db.prepare(`
      INSERT INTO authors (id, name, email, bio, avatar_url, role_title, twitter)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'author_marcus_reid',
      'Marcus Reid',
      'm.reid@apexchronicle.com',
      'Global economics reporter and former Wall Street researcher. Writes on monetary policy, supply chain logistics, and sovereign wealth.',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      'Chief Economics Correspondent',
      'marcusreid_econ'
    );
  }

  // 5. Default Categories
  const initialCategories = [
    { id: 'cat_technology', name: 'Technology', slug: 'technology', desc: 'Semiconductors, software architecture, space flight, and hardware engineering.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', order: 1 },
    { id: 'cat_business', name: 'Business & Markets', slug: 'business', desc: 'Venture capital, macroeconomics, emerging industries, and corporate strategy.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', order: 2 },
    { id: 'cat_science', name: 'Science & Environment', slug: 'science', desc: 'Renewable energy frontiers, quantum discoveries, and ecological stewardship.', img: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80', order: 3 },
    { id: 'cat_culture', name: 'Culture & Ideas', slug: 'culture', desc: 'Architectural essays, urban design, literary critique, and digital sociology.', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80', order: 4 },
    { id: 'cat_policy', name: 'Policy & Global Affairs', slug: 'policy', desc: 'Geopolitical diplomacy, international trade accords, and digital governance.', img: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80', order: 5 }
  ];

  const checkCat = db.prepare('SELECT id FROM categories WHERE slug = ?');
  const insertCat = db.prepare(`
    INSERT INTO categories (id, name, slug, description, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const cat of initialCategories) {
    if (!checkCat.get(cat.slug)) {
      insertCat.run(cat.id, cat.name, cat.slug, cat.desc, cat.img, cat.order);
    }
  }

  // 6. Default Tags
  const initialTags = [
    { id: 'tag_semiconductors', name: 'Semiconductors', slug: 'semiconductors' },
    { id: 'tag_clean_energy', name: 'Clean Energy', slug: 'clean-energy' },
    { id: 'tag_investing', name: 'Investing', slug: 'investing' },
    { id: 'tag_urbanism', name: 'Urbanism', slug: 'urbanism' },
    { id: 'tag_deep_tech', name: 'Deep Tech', slug: 'deep-tech' },
    { id: 'tag_global_trade', name: 'Global Trade', slug: 'global-trade' }
  ];

  const checkTag = db.prepare('SELECT id FROM tags WHERE slug = ?');
  const insertTag = db.prepare('INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)');
  for (const tag of initialTags) {
    if (!checkTag.get(tag.slug)) {
      insertTag.run(tag.id, tag.name, tag.slug);
    }
  }

  // 7. Clearly labeled sample articles
  const countArticles = db.prepare('SELECT COUNT(*) as cnt FROM articles').get() as { cnt: number };
  if (countArticles.cnt === 0) {
    const sampleArticles = [
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
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        alt: 'High-tech silicon wafer circuit board under cleanroom lighting',
        caption: 'High-precision wafer inspection inside an advanced fabrication research lab.',
        author_id: 'author_elena_vance',
        category_id: 'cat_technology',
        is_featured: 1,
        tags: ['tag_semiconductors', 'tag_deep_tech']
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
        image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
        alt: 'Wind turbines against a twilight sky above rolling hills',
        caption: 'Renewable energy farm connected to high-voltage long-duration storage grids.',
        author_id: 'author_marcus_reid',
        category_id: 'cat_science',
        is_featured: 0,
        tags: ['tag_clean_energy', 'tag_deep_tech']
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
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        alt: 'Modern glass corporate towers reflecting sunset clouds',
        caption: 'Financial district headquarters spearheading international infrastructure allocations.',
        author_id: 'author_marcus_reid',
        category_id: 'cat_business',
        is_featured: 0,
        tags: ['tag_investing', 'tag_global_trade']
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
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
        alt: 'Pedestrian-friendly city boulevard with trees and storefronts',
        caption: 'Walkable civic plaza with active ground-floor retail and bicycle transit lanes.',
        author_id: 'author_elena_vance',
        category_id: 'cat_culture',
        is_featured: 0,
        tags: ['tag_urbanism']
      }
    ];

    const insertArticle = db.prepare(`
      INSERT INTO articles (
        id, title, slug, excerpt, content, featured_image, featured_image_alt, image_caption,
        author_id, category_id, status, is_featured, published_at, seo_title, seo_description, views_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, datetime('now', '-2 days'), ?, ?, ?)
    `);

    const insertArtTag = db.prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)');

    sampleArticles.forEach((art, idx) => {
      insertArticle.run(
        art.id,
        art.title,
        art.slug,
        art.excerpt,
        art.content,
        art.image,
        art.alt,
        art.caption,
        art.author_id,
        art.category_id,
        art.is_featured,
        `${art.title} | Apex Chronicle`,
        art.excerpt,
        140 + idx * 85
      );

      for (const t of art.tags) {
        insertArtTag.run(art.id, t);
      }
    });

    console.log('[Database] Seeded 4 sample editorial articles (manageable & deletable via admin panel).');
  }
}
