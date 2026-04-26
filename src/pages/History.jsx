import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import ResultPanel from '../components/ResultPanel';
import { getRecentResults, getResultById } from '../services/api';
import {
  countByPrediction,
  formatScore,
  formatTimestamp,
  getPredictionTone,
} from '../utils/analysis';

const PAGE_SIZE = 10;

const prepareHistoryState = (response, selectedId) => {
  const results = response.results || [];
  const total = response.total ?? results.length;

  if (results.length === 0) {
    return {
      results,
      total,
      nextSelectedId: null,
      shouldClearSelection: true,
    };
  }

  const preservedRow = results.find((item) => (item.id ?? item.record_id) === selectedId);
  const nextSelectedId =
    preservedRow?.id ??
    preservedRow?.record_id ??
    results[0].id ??
    results[0].record_id ??
    null;

  return {
    results,
    total,
    nextSelectedId,
    shouldClearSelection: false,
  };
};

export default function History() {
  const [limit, setLimit] = useState(20);
  const [historyItems, setHistoryItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [predictionFilter, setPredictionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const selectedIdRef = useRef(null);

  const loadHistory = async () => {
    setLoading(true);

    try {
      const response = await getRecentResults(limit);
      const nextState = prepareHistoryState(response, selectedIdRef.current);

      setHistoryItems(nextState.results);
      setTotal(nextState.total);
      setLastUpdated(new Date());
      setCurrentPage(1);

      if (nextState.shouldClearSelection) {
        setSelectedId(null);
        selectedIdRef.current = null;
        setSelectedResult(null);
        setDetailLoading(false);
      } else {
        setSelectedId(nextState.nextSelectedId);
        selectedIdRef.current = nextState.nextSelectedId;
        setDetailLoading(Boolean(nextState.nextSelectedId));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    getRecentResults(limit)
      .then((response) => {
        if (isActive) {
          const nextState = prepareHistoryState(response, selectedIdRef.current);

          setHistoryItems(nextState.results);
          setTotal(nextState.total);
          setLastUpdated(new Date());
          setCurrentPage(1);

          if (nextState.shouldClearSelection) {
            setSelectedId(null);
            selectedIdRef.current = null;
            setSelectedResult(null);
            setDetailLoading(false);
          } else {
            setSelectedId(nextState.nextSelectedId);
            selectedIdRef.current = nextState.nextSelectedId;
            setDetailLoading(Boolean(nextState.nextSelectedId));
          }

          setLoading(false);
        }
      })
      .catch((error) => {
        if (isActive) {
          toast.error(error.message || 'Failed to load scan history');
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [limit]);

  useEffect(() => {
    if (selectedId === null || selectedId === undefined) {
      return;
    }

    let isActive = true;

    const loadDetail = async () => {
      try {
        const detail = await getResultById(selectedId);
        if (isActive) {
          setSelectedResult(detail);
        }
      } catch (error) {
        if (isActive) {
          toast.error(error.message || 'Failed to load result detail');
          setSelectedResult(null);
        }
      } finally {
        if (isActive) {
          setDetailLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      isActive = false;
    };
  }, [selectedId]);

  const filteredItems = historyItems.filter((item) => {
    const searchable = `${item.subject || ''} ${item.sender || ''}`.toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    const normalizedPrediction = (item.prediction || '').toLowerCase();
    const matchesPrediction =
      predictionFilter === 'all' || normalizedPrediction === predictionFilter;

    return matchesQuery && matchesPrediction;
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pagedItems = filteredItems.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE
  );

  const safeCount = countByPrediction(historyItems, 'safe');
  const suspiciousCount = countByPrediction(historyItems, 'suspicious');
  const phishingCount = countByPrediction(historyItems, 'phishing');

  return (
    <div className="space-y-8">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Scan History</h1>
            <p className="text-sm text-slate-400 mt-2">
              Review recent backend analyses and reopen a full record for detailed explainability.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {lastUpdated
                ? `Last refreshed: ${lastUpdated.toLocaleString()}`
                : 'History has not been refreshed yet.'}
            </p>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Stored</p>
          <p className="text-3xl font-bold text-white">{total}</p>
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

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Results</h2>
            <p className="text-sm text-slate-400 mt-1">
              Narrow the list, then click any row to load its full backend detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by subject or sender"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              value={predictionFilter}
              onChange={(event) => {
                setPredictionFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Predictions</option>
              <option value="safe">Safe</option>
              <option value="suspicious">Suspicious</option>
              <option value="phishing">Phishing</option>
            </select>
            <select
              value={limit}
              onChange={(event) => {
                setLoading(true);
                setCurrentPage(1);
                setLimit(Number.parseInt(event.target.value, 10));
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={10}>Last 10</option>
              <option value={20}>Last 20</option>
              <option value={50}>Last 50</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-slate-400">Loading recent history...</div>
        ) : filteredItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            No history items match the current filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-900/80">
                  <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Sender</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Prediction</th>
                    <th className="px-6 py-4">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedItems.map((item) => {
                    const rowId = item.id ?? item.record_id;
                    return (
                      <tr
                        key={rowId ?? `${item.timestamp}-${item.sender}`}
                        onClick={() => {
                          setDetailLoading(true);
                          selectedIdRef.current = rowId;
                          setSelectedId(rowId);
                        }}
                        className={`border-t border-slate-700 cursor-pointer transition ${
                          selectedId === rowId ? 'bg-slate-700/50' : 'hover:bg-slate-900/70'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatTimestamp(item.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                          {item.sender || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {item.subject || 'No subject'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPredictionTone(
                              item.prediction,
                              item.score
                            )}`}
                          >
                            {item.prediction || 'Derived'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {formatScore(item.score)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-700 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-400">
                Showing {(visiblePage - 1) * PAGE_SIZE + 1}-
                {Math.min(visiblePage * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))}
                  disabled={visiblePage === 1}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 rounded-lg bg-slate-900 text-sm text-slate-300">
                  Page {visiblePage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, Math.min(page, totalPages) + 1))}
                  disabled={visiblePage === totalPages}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Selected Record Detail</h2>
          <p className="text-sm text-slate-400 mt-1">
            Full backend response for the selected history item.
          </p>
        </div>

        {detailLoading ? (
          <div className="bg-slate-800 p-10 rounded-xl border border-slate-700 text-center text-slate-400">
            Loading selected result...
          </div>
        ) : selectedResult ? (
          <ResultPanel result={selectedResult} />
        ) : (
          <div className="bg-slate-800 p-10 rounded-xl border border-slate-700 text-center text-slate-500">
            Select a history row to inspect its full analysis.
          </div>
        )}
      </div>
    </div>
  );
}
