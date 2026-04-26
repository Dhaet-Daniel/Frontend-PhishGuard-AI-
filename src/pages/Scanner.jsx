import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { scanEmail } from '../services/api';
import ResultPanel from '../components/ResultPanel';
import { compactPayload } from '../utils/payload';

const createLink = () => ({
  text: '',
  url: '',
  source: 'manual',
});

const createAttachment = () => ({
  filename: '',
  content_type: '',
  size: '',
  sha256: '',
  is_password_protected: false,
  extracted_text: '',
});

export default function Scanner() {
  const [formData, setFormData] = useState({
    subject: '',
    sender: '',
    display_name: '',
    reply_to: '',
    return_path: '',
    body_text: '',
    body_html: '',
    raw_email: '',
    auth_results: '',
    received_headers: '',
    links: [createLink()],
    attachments: [createAttachment()],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const updateLink = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      links: current.links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const updateAttachment = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      attachments: current.attachments.map((attachment, attachmentIndex) =>
        attachmentIndex === index ? { ...attachment, [field]: value } : attachment
      ),
    }));
  };

  const addLink = () => {
    setFormData((current) => ({ ...current, links: [...current.links, createLink()] }));
  };

  const removeLink = (index) => {
    setFormData((current) => ({
      ...current,
      links: current.links.filter((_, linkIndex) => linkIndex !== index),
    }));
  };

  const addAttachment = () => {
    setFormData((current) => ({
      ...current,
      attachments: [...current.attachments, createAttachment()],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((current) => ({
      ...current,
      attachments: current.attachments.filter((_, attachmentIndex) => attachmentIndex !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasBodySource = [formData.body_text, formData.body_html, formData.raw_email].some(
      (value) => value.trim().length > 0
    );

    if (!formData.sender.trim() || !hasBodySource) {
      return toast.error('Sender plus at least one body source is required.');
    }

    setLoading(true);
    setResult(null);
    try {
      const links = formData.links.map((link) => ({
        text: link.text,
        url: link.url,
        source: link.source || 'manual',
      }));

      const attachments = formData.attachments.map((attachment) => ({
        filename: attachment.filename,
        content_type: attachment.content_type,
        size: attachment.size === '' ? undefined : Number.parseInt(attachment.size, 10),
        sha256: attachment.sha256,
        is_password_protected: attachment.is_password_protected,
        extracted_text: attachment.extracted_text,
      }));

      const payload = compactPayload({
        subject: formData.subject,
        sender: formData.sender,
        sender_info: {
          email: formData.sender,
          display_name: formData.display_name,
          reply_to: formData.reply_to,
          return_path: formData.return_path,
        },
        body_text: formData.body_text,
        body_html: formData.body_html,
        raw_email: formData.raw_email,
        headers: {
          'Authentication-Results': formData.auth_results,
          Received: formData.received_headers,
        },
        links,
        attachments,
      });

      const data = await scanEmail(payload);
      setResult(data);
      toast.success('Analysis complete');
    } catch (err) {
      toast.error(err.message || 'Failed to scan email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">Single Email Scanner</h2>
        <p className="text-sm text-slate-400 mb-6">
          Feed the backend more context and it can score sender alignment, headers, links, and
          attachment risk much more accurately.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Sender Email *</label>
              <input
                type="email" required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.sender}
                onChange={(e) => updateField('sender', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.subject}
                onChange={(e) => updateField('subject', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.display_name}
                onChange={(e) => updateField('display_name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Reply-To</label>
              <input
                type="email"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.reply_to}
                onChange={(e) => updateField('reply_to', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Return-Path</label>
              <input
                type="email"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.return_path}
                onChange={(e) => updateField('return_path', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Email Body (Text)
              </label>
              <textarea
                rows="6"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                value={formData.body_text}
                onChange={(e) => updateField('body_text', e.target.value)}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Email Body (HTML)
              </label>
              <textarea
                rows="6"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                value={formData.body_html}
                onChange={(e) => updateField('body_html', e.target.value)}
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Raw Email / RFC822 Source
            </label>
            <textarea
              rows="6"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              value={formData.raw_email}
              onChange={(e) => updateField('raw_email', e.target.value)}
            ></textarea>
            <p className="mt-2 text-xs text-slate-500">
              Provide at least one of text body, HTML body, or raw email.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Header Signals</h3>
              <p className="text-sm text-slate-400">
                Optional inputs for SPF, DKIM, DMARC, and routing consistency checks.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Authentication-Results
              </label>
              <textarea
                rows="3"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                placeholder="spf=pass; dkim=pass; dmarc=pass"
                value={formData.auth_results}
                onChange={(e) => updateField('auth_results', e.target.value)}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Received Headers
              </label>
              <textarea
                rows="4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                placeholder="Paste routing headers here"
                value={formData.received_headers}
                onChange={(e) => updateField('received_headers', e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Detected or Embedded Links</h3>
                <p className="text-sm text-slate-400">
                  Add URLs the backend should inspect for redirects, shorteners, TLD risk, and
                  mismatch patterns.
                </p>
              </div>
              <button
                type="button"
                onClick={addLink}
                className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Add Link
              </button>
            </div>

            {formData.links.map((link, index) => (
              <div key={`link-${index}`} className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={link.text}
                    onChange={(e) => updateLink(index, 'text', e.target.value)}
                  />
                </div>
                <div className="lg:col-span-5">
                  <label className="block text-xs font-medium text-slate-400 mb-1">URL</label>
                  <input
                    type="url"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Source</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={link.source}
                    onChange={(e) => updateLink(index, 'source', e.target.value)}
                  >
                    <option value="manual">manual</option>
                    <option value="text">text</option>
                    <option value="html">html</option>
                    <option value="button">button</option>
                  </select>
                </div>
                <div className="lg:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    disabled={formData.links.length === 1}
                    className="w-full bg-red-600/80 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Attachment Metadata</h3>
                <p className="text-sm text-slate-400">
                  Optional file indicators for extension, file size, macros, and encrypted
                  attachment analysis.
                </p>
              </div>
              <button
                type="button"
                onClick={addAttachment}
                className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Add Attachment
              </button>
            </div>

            {formData.attachments.map((attachment, index) => (
              <div key={`attachment-${index}`} className="space-y-3 border border-slate-800 rounded-xl p-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-4">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Filename</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={attachment.filename}
                      onChange={(e) => updateAttachment(index, 'filename', e.target.value)}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Content Type
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={attachment.content_type}
                      onChange={(e) => updateAttachment(index, 'content_type', e.target.value)}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Size (bytes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={attachment.size}
                      onChange={(e) => updateAttachment(index, 'size', e.target.value)}
                    />
                  </div>
                  <div className="lg:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      disabled={formData.attachments.length === 1}
                      className="w-full bg-red-600/80 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-8">
                    <label className="block text-xs font-medium text-slate-400 mb-1">SHA-256</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                      value={attachment.sha256}
                      onChange={(e) => updateAttachment(index, 'sha256', e.target.value)}
                    />
                  </div>
                  <div className="lg:col-span-4 flex items-end">
                    <label className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 w-full">
                      <input
                        type="checkbox"
                        checked={attachment.is_password_protected}
                        onChange={(e) =>
                          updateAttachment(index, 'is_password_protected', e.target.checked)
                        }
                      />
                      Password protected
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Extracted Text / OCR
                  </label>
                  <textarea
                    rows="3"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    value={attachment.extracted_text}
                    onChange={(e) => updateAttachment(index, 'extracted_text', e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-shield-alt mr-2"></i>}
            {loading ? 'Analyzing Layers...' : 'Scan Email'}
          </button>
        </form>
      </div>

      <ResultPanel result={result} />
    </div>
  );
}
