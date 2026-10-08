import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Table as TableIcon,
  Minus,
  Eye,
  FileCode,
  X,
  ExternalLink,
  ArrowRight,
  Globe,
  Sparkles
} from 'lucide-react';
import { sanitizeArticleContent } from '../utils/sanitize';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onOpenMediaModal?: () => void;
}

export const RichEditor: React.FC<RichEditorProps> = ({
  value,
  onChange,
  onOpenMediaModal
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Link Insertion Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkSelection, setLinkSelection] = useState<{ start: number; end: number; text: string }>({
    start: 0,
    end: 0,
    text: ''
  });
  const [linkText, setLinkText] = useState('View All →');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkStyle, setLinkStyle] = useState<'inline' | 'button-dark' | 'button-outline'>('inline');
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true);

  // Helper to insert markdown/HTML snippets around selection
  const insertSnippet = (before: string, after: string = '', defaultText: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end) || defaultText;
    const replacement = `${before}${selected}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Open the interactive link insertion dialog
  const handleOpenLinkModal = () => {
    const el = textareaRef.current;
    let selectedText = '';
    let startPos = 0;
    let endPos = 0;

    if (el) {
      startPos = el.selectionStart;
      endPos = el.selectionEnd;
      selectedText = value.substring(startPos, endPos).trim();
    }

    setLinkSelection({ start: startPos, end: endPos, text: selectedText });
    setLinkText(selectedText || 'View All →');
    setLinkUrl('');
    setLinkStyle('inline');
    setLinkOpenInNewTab(true);
    setIsLinkModalOpen(true);
  };

  // Insert the configured hyperlink or button link
  const handleApplyLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let finalUrl = linkUrl.trim();
    if (!finalUrl) {
      finalUrl = '#';
    } else if (
      !finalUrl.startsWith('http://') &&
      !finalUrl.startsWith('https://') &&
      !finalUrl.startsWith('/') &&
      !finalUrl.startsWith('#') &&
      !finalUrl.startsWith('mailto:') &&
      !finalUrl.startsWith('tel:')
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    const displayText = linkText.trim() || 'View All →';
    const isExternal = finalUrl.startsWith('http://') || finalUrl.startsWith('https://');
    const targetAttrs = linkOpenInNewTab || isExternal
      ? ' target="_blank" rel="noopener noreferrer"'
      : '';

    let generatedHtml = '';
    if (linkStyle === 'button-dark') {
      generatedHtml = `<a href="${finalUrl}" class="btn-link"${targetAttrs}>${displayText}</a>`;
    } else if (linkStyle === 'button-outline') {
      generatedHtml = `<a href="${finalUrl}" class="btn-outline"${targetAttrs}>${displayText}</a>`;
    } else {
      generatedHtml = `<a href="${finalUrl}"${targetAttrs}>${displayText}</a>`;
    }

    const el = textareaRef.current;
    const { start, end } = linkSelection;

    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = `${before}${generatedHtml}${after}`;

    onChange(newValue);
    setIsLinkModalOpen(false);

    setTimeout(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(start + generatedHtml.length, start + generatedHtml.length);
      }
    }, 0);
  };

  const handleInsertImage = () => {
    if (onOpenMediaModal) {
      onOpenMediaModal();
      return;
    }
    const url = prompt('Enter Image URL:');
    if (url) {
      const alt = prompt('Enter Image Alt Text (SEO):') || 'Article photo';
      const caption = prompt('Enter Image Caption (optional):') || '';
      const imgHtml = caption
        ? `<figure class="my-6">\n  <img src="${url}" alt="${alt}" class="w-full rounded shadow-sm" />\n  <figcaption class="text-xs text-stone-500 text-center mt-2 font-mono">${caption}</figcaption>\n</figure>\n`
        : `<p class="my-6"><img src="${url}" alt="${alt}" class="w-full rounded shadow-sm" /></p>\n`;
      insertSnippet(imgHtml);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `\n<table class="w-full my-6 border-collapse border border-stone-200 text-sm">
  <thead>
    <tr class="bg-stone-100 text-stone-800">
      <th class="border border-stone-200 p-2 text-left font-semibold">Parameter</th>
      <th class="border border-stone-200 p-2 text-left font-semibold">Benchmark</th>
      <th class="border border-stone-200 p-2 text-left font-semibold">Variance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-stone-200 p-2 font-medium">Metric Alpha</td>
      <td class="border border-stone-200 p-2">94.8%</td>
      <td class="border border-stone-200 p-2 text-emerald-600">+4.2%</td>
    </tr>
    <tr>
      <td class="border border-stone-200 p-2 font-medium">Metric Beta</td>
      <td class="border border-stone-200 p-2">82.1%</td>
      <td class="border border-stone-200 p-2 text-rose-600">-1.5%</td>
    </tr>
  </tbody>
</table>\n`;
    insertSnippet(tableHtml);
  };

  const handleInsertCode = () => {
    const codeHtml = `\n<pre class="bg-stone-900 text-stone-100 p-4 rounded text-xs font-mono overflow-x-auto my-6"><code>// System pipeline verification
function analyzeThroughput(payload) {
  return payload.filter(item => item.active);
}</code></pre>\n`;
    insertSnippet(codeHtml);
  };

  return (
    <div className="border border-stone-300 rounded overflow-hidden bg-white flex flex-col relative">
      {/* Top action toolbar */}
      <div className="bg-stone-100 border-b border-stone-200 p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertSnippet('<strong>', '</strong>', 'bold text')}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('<em>', '</em>', 'italic text')}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-stone-300 mx-1" aria-hidden="true" />

          <button
            type="button"
            onClick={() => insertSnippet('<h2>', '</h2>\n', 'Section Heading')}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('<h3>', '</h3>\n', 'Subsection Heading')}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-stone-300 mx-1" aria-hidden="true" />

          <button
            type="button"
            onClick={() => insertSnippet('<blockquote>\n  <p>"', '"</p>\n</blockquote>\n', 'Quotation')}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('<ul>\n  <li>', '</li>\n  <li>Item 2</li>\n</ul>\n', 'Item 1')}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('<ol>\n  <li>', '</li>\n  <li>Step 2</li>\n</ol>\n', 'Step 1')}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-stone-300 mx-1" aria-hidden="true" />

          {/* Hyperlink Insert Button */}
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors relative flex items-center gap-1 group bg-stone-100"
            title="Insert Hyperlink or Clickable Button (View All, Read More, etc.)"
          >
            <LinkIcon className="w-4 h-4 text-stone-800" />
            <span className="text-xs font-semibold text-stone-700 hidden sm:inline">Link / Button</span>
          </button>

          <button
            type="button"
            onClick={handleInsertImage}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertTable}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Insert Data Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertCode}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('\n<hr class="my-8 border-stone-200" />\n')}
            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
              activeTab === 'editor' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
              activeTab === 'preview' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {activeTab === 'editor' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your article body here using semantic HTML or paragraphs..."
          rows={18}
          className="w-full p-4 font-mono text-sm leading-relaxed text-stone-800 bg-white focus:outline-none resize-y min-h-[350px]"
        />
      ) : (
        <div className="p-6 bg-stone-50 min-h-[350px] overflow-y-auto max-h-[600px] border-t border-stone-100">
          <div className="max-w-2xl mx-auto prose prose-stone font-editorial leading-relaxed">
            {value.trim() ? (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(value) }}
                className="article-preview-content space-y-4 text-base text-stone-800"
                onClick={(e) => {
                  const anchor = (e.target as HTMLElement).closest('a');
                  if (!anchor) return;
                  const href = anchor.getAttribute('href');
                  if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                    window.open(href, '_blank', 'noopener,noreferrer');
                  }
                }}
              />
            ) : (
              <p className="text-stone-600 italic">No content written yet. Switch to Editor to compose.</p>
            )}
          </div>
        </div>
      )}

      {/* Word Count & Status footer */}
      <div className="bg-stone-100/60 border-t border-stone-200 px-3 py-1.5 text-xs text-stone-600 flex items-center justify-between font-mono">
        <span>
          {value.trim() ? value.trim().split(/\s+/).length : 0} words ·{' '}
          {Math.max(1, Math.ceil((value.trim() ? value.trim().split(/\s+/).length : 0) / 200))} min read
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-stone-600">Supports HTML5 hyperlinks &amp; buttons</span>
        </div>
      </div>

      {/* Modal Dialog: Insert Hyperlink & Clickable Action Button */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-lg shadow-2xl border border-stone-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900 text-white">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-stone-300" />
                <h3 id="link-modal-title" className="text-sm font-semibold tracking-wide">
                  Insert Hyperlink or Clickable Button
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleApplyLink} className="p-5 space-y-4">
              {/* Display Text */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Display Text (What Readers See)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g., View All, Read More, Click Here..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
                
                {/* One-click Display Text Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-mono text-stone-500 mr-1">Quick text:</span>
                  {[
                    'View All →',
                    'Read More →',
                    'Click Here',
                    'Explore Category',
                    'Official Report'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLinkText(preset)}
                      className="text-[11px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination URL */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Destination URL (Target Address)
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLinkUrl(val);
                    // Automatically toggle new tab if external link
                    if (val.startsWith('http://') || val.startsWith('https://')) {
                      setLinkOpenInNewTab(true);
                    } else if (val.startsWith('/')) {
                      setLinkOpenInNewTab(false);
                    }
                  }}
                  placeholder="https://example.com or /category/technology or /articles"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                />

                {/* Quick URL Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-mono text-stone-500 mr-1">Destination:</span>
                  {[
                    { label: '/articles (All Articles)', value: '/articles' },
                    { label: '/categories (Directory)', value: '/categories' },
                    { label: '/category/technology', value: '/category/technology' },
                    { label: '/category/business', value: '/category/business' },
                    { label: 'https://', value: 'https://' }
                  ].map((dest) => (
                    <button
                      key={dest.label}
                      type="button"
                      onClick={() => {
                        setLinkUrl(dest.value);
                        setLinkOpenInNewTab(!dest.value.startsWith('/'));
                      }}
                      className="text-[11px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-200 transition-colors font-mono"
                    >
                      {dest.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Appearance / Style */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Presentation Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkStyle('inline')}
                    className={`px-3 py-2 text-xs font-medium rounded border text-left transition-all ${
                      linkStyle === 'inline'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="block font-semibold">Standard Link</span>
                    <span className="text-[10px] opacity-80">Underlined text</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkStyle('button-dark')}
                    className={`px-3 py-2 text-xs font-medium rounded border text-left transition-all ${
                      linkStyle === 'button-dark'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="block font-semibold">Solid Button</span>
                    <span className="text-[10px] opacity-80">"View All →" button</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkStyle('button-outline')}
                    className={`px-3 py-2 text-xs font-medium rounded border text-left transition-all ${
                      linkStyle === 'button-outline'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="block font-semibold">Outline Button</span>
                    <span className="text-[10px] opacity-80">Bordered box</span>
                  </button>
                </div>
              </div>

              {/* Behavior Settings */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={linkOpenInNewTab}
                    onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                    className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 border-stone-300"
                  />
                  <span>Open destination in a new window or tab (recommended for external websites)</span>
                </label>
              </div>

              {/* Real-Time Preview Box */}
              <div className="p-3 bg-stone-100 rounded border border-stone-200">
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1.5 flex items-center justify-between">
                  <span>Reader Preview:</span>
                  <span className="text-stone-400">URL hidden behind text</span>
                </div>
                <div className="py-2 px-3 bg-white rounded border border-stone-200 flex items-center justify-start min-h-[44px]">
                  {linkStyle === 'inline' ? (
                    <span className="text-stone-900 underline underline-offset-4 decoration-stone-400 font-medium text-sm">
                      {linkText || 'View All →'}
                    </span>
                  ) : linkStyle === 'button-dark' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded text-xs font-semibold">
                      {linkText || 'View All →'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-stone-900 border border-stone-300 rounded text-xs font-semibold">
                      {linkText || 'View All →'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-stone-500 mt-1 truncate">
                  Target: {linkUrl || '(No URL set yet)'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!linkText.trim()}
                  className="px-5 py-2 text-xs font-semibold bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Insert Hyperlink</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
