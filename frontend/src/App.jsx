import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // ✅ Use environment variable for backend API
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ✅ Check backend connection once
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await axios.get(`${API_BASE}/`);
        if (res.status === 200) {
          setIsConnected(true);
          setError(null);
        }
      } catch {
        setIsConnected(false);
        setError(
          "Backend is offline or waking up. Please wait a few seconds."
        );
      }
    };
    checkConnection();
  }, [API_BASE]);

  // ✅ Fetch tasks when connected
  useEffect(() => {
    const fetchTasks = async () => {
      if (!isConnected) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/tasks`);
        setTasks(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load tasks. Please try again later.");
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [isConnected, API_BASE]);

  // ✅ Add a new task
  const addTask = async () => {
    if (!input.trim() || !isConnected) return;
    try {
      const res = await axios.post(`${API_BASE}/api/tasks`, {
        text: input.trim(),
      });
      setTasks((prev) => [...prev, res.data]);
      setInput("");
      setError(null);
    } catch (err) {
      setError("Failed to add task. Please try again.");
      console.error("Error adding task:", err);
    }
  };

  // ✅ Delete a task
  const deleteTask = async (id) => {
    if (!isConnected) return;
    try {
      await axios.delete(`${API_BASE}/api/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error("Error deleting task:", err);
    }
  };

  // ✅ UI starts here
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-2">
            ✨ Task Master
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Organize your day, achieve your goals
          </p>
        </header>

        {/* Input and Add button */}
        <section className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/90 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 mb-8 transition-all duration-300">
          <div className="flex gap-3 sm:gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="What's on your mind today?"
              className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-indigo-100 dark:border-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-800/50 bg-white/60 dark:bg-gray-700/60 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base sm:text-lg shadow-inner"
            />
            <button
              onClick={addTask}
              disabled={!isConnected}
              className="px-5 sm:px-7 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {!isConnected && (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Backend is offline; connect to add tasks.
            </p>
          )}
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-lg">
            <p className="text-red-700 dark:text-red-200 text-sm sm:text-base">
              {error}
            </p>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Loading your tasks...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-14">
            <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-3">
              Your task list is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add your first task above and start organizing your day.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 sm:space-y-4">
            {tasks.map((task) => (
              <li
                key={task._id}
                className="group bg-white/80 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 flex items-center justify-between"
              >
                <span className="text-gray-800 dark:text-gray-200">
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
