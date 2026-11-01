import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Automatically switches between local development and Render production
const BACKEND_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://backend-todo-app-api.onrender.com"; // Replace with your actual Render backend service URL when ready

const socket = io(BACKEND_URL);

const App = () => {
  const [todos, setTodos] = useState([]);
  const [value, setValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    // Fetch persisted todos from MongoDB on page load/refresh
    fetch(`${BACKEND_URL}/todos`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched from backend on refresh:", data);
        setTodos(data);
      })
      .catch((err) => console.error("Failed to fetch initial todos:", err));

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("send-todo", (data) => {
      setTodos((prev) => {
        if (prev.some((t) => t.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    socket.on("todo-updated", (updatedTodo) => {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
    });

    socket.on("todo-deleted", ({ id }) => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("send-todo");
      socket.off("todo-updated");
      socket.off("todo-deleted");
    };
  }, []);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!value.trim()) return;

    socket.emit("add-todo", { value: value.trim() });
    setValue("");
  };

  const handleDeleteTodo = (id) => {
    socket.emit("delete-todo", { id });
  };

  const handleSaveEdit = (id) => {
    if (!editingValue.trim()) return;
    socket.emit("update-todo", { id, value: editingValue.trim() });
    setEditingId(null);
    setEditingValue("");
  };

  return (
    <div
      className="min-h-screen text-[#2D3748] flex flex-col items-center justify-center p-4 selection:bg-[#B85042] selection:text-white"
      style={{ backgroundColor: "#E7E8D1" }}
    >
      <main className="relative w-full max-w-lg bg-white/90 backdrop-blur-md border border-[#A7BEAE]/40 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        <header className="flex items-center justify-between border-b border-[#A7BEAE]/30 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "#B85042" }}>
              Live Workspace
            </h1>
            <p className="text-xs font-medium mt-0.5" style={{ color: "#718096" }}>
              Real-time collaborative tasks
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-xs" style={{ backgroundColor: "#E7E8D1", borderColor: "#A7BEAE" }}>
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-600 animate-pulse" : "bg-rose-500"}`} />
            <span className="text-xs font-bold tracking-wide" style={{ color: "#B85042" }}>
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </header>

        <form onSubmit={handleAddTodo} className="flex gap-2.5">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write a new task..."
            className="flex-1 border rounded-2xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200"
            style={{ backgroundColor: "#E7E8D1", borderColor: "#A7BEAE" }}
          />
          <button
            type="submit"
            className="active:scale-95 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90"
            style={{ backgroundColor: "#B85042" }}
          >
            Add Task
          </button>
        </form>

        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-2xl" style={{ backgroundColor: "#E7E8D1", borderColor: "#A7BEAE" }}>
              <p className="text-sm font-semibold" style={{ color: "#B85042" }}>
                No tasks added yet. Start adding your goals!
              </p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-center justify-between gap-3 bg-white border p-4 rounded-2xl transition-all duration-200 shadow-xs hover:shadow-md"
                  style={{ borderColor: "#A7BEAE" }}
                >
                  {editingId === todo.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}