import express from "express";
import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { Todo } from "./src/models/todo.model.js";
import cors from "cors";

const port = 3000;

app.use(cors());
app.use(express.json());

connectDB();

const httpServer = createServer(app);
const io = new Server(httpServer, {
   cors: { origin: "*", methods: ["GET", "POST"] }
});

// GET route to load tasks on page refresh
app.get("/todos", async (req, res) => {
   try {
      const todos = await Todo.find().sort({ createdAt: 1 });
      console.log("➡️ Refresh requested! Found todos in DB:", todos.length);
      const formattedTodos = todos.map(t => ({
         id: t._id.toString(),
         value: t.value
      }));
      res.json(formattedTodos);
   } catch (error) {
      console.error("❌ Error fetching todos on refresh:", error);
      res.status(500).json({ error: "Failed to fetch todos" });
   }
});

io.on("connection", (socket) => {
   socket.on("add-todo", async (data) => {
      try {
         const newTodo = await Todo.create({ value: data.value });
         io.emit("send-todo", { id: newTodo._id.toString(), value: newTodo.value });
      } catch (err) {
         console.error(err);
      }
   });

   socket.on("update-todo", async ({ id, value }) => {
      try {
         const updated = await Todo.findByIdAndUpdate(id, { value }, { new: true });
         if (updated) {
            io.emit("todo-updated", { id: updated._id.toString(), value: updated.value });
         }
      } catch (err) {
         console.error(err);
      }
   });

   socket.on("delete-todo", async ({ id }) => {
      try {
         await Todo.findByIdAndDelete(id);
         io.emit("todo-deleted", { id });
      } catch (err) {
         console.error(err);
      }
   });
});

httpServer.listen(port, () => {
   console.log(`Server running on port ${port}`);
});