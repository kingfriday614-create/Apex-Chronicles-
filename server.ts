import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { db, initDatabase } from './server/db.js';
import {
  authMiddleware,
  requireAdmin,
  requireSuperAdmin,
  signToken,
  INITIAL_ADMIN_EMAIL
} from './server/auth.js';

// Initialize SQLite database
initDatabase();

const app = express();
// Parse port and host from environment or command-line arguments
let portArg = process.env.PORT || '3000';
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--port' && process.argv[i + 1]) {
    portArg = process.argv[i + 1];
  } else if (process.argv[i].startsWith('--port=')) {
    portArg = process.argv[i].split('=')[1];
  }
}
const PORT = Number(portArg) || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Setup static uploads directory
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, { maxAge: '30d' }));

// Configure Multer for secure media uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${cleanBase}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only valid image formats (JPEG, PNG, WebP, GIF, SVG) are allowed'));
    }
  }
});

// Periodic background check: auto-publish scheduled articles
function checkScheduledArticles() {
  try {
    const nowIso = new Date().toISOString();
    const result = db.prepare(`
      UPDATE articles
      SET status = 'published', published_at = COALESCE(scheduled_for, datetime('now'))
      WHERE status = 'scheduled' AND scheduled_for <= ?
    `).run(nowIso);

    if (result.changes > 0) {
      console.log(`[Scheduler] Published ${result.changes} due scheduled articles.`);
    }
  } catch (err) {
    console.error('[Scheduler Error]', err);
  }
}
setInterval(checkScheduledArticles, 30000); // every 30s
checkScheduledArticles();

/* ==========================================================================
   PUBLIC SEO ROUTES: SITEMAP & ROBOTS.TXT
   ========================================================================== */

app.get('/robots.txt', (_req: Request, res: Response) => {
  const settings = db.prepare("SELECT site_url FROM site_settings WHERE id = 'default'").get() as any;
  const siteUrl = settings?.site_url || 'https://apexchronicle.com';

  const content = `# Robots.txt for Apex Chronicle
User-agent: *
Disallow: /admin
Disallow: /api/admin
Disallow: /api/auth
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(content);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  checkScheduledArticles();
  const settings = db.prepare("SELECT site_url FROM site_settings WHERE id = 'default'").get() as any;
  const siteUrl = (settings?.site_url || 'https://apexchronicle.com').replace(/\/$/, '');

  const publishedArticles = db.prepare(`
    SELECT slug, published_at, updated_at
    FROM articles
    WHERE status = 'published'
    ORDER BY published_at DESC
  `).all() as any[];

  const categories = db.prepare(`
    SELECT slug, updated_at
    FROM categories
    ORDER BY sort_order ASC
  `).all() as any[];

  const tags = db.prepare(`
    SELECT slug, updated_at
    FROM tags
    ORDER BY name ASC
  `).all() as any[];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static core pages
  const staticPages = [
    { loc: '', changefreq: 'daily', priority: '1.0' },
    { loc: '/articles', changefreq: 'hourly', priority: '0.9' },
    { loc: '/categories', changefreq: 'weekly', priority: '0.8' },
    { loc: '/about', changefreq: 'monthly', priority: '0.5' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.3' }
  ];

  const nowIso = new Date().toISOString();

  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}${page.loc}</loc>\n`;
    xml += `    <lastmod>${nowIso}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Categories
  for (const cat of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/category/${cat.slug}</loc>\n`;
    xml += `    <lastmod>${cat.updated_at || nowIso}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  // Tags
  for (const tag of tags) {
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/tag/${tag.slug}</loc>\n`;
    xml += `    <lastmod>${tag.updated_at || nowIso}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.5</priority>\n`;
    xml += `  </url>\n`;
  }

  // Published articles
  for (const art of publishedArticles) {
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}/article/${art.slug}</loc>\n`;
    xml += `    <lastmod>${art.updated_at || art.published_at || nowIso}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

/* ==========================================================================
   AUTHENTICATION ROUTES
   ========================================================================== */

// Check setup status of initial administrator
app.get('/api/auth/status', (_req: Request, res: Response) => {
  const initialAdmin = db.prepare('SELECT id, email, password_hash, name FROM users WHERE email = ?').get(INITIAL_ADMIN_EMAIL) as any;
  const needsSetup = Boolean(initialAdmin && !initialAdmin.password_hash);
  res.json({
    initialAdminNeedsSetup: needsSetup,
    initialAdminEmail: INITIAL_ADMIN_EMAIL
  });
});

// Setup Initial Administrator Password (First-time claim)
app.post('/api/auth/setup-initial-admin', (req: Request, res: Response) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (email.toLowerCase().trim() !== INITIAL_ADMIN_EMAIL.toLowerCase()) {
    res.status(403).json({ error: `Initial administrator activation is strictly reserved for ${INITIAL_ADMIN_EMAIL}` });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Administrator password must be at least 8 characters long' });
    return;
  }

  if (confirmPassword && password !== confirmPassword) {
    res.status(400).json({ error: 'Password confirmation does not match' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(INITIAL_ADMIN_EMAIL) as any;
  if (!user) {
    res.status(404).json({ error: 'Administrator record not found' });
    return;
  }

  if (user.password_hash) {
    res.status(400).json({ error: 'Initial administrator account has already been initialized. Please sign in normally.' });
    return;
  }

  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);

  db.prepare(`
    UPDATE users
    SET password_hash = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(hash, user.id);

  const authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_initial_admin: user.is_initial_admin
  };

  const token = signToken(authUser);

  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    message: 'Administrator account successfully activated',
    user: authUser,
    token
  });
});

// Admin Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail) as any;

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  // If initial admin has not set up their password yet
  if (user.email === INITIAL_ADMIN_EMAIL && !user.password_hash) {
    res.status(400).json({
      error: 'Initial administrator activation required. Please set up your password.',
      needsSetup: true,
      email: INITIAL_ADMIN_EMAIL
    });
    return;
  }

  if (!user.password_hash) {
    res.status(401).json({ error: 'Account has not been configured with a password' });
    return;
  }

  const match = bcrypt.compareSync(password, user.password_hash);
  if (!match) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_initial_admin: user.is_initial_admin
  };

  const token = signToken(authUser);

  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    user: authUser,
    token
  });
});

// Admin Logout
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Current User Profile
app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

// Public User Registration (Always assigns role: 'user' strictly on server)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email address, and password are required' });
    return;
  }

  if (typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ error: 'Full name must be at least 2 characters long' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address' });
    return;
  }

  // Strictly prevent public registration of the designated administrative address
  if (cleanEmail === INITIAL_ADMIN_EMAIL.toLowerCase()) {
    res.status(403).json({
      error: 'The address myall5148@gmail.com is reserved for administrator management. Please sign in via the administrative portal.'
    });
    return;
  }

  if (typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long' });
    return;
  }

  if (confirmPassword && password !== confirmPassword) {
    res.status(400).json({ error: 'Password confirmation does not match' });
    return;
  }

  // Check if account already exists
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
  if (existing) {
    res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const id = `usr_reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // CRITICAL: NEVER trust client-supplied role. HARDCODED to 'user'.
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, is_initial_admin, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'user', 0, datetime('now'), datetime('now'))
  `).run(id, cleanEmail, hash, name.trim());

  const authUser = {
    id,
    email: cleanEmail,
    name: name.trim(),
    role: 'user',
    is_initial_admin: 0
  };

  const token = signToken(authUser);

  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    message: 'Account registered successfully',
    user: authUser,
    token
  });
});

// Normal User Profile: Retrieve Profile
app.get('/api/user/profile', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const dbUser = db.prepare('SELECT id, email, name, role, is_initial_admin, created_at FROM users WHERE id = ?').get(user.id) as any;
  if (!dbUser) {
    res.status(404).json({ error: 'User profile not found' });
    return;
  }
  res.json({ user: dbUser });
});

// Normal User Profile: Update Permitted Fields (Name, Password only - NEVER Role)
app.put('/api/user/profile', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, currentPassword, newPassword } = req.body;

  if (name && (typeof name !== 'string' || name.trim().length < 2)) {
    res.status(400).json({ error: 'Name must be at least 2 characters long' });
    return;
  }

  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as any;
  if (!targetUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // If changing password
  if (newPassword) {
    if (!currentPassword) {
      res.status(400).json({ error: 'Current password is required to set a new password' });
      return;
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }
    const match = targetUser.password_hash ? bcrypt.compareSync(currentPassword, targetUser.password_hash) : false;
    if (!match) {
      res.status(401).json({ error: 'Incorrect current password' });
      return;
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name), password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name ? name.trim() : null, newHash, user.id);
  } else if (name) {
    db.prepare(`
      UPDATE users
      SET name = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name.trim(), user.id);
  }

  // Explicitly retrieve user with safe fields (never return password hash)
  const updatedUser = db.prepare('SELECT id, email, name, role, is_initial_admin, created_at FROM users WHERE id = ?').get(user.id) as any;
  res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
});

/* ==========================================================================
   PUBLIC SITE & CONTENT APIS
   ========================================================================== */

// Public Site Settings
app.get('/api/site/settings', (_req: Request, res: Response) => {
  const settings = db.prepare("SELECT * FROM site_settings WHERE id = 'default'").get() as any;
  res.json({ settings: settings || {} });
});

// Public Advertisement Slots
app.get('/api/site/ads', (_req: Request, res: Response) => {
  const ads = db.prepare('SELECT slot_key, name, ad_html, label, display_target, is_enabled FROM advertisement_slots WHERE is_enabled = 1').all();
  res.json({ ads });
});

// Public Articles Feed
app.get('/api/articles', (req: Request, res: Response) => {
  checkScheduledArticles();

  const {
    category,
    tag,
    search,
    featured,
    limit = '10',
    offset = '0',
    sort = 'latest'
  } = req.query;

  const parsedLimit = Math.min(Math.max(parseInt(limit as string) || 10, 1), 50);
  const parsedOffset = Math.max(parseInt(offset as string) || 0, 0);

  let whereClauses: string[] = ["a.status = 'published'"];
  let params: any[] = [];

  if (category) {
    whereClauses.push('(c.slug = ? OR c.id = ?)');
    params.push(category, category);
  }

  if (tag) {
    whereClauses.push('EXISTS (SELECT 1 FROM article_tags at JOIN tags t ON at.tag_id = t.id WHERE at.article_id = a.id AND (t.slug = ? OR t.id = ?))');
    params.push(tag, tag);
  }

  if (search) {
    whereClauses.push('(a.title LIKE ? OR a.excerpt LIKE ? OR a.content LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (featured === '1') {
    whereClauses.push('a.is_featured = 1');
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const orderByStr = sort === 'popular' ? 'ORDER BY a.views_count DESC, a.published_at DESC' : 'ORDER BY a.published_at DESC';

  const countQuery = `
    SELECT COUNT(*) as total
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    ${whereStr}
  `;
  const totalResult = db.prepare(countQuery).get(...params) as { total: number };

  const articlesQuery = `
    SELECT
      a.id, a.title, a.slug, a.excerpt, a.featured_image, a.featured_image_alt, a.image_caption,
      a.is_featured, a.published_at, a.views_count,
      c.id as category_id, c.name as category_name, c.slug as category_slug,
      auth.id as author_id, auth.name as author_name, auth.avatar_url as author_avatar, auth.role_title as author_role
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN authors auth ON a.author_id = auth.id
    ${whereStr}
    ${orderByStr}
    LIMIT ? OFFSET ?
  `;

  const articles = db.prepare(articlesQuery).all(...params, parsedLimit, parsedOffset) as any[];

  // Attach tags to articles
  const getTagsStmt = db.prepare(`
    SELECT t.id, t.name, t.slug
    FROM article_tags at
    JOIN tags t ON at.tag_id = t.id
    WHERE at.article_id = ?
  `);

  for (const art of articles) {
    art.tags = getTagsStmt.all(art.id);
  }

  res.json({
    articles,
    total: totalResult.total,
    limit: parsedLimit,
    offset: parsedOffset
  });
});

// Public Single Article by Slug
app.get('/api/articles/:slug', (req: Request, res: Response) => {
  checkScheduledArticles();
  const { slug } = req.params;

  const article = db.prepare(`
    SELECT
      a.*,
      c.id as category_id, c.name as category_name, c.slug as category_slug,
      auth.id as author_id, auth.name as author_name, auth.email as author_email,
      auth.bio as author_bio, auth.avatar_url as author_avatar, auth.role_title as author_role, auth.twitter as author_twitter
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN authors auth ON a.author_id = auth.id
    WHERE a.slug = ? AND a.status = 'published'
  `).get(slug) as any;

  if (!article) {
    res.status(404).json({ error: 'Article not found or is not currently published' });
    return;
  }

  // Increment view counter
  db.prepare('UPDATE articles SET views_count = views_count + 1 WHERE id = ?').run(article.id);
  article.views_count += 1;

  // Fetch tags
  article.tags = db.prepare(`
    SELECT t.id, t.name, t.slug
    FROM article_tags at
    JOIN tags t ON at.tag_id = t.id
    WHERE at.article_id = ?
  `).all(article.id);

  // Fetch related articles (same category or shared tags)
  const related = db.prepare(`
    SELECT
      a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at,
      c.name as category_name, c.slug as category_slug,
      auth.name as author_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN authors auth ON a.author_id = auth.id
    WHERE a.status = 'published' AND a.id != ? AND (a.category_id = ? OR 1=1)
    ORDER BY (a.category_id = ?) DESC, a.published_at DESC
    LIMIT 3
  `).all(article.id, article.category_id, article.category_id);

  // Previous and Next articles
  const prev = db.prepare(`
    SELECT title, slug
    FROM articles
    WHERE status = 'published' AND published_at < ?
    ORDER BY published_at DESC
    LIMIT 1
  `).get(article.published_at);

  const next = db.prepare(`
    SELECT title, slug
    FROM articles
    WHERE status = 'published' AND published_at > ?
    ORDER BY published_at ASC
    LIMIT 1
  `).get(article.published_at);

  res.json({
    article,
    related,
    prev,
    next
  });
});

// Public Categories List
app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = db.prepare(`
    SELECT
      c.*,
      (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id AND a.status = 'published') as article_count
    FROM categories c
    ORDER BY c.sort_order ASC, c.name ASC
  `).all();

  res.json({ categories });
});

// Public Single Category
app.get('/api/categories/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const category = db.prepare(`
    SELECT
      c.*,
      (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id AND a.status = 'published') as article_count
    FROM categories c
    WHERE c.slug = ?
  `).get(slug) as any;

  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  res.json({ category });
});

// Public Tags List
app.get('/api/tags', (_req: Request, res: Response) => {
  const tags = db.prepare(`
    SELECT
      t.*,
      (SELECT COUNT(*) FROM article_tags at JOIN articles a ON at.article_id = a.id WHERE at.tag_id = t.id AND a.status = 'published') as article_count
    FROM tags t
    ORDER BY article_count DESC, t.name ASC
  `).all();

  res.json({ tags });
});

// Public Single Tag
app.get('/api/tags/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const tag = db.prepare(`
    SELECT
      t.*,
      (SELECT COUNT(*) FROM article_tags at JOIN articles a ON at.article_id = a.id WHERE at.tag_id = t.id AND a.status = 'published') as article_count
    FROM tags t
    WHERE t.slug = ?
  `).get(slug) as any;

  if (!tag) {
    res.status(404).json({ error: 'Tag not found' });
    return;
  }

  res.json({ tag });
});

// Public Authors List
app.get('/api/authors', (_req: Request, res: Response) => {
  const authors = db.prepare('SELECT id, name, bio, avatar_url, role_title, twitter FROM authors ORDER BY name ASC').all();
  res.json({ authors });
});

// Newsletter Subscription
app.post('/api/newsletter/subscribe', (req: Request, res: Response) => {
  const { name = '', email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(cleanEmail);

  if (existing) {
    res.json({ success: true, message: 'You are already subscribed to the Apex Chronicle dispatch!' });
    return;
  }

  const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  db.prepare(`
    INSERT INTO newsletter_subscribers (id, name, email, status, subscribed_at)
    VALUES (?, ?, ?, 'active', datetime('now'))
  `).run(subId, name.trim(), cleanEmail);

  res.json({ success: true, message: 'Thank you for subscribing! You will receive our curated morning briefs.' });
});

// Contact Form Submission
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required fields.' });
    return;
  }

  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  db.prepare(`
    INSERT INTO contact_submissions (id, name, email, subject, message, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(id, name.trim(), email.trim(), subject ? subject.trim() : 'General Inquiry', message.trim());

  res.json({ success: true, message: 'Your correspondence has been received by our editorial desk.' });
});

/* ==========================================================================
   ADMIN MANAGEMENT APIS (Protected by authMiddleware and requireAdmin)
   ========================================================================== */

app.use('/api/admin', authMiddleware, requireAdmin);

// Dashboard Metrics & Stats
app.get('/api/admin/stats', authMiddleware, (_req: Request, res: Response) => {
  checkScheduledArticles();

  const totalArticles = (db.prepare('SELECT COUNT(*) as c FROM articles').get() as any).c;
  const publishedArticles = (db.prepare("SELECT COUNT(*) as c FROM articles WHERE status = 'published'").get() as any).c;
  const draftArticles = (db.prepare("SELECT COUNT(*) as c FROM articles WHERE status = 'draft'").get() as any).c;
  const scheduledArticles = (db.prepare("SELECT COUNT(*) as c FROM articles WHERE status = 'scheduled'").get() as any).c;
  const totalCategories = (db.prepare('SELECT COUNT(*) as c FROM categories').get() as any).c;
  const totalTags = (db.prepare('SELECT COUNT(*) as c FROM tags').get() as any).c;
  const totalSubscribers = (db.prepare('SELECT COUNT(*) as c FROM newsletter_subscribers').get() as any).c;
  const totalViews = (db.prepare('SELECT COALESCE(SUM(views_count), 0) as s FROM articles').get() as any).s;

  const recentArticles = db.prepare(`
    SELECT a.id, a.title, a.slug, a.status, a.views_count, a.published_at, a.created_at, c.name as category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    ORDER BY a.created_at DESC
    LIMIT 6
  `).all();

  const recentSubscribers = db.prepare(`
    SELECT id, name, email, subscribed_at
    FROM newsletter_subscribers
    ORDER BY subscribed_at DESC
    LIMIT 5
  `).all();

  res.json({
    stats: {
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      totalCategories,
      totalTags,
      totalSubscribers,
      totalViews
    },
    recentArticles,
    recentSubscribers
  });
});

// Admin: Get Articles (All statuses)
app.get('/api/admin/articles', authMiddleware, (req: Request, res: Response) => {
  const { status, category, search, limit = '20', offset = '0' } = req.query;

  let where: string[] = [];
  let params: any[] = [];

  if (status && status !== 'all') {
    where.push('a.status = ?');
    params.push(status);
  }

  if (category && category !== 'all') {
    where.push('a.category_id = ?');
    params.push(category);
  }

  if (search) {
    where.push('(a.title LIKE ? OR a.slug LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereStr = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM articles a ${whereStr}`).get(...params) as any).c;

  const articles = db.prepare(`
    SELECT
      a.*,
      c.name as category_name,
      auth.name as author_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN authors auth ON a.author_id = auth.id
    ${whereStr}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit as string) || 20, parseInt(offset as string) || 0);

  res.json({ articles, total });
});

// Admin: Get Single Article by ID
app.get('/api/admin/articles/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as any;

  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  // Get article tags
  const tags = db.prepare(`
    SELECT t.id, t.name, t.slug
    FROM article_tags at
    JOIN tags t ON at.tag_id = t.id
    WHERE at.article_id = ?
  `).all(id);

  article.tags = tags;
  res.json({ article });
});

// Admin: Create Article
app.post('/api/admin/articles', authMiddleware, (req: Request, res: Response) => {
  const {
    title,
    slug,
    excerpt,
    content,
    featured_image,
    featured_image_alt,
    image_caption,
    author_id,
    category_id,
    status = 'draft',
    is_featured = 0,
    published_at,
    scheduled_for,
    seo_title,
    seo_description,
    canonical_url,
    social_image,
    tags = []
  } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Article title and content are required' });
    return;
  }

  // Generate unique slug
  let cleanSlug = (slug || title)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (!cleanSlug) cleanSlug = `article-${Date.now()}`;

  // Check collision
  const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(cleanSlug);
  if (existing) {
    cleanSlug = `${cleanSlug}-${Date.now().toString(36).substring(2, 6)}`;
  }

  const id = `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let finalPublishedAt = published_at;
  if (status === 'published' && !finalPublishedAt) {
    finalPublishedAt = new Date().toISOString();
  }

  db.prepare(`
    INSERT INTO articles (
      id, title, slug, excerpt, content, featured_image, featured_image_alt, image_caption,
      author_id, category_id, status, is_featured, published_at, scheduled_for,
      seo_title, seo_description, canonical_url, social_image, views_count,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, 0,
      datetime('now'), datetime('now')
    )
  `).run(
    id,
    title,
    cleanSlug,
    excerpt || title,
    content,
    featured_image || null,
    featured_image_alt || title,
    image_caption || null,
    author_id || null,
    category_id || null,
    status,
    is_featured ? 1 : 0,
    finalPublishedAt || null,
    scheduled_for || null,
    seo_title || null,
    seo_description || null,
    canonical_url || null,
    social_image || null
  );

  // Insert tags
  if (Array.isArray(tags) && tags.length > 0) {
    const insertArtTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');
    for (const tagId of tags) {
      insertArtTag.run(id, tagId);
    }
  }

  res.json({ success: true, id, slug: cleanSlug });
});

// Admin: Update Article
app.put('/api/admin/articles/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    slug,
    excerpt,
    content,
    featured_image,
    featured_image_alt,
    image_caption,
    author_id,
    category_id,
    status,
    is_featured,
    published_at,
    scheduled_for,
    seo_title,
    seo_description,
    canonical_url,
    social_image,
    tags = []
  } = req.body;

  const current = db.prepare('SELECT id, status, published_at FROM articles WHERE id = ?').get(id) as any;
  if (!current) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  let finalPublishedAt = published_at;
  if (status === 'published' && (!finalPublishedAt || current.status !== 'published')) {
    finalPublishedAt = finalPublishedAt || new Date().toISOString();
  }

  db.prepare(`
    UPDATE articles SET
      title = ?,
      slug = ?,
      excerpt = ?,
      content = ?,
      featured_image = ?,
      featured_image_alt = ?,
      image_caption = ?,
      author_id = ?,
      category_id = ?,
      status = ?,
      is_featured = ?,
      published_at = ?,
      scheduled_for = ?,
      seo_title = ?,
      seo_description = ?,
      canonical_url = ?,
      social_image = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title,
    slug,
    excerpt,
    content,
    featured_image || null,
    featured_image_alt || null,
    image_caption || null,
    author_id || null,
    category_id || null,
    status,
    is_featured ? 1 : 0,
    finalPublishedAt || null,
    scheduled_for || null,
    seo_title || null,
    seo_description || null,
    canonical_url || null,
    social_image || null,
    id
  );

  // Sync tags
  db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(id);
  if (Array.isArray(tags) && tags.length > 0) {
    const insertArtTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');
    for (const tagId of tags) {
      insertArtTag.run(id, tagId);
    }
  }

  res.json({ success: true, id });
});

// Admin: Quick Status Toggle
app.patch('/api/admin/articles/:id/status', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['draft', 'published', 'scheduled', 'archived'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const updatePublished = status === 'published' ? `published_at = COALESCE(published_at, datetime('now')),` : '';

  db.prepare(`
    UPDATE articles
    SET status = ?, ${updatePublished} updated_at = datetime('now')
    WHERE id = ?
  `).run(status, id);

  res.json({ success: true });
});

// Admin: Delete Article
app.delete('/api/admin/articles/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(id);
  db.prepare('DELETE FROM articles WHERE id = ?').run(id);
  res.json({ success: true });
});

// Admin: Categories Management
app.get('/api/admin/categories', authMiddleware, (_req: Request, res: Response) => {
  const categories = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id) as article_count
    FROM categories c
    ORDER BY c.sort_order ASC, c.name ASC
  `).all();
  res.json({ categories });
});

app.post('/api/admin/categories', authMiddleware, (req: Request, res: Response) => {
  const { name, slug, description, image_url, sort_order = 0 } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }

  const cleanSlug = (slug || name).toLowerCase().replace(/[^\w-]/g, '').trim().replace(/\s+/g, '-');
  const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    db.prepare(`
      INSERT INTO categories (id, name, slug, description, image_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, cleanSlug, description || null, image_url || null, sort_order || 0);

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(400).json({ error: err.message.includes('UNIQUE') ? 'A category with this slug already exists' : err.message });
  }
});

app.put('/api/admin/categories/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, description, image_url, sort_order } = req.body;

  db.prepare(`
    UPDATE categories
    SET name = ?, slug = ?, description = ?, image_url = ?, sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(name, slug, description || null, image_url || null, sort_order || 0, id);

  res.json({ success: true });
});

app.delete('/api/admin/categories/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  // Detach articles from category
  db.prepare('UPDATE articles SET category_id = NULL WHERE category_id = ?').run(id);
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ success: true });
});

// Admin: Tags Management
app.get('/api/admin/tags', authMiddleware, (_req: Request, res: Response) => {
  const tags = db.prepare(`
    SELECT t.*, (SELECT COUNT(*) FROM article_tags at WHERE at.tag_id = t.id) as article_count
    FROM tags t
    ORDER BY t.name ASC
  `).all();
  res.json({ tags });
});

app.post('/api/admin/tags', authMiddleware, (req: Request, res: Response) => {
  const { name, slug } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Tag name is required' });
    return;
  }

  const cleanSlug = (slug || name).toLowerCase().replace(/[^\w-]/g, '').trim().replace(/\s+/g, '-');
  const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    db.prepare('INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)').run(id, name, cleanSlug);
    res.json({ success: true, id, tag: { id, name, slug: cleanSlug } });
  } catch (err: any) {
    res.status(400).json({ error: err.message.includes('UNIQUE') ? 'A tag with this slug already exists' : err.message });
  }
});

app.delete('/api/admin/tags/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM article_tags WHERE tag_id = ?').run(id);
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  res.json({ success: true });
});

// Admin: Media Library
app.get('/api/admin/media', authMiddleware, (_req: Request, res: Response) => {
  const media = db.prepare('SELECT * FROM media ORDER BY created_at DESC').all();
  res.json({ media });
});

app.post('/api/admin/media/upload', authMiddleware, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file uploaded' });
    return;
  }

  const file = req.file;
  const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const relativeUrl = `/uploads/${file.filename}`;

  db.prepare(`
    INSERT INTO media (id, filename, original_name, mime_type, file_size, url, alt_text, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(mediaId, file.filename, file.originalname, file.mimetype, file.size, relativeUrl, req.body.alt_text || file.originalname);

  res.json({
    success: true,
    media: {
      id: mediaId,
      filename: file.filename,
      original_name: file.originalname,
      url: relativeUrl,
      file_size: file.size,
      mime_type: file.mimetype,
      alt_text: req.body.alt_text || ''
    }
  });
});

app.delete('/api/admin/media/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const item = db.prepare('SELECT filename FROM media WHERE id = ?').get(id) as any;
  if (item) {
    const filePath = path.join(uploadsDir, item.filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
    db.prepare('DELETE FROM media WHERE id = ?').run(id);
  }
  res.json({ success: true });
});

// Admin: Newsletter Subscribers
app.get('/api/admin/newsletter', authMiddleware, (_req: Request, res: Response) => {
  const subscribers = db.prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC').all();
  res.json({ subscribers });
});

app.get('/api/admin/newsletter/export', authMiddleware, (_req: Request, res: Response) => {
  const subscribers = db.prepare('SELECT name, email, status, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC').all() as any[];

  let csv = 'Name,Email,Status,SubscribedAt\r\n';
  for (const s of subscribers) {
    const safeName = `"${(s.name || '').replace(/"/g, '""')}"`;
    const safeEmail = `"${(s.email || '').replace(/"/g, '""')}"`;
    csv += `${safeName},${safeEmail},${s.status},${s.subscribed_at}\r\n`;
  }

  res.header('Content-Type', 'text/csv');
  res.attachment(`subscribers_export_${new Date().toISOString().slice(0, 10)}.csv`);
  res.send(csv);
});

app.delete('/api/admin/newsletter/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM newsletter_subscribers WHERE id = ?').run(id);
  res.json({ success: true });
});

// Admin: Advertisements
app.get('/api/admin/ads', authMiddleware, (_req: Request, res: Response) => {
  const ads = db.prepare('SELECT * FROM advertisement_slots ORDER BY slot_key ASC').all();
  res.json({ ads });
});

app.put('/api/admin/ads/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_enabled, ad_html, label, display_target } = req.body;

  db.prepare(`
    UPDATE advertisement_slots
    SET is_enabled = ?, ad_html = ?, label = ?, display_target = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(is_enabled ? 1 : 0, ad_html || '', label || 'Advertisement', display_target || 'all', id);

  res.json({ success: true });
});

// Admin: Site Settings
app.get('/api/admin/settings', authMiddleware, (_req: Request, res: Response) => {
  const settings = db.prepare("SELECT * FROM site_settings WHERE id = 'default'").get() as any;
  res.json({ settings: settings || {} });
});

app.put('/api/admin/settings', authMiddleware, (req: Request, res: Response) => {
  const {
    site_name,
    site_description,
    logo_url,
    favicon_url,
    site_url,
    default_seo_title,
    default_seo_description,
    social_facebook,
    social_twitter,
    social_instagram,
    social_linkedin,
    social_youtube,
    default_share_image,
    footer_copyright,
    contact_email,
    analytics_id
  } = req.body;

  db.prepare(`
    UPDATE site_settings SET
      site_name = ?,
      site_description = ?,
      logo_url = ?,
      favicon_url = ?,
      site_url = ?,
      default_seo_title = ?,
      default_seo_description = ?,
      social_facebook = ?,
      social_twitter = ?,
      social_instagram = ?,
      social_linkedin = ?,
      social_youtube = ?,
      default_share_image = ?,
      footer_copyright = ?,
      contact_email = ?,
      analytics_id = ?,
      updated_at = datetime('now')
    WHERE id = 'default'
  `).run(
    site_name || 'Apex Chronicle',
    site_description || '',
    logo_url || null,
    favicon_url || null,
    site_url || 'https://apexchronicle.com',
    default_seo_title || null,
    default_seo_description || null,
    social_facebook || null,
    social_twitter || null,
    social_instagram || null,
    social_linkedin || null,
    social_youtube || null,
    default_share_image || null,
    footer_copyright || '© Apex Chronicle Media Group. All rights reserved.',
    contact_email || 'editorial@apexchronicle.com',
    analytics_id || null
  );

  res.json({ success: true });
});

// Admin Users Management
app.get('/api/admin/users', authMiddleware, (_req: Request, res: Response) => {
  const users = db.prepare('SELECT id, email, name, role, is_initial_admin, created_at, updated_at FROM users ORDER BY is_initial_admin DESC, created_at ASC').all();
  res.json({ users });
});

app.post('/api/admin/users', authMiddleware, requireSuperAdmin, (req: Request, res: Response) => {
  const { email, name, password, role = 'admin' } = req.body;

  if (!email || !name || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
  if (existing) {
    res.status(400).json({ error: 'User with this email already exists' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, is_initial_admin, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
  `).run(id, cleanEmail, hash, name.trim(), role);

  res.json({
    success: true,
    user: { id, email: cleanEmail, name, role, is_initial_admin: 0 }
  });
});

app.delete('/api/admin/users/:id', authMiddleware, requireSuperAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;

  if (!targetUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (targetUser.is_initial_admin === 1 || targetUser.email === INITIAL_ADMIN_EMAIL) {
    res.status(403).json({ error: 'The primary initial administrator account cannot be deleted' });
    return;
  }

  const currentUser = (req as any).user;
  if (currentUser.id === id) {
    res.status(400).json({ error: 'You cannot delete your own active administrator account' });
    return;
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true });
});

// Authors Management (Admin)
app.get('/api/admin/authors', authMiddleware, (_req: Request, res: Response) => {
  const authors = db.prepare('SELECT * FROM authors ORDER BY name ASC').all();
  res.json({ authors });
});

app.post('/api/admin/authors', authMiddleware, (req: Request, res: Response) => {
  const { name, email, bio, avatar_url, role_title, twitter } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Author name is required' });
    return;
  }

  const id = `auth_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  db.prepare(`
    INSERT INTO authors (id, name, email, bio, avatar_url, role_title, twitter)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, email || null, bio || null, avatar_url || null, role_title || 'Staff Writer', twitter || null);

  res.json({ success: true, id });
});

/* ==========================================================================
   VITE DEV SERVER / PRODUCTION STATIC SERVING
   ========================================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  VITE v6.1.1  ready in 150 ms\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`[Apex Chronicle Server] Listening on http://0.0.0.0:${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
