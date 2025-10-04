import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check backend connection once
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await axios.get(`${API_BASE}/api/tasks`);

        setIsConnected(true);
        setError(null);
      } catch {
        setIsConnected(false);
        setError('Cannot connect to server. Please make sure the backend is running.');
      }
    };
    checkConnection();
  }, []);

  // Fetch tasks when connected
  useEffect(() => {
    const fetchTasks = async () => {
      if (!isConnected) return;
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/tasks');
        setTasks(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load tasks. Please try again later.');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [isConnected]);

  const addTask = async () => {
    if (!input.trim() || !isConnected) return;
    try {
      const res = await axios.post('http://localhost:5000/api/tasks', { text: input.trim() });
      setTasks(prev => [...prev, res.data]);
      setInput('');
      setError(null);
    } catch (err) {
      setError('Failed to add task. Please try again.');
      console.error('Error adding task:', err);
    }
  };

  const deleteTask = async (id) => {
    if (!isConnected) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      setTasks(prev => prev.filter(task => task._id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10 sm:mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-2">
            ✨ Task Master
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">Organize your day, achieve your goals</p>
        </header>

        <section className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/90 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 mb-8 transition-all duration-300">
          <div className="flex gap-3 sm:gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="What's on your mind today?"
                className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-indigo-100 dark:border-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-800/50 bg-white/60 dark:bg-gray-700/60 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base sm:text-lg shadow-inner"
                aria-label="New task"
              />
              {input.trim() && (
                <span className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-0.5 rounded-md text-xs sm:text-sm">
                  Press Enter ↵
                </span>
              )}
            </div>
            <button
              onClick={addTask}
              disabled={!isConnected}
              aria-disabled={!isConnected}
              className="px-5 sm:px-7 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.03]"
            >
              <span className="text-sm sm:text-base">Add</span>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {!isConnected && (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Backend is offline; connect to add tasks.
            </p>
          )}
        </section>

        {error && (
          <div className="backdrop-blur bg-red-50/90 dark:bg-red-900/40 border-l-4 border-red-500 p-4 sm:p-6 mb-6 sm:mb-8 rounded-xl sm:rounded-2xl shadow-lg animate-shake" role="alert">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.293 19.707a1 1 0 001.414 0L19 6.414V6a2 2 0 00-2-2h-1.586L4.293 17.293a1 1 0 000 1.414z"/>
              </svg>
              <p className="text-red-700 dark:text-red-200 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 sm:py-16" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-indigo-500 border-t-transparent mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Loading your tasks...</p>
          </div>
        ) : (
          <ul className="space-y-3 sm:space-y-4">
            {tasks.map(task => (
              <li
                key={task._id}
                className="group backdrop-blur bg-white/80 dark:bg-gray-800/90 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 flex items-center justify-between hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <span className="text-base sm:text-lg text-gray-800 dark:text-gray-200 truncate">{task.text}</span>
                </div>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="ml-3 sm:ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-red-100/80 hover:bg-red-200/80 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg sm:rounded-xl flex items-center gap-2"
                  aria-label="Delete task"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  <span className="text-sm">Delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-14 sm:py-16" role="status" aria-live="polite">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 text-gray-300 dark:text-gray-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-3">
              Your task list is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
              Add a first task above and start organizing the day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
