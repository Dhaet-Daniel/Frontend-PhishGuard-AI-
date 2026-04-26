import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ResultPanel from '../components/ResultPanel';
import { batchScanEmails } from '../services/api';
import {
  countByPrediction,
  formatPercent,
  formatScore,
  getPredictionTone,
} from '../utils/analysis';
import { compactPayload } from '../utils/payload';

const MAX_BATCH_SIZE = 10;

const createBatchEmail = () => ({
  subject: '',
  sender: '',
  display_name: '',
  reply_to: '',
  return_path: '',
  body_text: '',
  body_html: '',
  raw_email: '',
  auth_results: '',
  showAdvanced: false,
});

export default function BatchScanner() {
  const [emails, setEmails] = useState([createBatchEmail(), createBatchEmail()]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [submittedRows, setSubmittedRows] = useState([]);

  const updateEmail = (index, field, value) => {
    setEmails((current) =>
      current.map((email, emailIndex) =>
        emailIndex === index ? { ...email, [field]: value } : email
      )
    );
  };

  const addEmail = () => {
    if (emails.length >= MAX_BATCH_SIZE) {
      toast.error(`Batch limit is ${MAX_BATCH_SIZE} emails per run.`);
      return;
    }

    setEmails((current) => [...current, createBatchEmail()]);
  };

  const removeEmail = (index) => {
    setEmails((current) => current.filter((_, emailIndex) => emailIndex !== index));
  };

  const buildBatchPayload = (email) =>
    compactPayload({
      subject: email.subject,
      sender: email.sender,
      sender_info: {
        email: email.sender,
        display_name: email.display_name,
        reply_to: email.reply_to,
        return_path: email.return_path,
      },
      body_text: email.body_text,
      body_html: email.body_html,
      raw_email: email.raw_email,
      headers: {
        'Authentication-Results': email.auth_results,
      },
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const populatedEmails = emails.filter((email) =>
      [
        email.sender,
        email.subject,
        email.body_text,
        email.body_html,
        email.raw_email,
        email.display_name,
        email.reply_to,
        email.return_path,
        email.auth_results,
      ].some((value) => value.trim().length > 0)
    );

    if (populatedEmails.length === 0) {
      toast.error('Add at least one email to scan.');
      return;
    }

    const invalidRowIndex = populatedEmails.findIndex((email) => {
      const hasBodySource = [email.body_text, email.body_html, email.raw_email].some(
        (value) => value.trim().length > 0
      );

      return !email.sender.trim() || !hasBodySource;
    });

    if (invalidRowIndex !== -1) {
      toast.error(`Email ${invalidRowIndex + 1} needs a sender and at least one body source.`);
      return;
    }

    const payload = populatedEmails.map(buildBatchPayload);

    setLoading(true);
    setResults([]);
    setSelectedIndex(null);
    setSubmittedRows([]);

    try {
      const response = await batchScanEmails(payload);
      setResults(response);
      setSubmittedRows(populatedEmails);
      setSelectedIndex(response.length ? 0 : null);
      toast.success(`Batch analysis completed for ${response.length} emails.`);
    } catch (error) {
      toast.error(error.message || 'Batch analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const safeCount = countByPrediction(results, 'safe');
  const suspiciousCount = countByPrediction(results, 'suspicious');
  const phishingCount = countByPrediction(results, 'phishing');
  const selectedResult = selectedIndex === null ? null : results[selectedIndex];
  const batchCountMismatch =
    submittedRows.length > 0 && results.length > 0 && submittedRows.length !== results.length;

  return (
    <div className="space-y-8">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Batch Scanner</h1>
            <p className="text-sm text-slate-400 mt-2">
              Submit up to {MAX_BATCH_SIZE} emails at once and compare the backend verdicts side by
              side.
            </p>
          </div>
          <button
            type="button"
            onClick={addEmail}
            className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Add Email
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {emails.map((email, index) => (
            <div
              key={`batch-email-${index}`}
              className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 space-y-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-white">Email {index + 1}</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateEmail(index, 'showAdvanced', !email.showAdvanced)}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                  >
                    {email.showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEmail(index)}
                    disabled={emails.length === 1}
                    className="bg-red-600/80 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Sender *</label>
                  <input
                    type="email"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={email.sender}
                    onChange={(event) => updateEmail(index, 'sender', event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={email.subject}
                    onChange={(event) => updateEmail(index, 'subject', event.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Body Text</label>
                  <textarea
                    rows="5"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    value={email.body_text}
                    onChange={(event) => updateEmail(index, 'body_text', event.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Body HTML</label>
                  <textarea
                    rows="5"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    value={email.body_html}
                    onChange={(event) => updateEmail(index, 'body_html', event.target.value)}
                  ></textarea>
                </div>
              </div>

              {email.showAdvanced && (
                <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={email.display_name}
                        onChange={(event) => updateEmail(index, 'display_name', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Reply-To
                      </label>
                      <input
                        type="email"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={email.reply_to}
                        onChange={(event) => updateEmail(index, 'reply_to', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Return-Path
                      </label>
                      <input
                        type="email"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={email.return_path}
                        onChange={(event) => updateEmail(index, 'return_path', event.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Raw Email / RFC822 Source
                    </label>
                    <textarea
                      rows="5"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                      value={email.raw_email}
                      onChange={(event) => updateEmail(index, 'raw_email', event.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Authentication-Results
                    </label>
                    <textarea
                      rows="3"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                      placeholder="spf=pass; dkim=pass; dmarc=pass"
                      value={email.auth_results}
                      onChange={(event) => updateEmail(index, 'auth_results', event.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing Batch...' : 'Run Batch Scan'}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Processed</p>
              <p className="text-3xl font-bold text-white">{results.length}</p>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl border border-emerald-900/30">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Safe</p>
              <p className="text-3xl font-bold text-emerald-300">{safeCount}</p>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl border border-amber-900/30">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Suspicious</p>
              <p className="text-3xl font-bold text-amber-300">{suspiciousCount}</p>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl border border-red-900/30">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Phishing</p>
              <p className="text-3xl font-bold text-red-300">{phishingCount}</p>
            </div>
          </div>

          {batchCountMismatch && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-200">
              The backend returned {results.length} results for {submittedRows.length} submitted
              emails. The table below maps rows by returned order, so double-check any mismatch.
            </div>
          )}

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Batch Results</h2>
              <p className="text-sm text-slate-400 mt-1">
                Select a row to inspect the full backend explanation below.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-900/80">
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Sender</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Prediction</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => {
                    const submittedRow = submittedRows[index];

                    return (
                      <tr
                        key={`batch-result-${index}`}
                        onClick={() => setSelectedIndex(index)}
                        className={`border-t border-slate-700 cursor-pointer transition ${
                          selectedIndex === index ? 'bg-slate-700/50' : 'hover:bg-slate-900/70'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-slate-300">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                          {result.sender || submittedRow?.sender || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {result.subject || submittedRow?.subject || 'No subject'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPredictionTone(
                              result.prediction,
                              result.score
                            )}`}
                          >
                            {result.prediction || 'Derived'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatScore(result.score)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatPercent(result.confidence)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">Selected Result Detail</h2>
              <p className="text-sm text-slate-400 mt-1">
                Deep view of the batch item you clicked above.
              </p>
            </div>
            <ResultPanel result={selectedResult} />
          </div>
        </>
      )}
    </div>
  );
}
