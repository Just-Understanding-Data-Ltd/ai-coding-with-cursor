from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4, UUID
import sqlite3
import os
import logging

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class Todo(BaseModel):
    id: UUID
    task: str
    completed: bool = False

# Database setup
DB_NAME = "todos.db"

def init_db():
    if not os.path.exists(DB_NAME):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE todos (
                id TEXT PRIMARY KEY,
                task TEXT NOT NULL,
                completed BOOLEAN NOT NULL
            )
        ''')
        conn.commit()
        conn.close()

init_db()

@app.get("/todos")
async def get_todos():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM todos")
    todos = [Todo(id=UUID(row[0]), task=row[1], completed=bool(row[2])) for row in cursor.fetchall()]
    conn.close()
    return todos

@app.post("/todos")
async def create_todo(todo: Todo):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO todos (id, task, completed) VALUES (?, ?, ?)",
                   (str(todo.id), todo.task, todo.completed))
    conn.commit()
    conn.close()
    return todo

@app.put("/todos/{todo_id}")
async def update_todo(todo_id: UUID, task: Optional[str] = None, completed: Optional[bool] = None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    if task is not None:
        cursor.execute("UPDATE todos SET task = ? WHERE id = ?", (task, str(todo_id)))
    if completed is not None:
        cursor.execute("UPDATE todos SET completed = ? WHERE id = ?", (completed, str(todo_id)))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Todo not found")
    
    conn.commit()
    cursor.execute("SELECT * FROM todos WHERE id = ?", (str(todo_id),))
    todo = cursor.fetchone()
    conn.close()
    return Todo(id=UUID(todo[0]), task=todo[1], completed=bool(todo[2]))

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: UUID):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM todos WHERE id = ?", (str(todo_id),))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Todo not found")
    conn.commit()
    conn.close()
    return {"message": "Todo deleted successfully"}

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()