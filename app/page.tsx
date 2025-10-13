'use client';

import { useState } from 'react';

type Category = 'Work' | 'Personal' | 'Shopping' | 'Others' | 'Home';
interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  category: Category;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [category, setCategory] = useState<Category>('Work');

  const add_task = () => {
    if (newTask.trim() !== '') {
      const task: Task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toLocaleString(),
        category: category,
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const delete_task = () => {
    if (selectedTaskId !== null) {
      setTasks(tasks.filter((task) => task.id !== selectedTaskId));
      setSelectedTaskId(null);
    }
  };

  const clear_task = () => {
    setTasks([]);
    setSelectedTaskId(null);
  };

  const mark_done = () => {
    if (selectedTaskId !== null) {
      setTasks(
        tasks.map((task) =>
          task.id === selectedTaskId
            ? { ...task, completed: !task.completed }
            : task
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Todo List App
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && add_task()}
              placeholder="Enter a new task..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Shopping">Shopping</option>
              <option value="Others">Others</option>
              <option value="Home">Home</option>
            </select>
            <button
              onClick={add_task}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Add Task
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={delete_task}
              disabled={selectedTaskId === null}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Delete Selected
            </button>
            <button
              onClick={mark_done}
              disabled={selectedTaskId === null}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Toggle Complete
            </button>
            <button
              onClick={clear_task}
              disabled={tasks.length === 0}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tasks ({tasks.length})
          </h2>

          {tasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No tasks yet. Add one above!
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTaskId === task.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  } ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {task.completed && (
                        <svg
                          className="w-2 h-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`flex-1 ${
                        task.completed
                          ? 'line-through text-gray-500 dark:text-gray-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {'['}
                      {task.category}
                      {']'} {task.text} - {'['}
                      {task.createdAt}
                      {']'}
                    </span>
                    {selectedTaskId === task.id && (
                      <span className="text-blue-500 text-sm font-medium">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
