import ScoreGauge from './ScoreGauge';
import {
  formatPercent,
  getPredictionLabel,
  getPredictionTone,
  getRiskLabel,
  getRiskTone,
} from '../utils/analysis';

export default function ResultPanel({ result }) {
  if (!result) return null;

  const prediction = getPredictionLabel(result.prediction, result.score);
  const riskLevel = getRiskLabel(result.risk_level, result.score);
  const predictionTone = getPredictionTone(result.prediction, result.score);
  const riskTone = getRiskTone(result.risk_level, result.score);
  const matchedKeywords = result.matched_keywords || [];
  const recommendedActions = result.recommended_actions || [];
  const trustSignals = result.trust_signals || [];
  const riskSignals = result.risk_signals || [];
  const hasBreakdown = Object.keys(result.analysis_breakdown || {}).length > 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreGauge score={result.score} />
        <div className="col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-center">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Analysis Summary</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${predictionTone}`}>
                {prediction}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskTone}`}>
                Risk: {riskLevel}
              </span>
              <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                Confidence: {formatPercent(result.confidence)}
              </span>
            </div>
          </div>
          <p className="text-slate-300">{result.summary}</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="text-sm text-slate-300 bg-slate-900 p-3 rounded-lg">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">
                Category
              </span>
              <span className="font-mono text-slate-200">{result.category || 'N/A'}</span>
            </div>
            <div className="text-sm text-slate-300 bg-slate-900 p-3 rounded-lg">
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">
                Record ID
              </span>
              <span className="font-mono text-slate-200">{result.record_id ?? 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3">Decision Reasoning</h3>
        <p className="text-slate-300 leading-7">
          {result.reason || 'No detailed reasoning was returned for this analysis.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">Matched Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((keyword, index) => (
                <span
                  key={`${keyword}-${index}`}
                  className="px-3 py-1 rounded-full text-sm bg-slate-900 text-slate-300 border border-slate-700 font-mono"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">No explicit keyword matches were returned.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-blue-900/30">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">Recommended Actions</h3>
          <ul className="space-y-2">
            {recommendedActions.length > 0 ? (
              recommendedActions.map((action, index) => (
                <li key={`${action}-${index}`} className="text-sm text-slate-300 flex items-start">
                  <i className="fas fa-arrow-right text-blue-400 mr-2 mt-1"></i>
                  {action}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">No follow-up actions were provided.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-red-900/30">
          <h3 className="text-lg font-semibold text-red-400 mb-3"><i className="fas fa-exclamation-triangle mr-2"></i>Risk Signals</h3>
          <ul className="space-y-2">
            {riskSignals.map((signal, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start"><i className="fas fa-times text-red-500 mr-2 mt-1"></i> {signal}</li>
            ))}
            {riskSignals.length === 0 && <li className="text-slate-500 text-sm">No major risk signals detected.</li>}
          </ul>
        </div>
        <div className="bg-slate-800 p-5 rounded-xl border border-green-900/30">
          <h3 className="text-lg font-semibold text-green-400 mb-3"><i className="fas fa-shield-check mr-2"></i>Trust Signals</h3>
          <ul className="space-y-2">
            {trustSignals.map((signal, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start"><i className="fas fa-check text-green-500 mr-2 mt-1"></i> {signal}</li>
            ))}
            {trustSignals.length === 0 && <li className="text-slate-500 text-sm">No trust signals were returned.</li>}
          </ul>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Component Breakdown</h3>
        {hasBreakdown ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(result.analysis_breakdown || {}).map(([key, value]) => (
              <div key={key} className="bg-slate-900 p-3 rounded text-center">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{key}</div>
                <div className="text-lg font-mono text-teal-400">
                  {typeof value === 'number' ? (value * 100).toFixed(1) : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            The backend did not return a component-by-component breakdown for this result.
          </p>
        )}
      </div>
    </div>
  );
}
