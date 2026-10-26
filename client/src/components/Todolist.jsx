import React, { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/Tasks';

// Daily to-do list for the Employee - write, check off, and delete today's missions.
const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null); // id of the task being renamed
  const [editTitle, setEditTitle] = useState('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks(); // defaults to today's missions
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message || 'تعذر تحميل المهام');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await createTask({ title: newTitle.trim() });
      setTasks((prev) => [...prev, res.data]);
      setNewTitle('');
    } catch (err) {
      setError(err.message || 'تعذر إضافة المهمة');
    } finally {
      setAdding(false);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const res = await updateTask(task._id, { isCompleted: !task.isCompleted });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      setError(err.message || 'تعذر تحديث المهمة');
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEdit = async (task) => {
    if (!editTitle.trim()) return;
    try {
      const res = await updateTask(task._id, { title: editTitle.trim() });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
      cancelEdit();
    } catch (err) {
      setError(err.message || 'تعذر تعديل المهمة');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message || 'تعذر حذف المهمة');
    }
  };

  const todayLabel = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-md space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">مهام اليوم</h3>
        <p className="text-xs text-gray-500">{todayLabel}</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="اكتب مهمة جديدة..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white
                     text-sm font-medium rounded-md px-4 transition-colors"
        >
          إضافة
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">...جاري التحميل</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500 text-sm">لا يوجد مهام مسجلة لهذا اليوم</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex items-center gap-3 bg-gray-50 rounded-md px-3 py-2"
            >
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => toggleComplete(task)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              {editingId === task._id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(task);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                    className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => saveEdit(task)}
                    disabled={!editTitle.trim()}
                    className="text-xs font-medium text-white bg-green-600 hover:bg-green-700
                               disabled:bg-gray-300 rounded px-2 py-1 transition-colors"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs font-medium text-gray-800 bg-gray-200 hover:bg-gray-300
                               rounded px-2 py-1 transition-colors"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {task.title}
                  </span>
                  <button
                    onClick={() => startEdit(task)}
                    className="text-xs font-medium text-white bg-amber-500 hover:bg-amber-600
                               rounded px-2 py-1 transition-colors"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-xs font-medium text-white bg-red-500 hover:bg-red-600
                               rounded px-2 py-1 transition-colors"
                  >
                    حذف
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList;