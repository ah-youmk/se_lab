'use client';

import { useState } from 'react';

type Category = 'Work' | 'Personal' | 'Shopping' | 'Others' | 'Home';
type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  category: Category;
  priority: Priority;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [category, setCategory] = useState<Category>('Work');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-black';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityOrder = (priority: Priority) => {
    switch (priority) {
      case 'Critical':
        return 0;
      case 'High':
        return 1;
      case 'Medium':
        return 2;
      case 'Low':
        return 3;
      default:
        return 4;
    }
  };

  const sortTasksByPriority = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      return getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
    });
    setTasks(sortedTasks);
  };

  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      const matchesSearch = task.text
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'All' || task.category === filterCategory;
      const matchesPriority =
        filterPriority === 'All' || task.priority === filterPriority;

      return matchesSearch && matchesCategory && matchesPriority;
    });
  };

  const getStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    const categoryStats = {
      Work: tasks.filter((task) => task.category === 'Work').length,
      Personal: tasks.filter((task) => task.category === 'Personal').length,
      Shopping: tasks.filter((task) => task.category === 'Shopping').length,
      Others: tasks.filter((task) => task.category === 'Others').length,
      Home: tasks.filter((task) => task.category === 'Home').length,
    };

    const priorityStats = {
      Critical: tasks.filter((task) => task.priority === 'Critical').length,
      High: tasks.filter((task) => task.priority === 'High').length,
      Medium: tasks.filter((task) => task.priority === 'Medium').length,
      Low: tasks.filter((task) => task.priority === 'Low').length,
    };

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      categoryStats,
      priorityStats,
    };
  };

  const add_task = () => {
    if (newTask.trim() !== '') {
      const task: Task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toLocaleString(),
        category: category,
        priority: priority,
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

  const saveTasksToFile = () => {
    const dataToSave = {
      tasks: tasks,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const dataStr = JSON.stringify(dataToSave, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validate the JSON structure
        if (data.tasks && Array.isArray(data.tasks)) {
          // Validate each task has required properties
          const isValidFormat = data.tasks.every(
            (task: any) =>
              task.hasOwnProperty('id') &&
              task.hasOwnProperty('text') &&
              task.hasOwnProperty('completed') &&
              task.hasOwnProperty('category') &&
              task.hasOwnProperty('priority')
          );

          if (isValidFormat) {
            setTasks(data.tasks);
            setSelectedTaskId(null);
            alert('Tasks imported successfully!');
          } else {
            alert(
              'Invalid file format. Please check that the JSON contains valid task data.'
            );
          }
        } else {
          alert('Invalid file format. Expected a JSON file with tasks array.');
        }
      } catch (error) {
        alert("Error reading file. Please make sure it's a valid JSON file.");
      }
    };

    reader.readAsText(file);
    // Reset the input value so the same file can be imported again
    event.target.value = '';
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
              value={category}
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Shopping">Shopping</option>
              <option value="Others">Others</option>
              <option value="Home">Home</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              onChange={(e) => setPriority(e.target.value as Priority)}
              value={priority}
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
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
            <button
              onClick={sortTasksByPriority}
              disabled={tasks.length === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Sort by Priority
            </button>
            <button
              onClick={() => setShowStatsDialog(true)}
              disabled={tasks.length === 0}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              📊 Stats
            </button>
            <button
              onClick={saveTasksToFile}
              disabled={tasks.length === 0}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              💾 Save
            </button>
            <label className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium cursor-pointer">
              📂 Import
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search & Filter
          </h3>
          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Tasks
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by task name..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Category
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  onChange={(e) =>
                    setFilterCategory(e.target.value as Category | 'All')
                  }
                  value={filterCategory}
                >
                  <option value="All">All Categories</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Others">Others</option>
                  <option value="Home">Home</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Priority
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  onChange={(e) =>
                    setFilterPriority(e.target.value as Priority | 'All')
                  }
                  value={filterPriority}
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('All');
                  setFilterPriority('All');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tasks ({getFilteredTasks().length} of {tasks.length})
            </h2>

            {/* Active Filters Indicator */}
            {(searchTerm ||
              filterCategory !== 'All' ||
              filterPriority !== 'All') && (
              <div className="flex gap-2 flex-wrap">
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
                    Search: "{searchTerm}"
                  </span>
                )}
                {filterCategory !== 'All' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
                    Category: {filterCategory}
                  </span>
                )}
                {filterPriority !== 'All' && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs">
                    Priority: {filterPriority}
                  </span>
                )}
              </div>
            )}
          </div>

          {getFilteredTasks().length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {tasks.length === 0
                ? 'No tasks yet. Add one above!'
                : 'No tasks match your current filters.'}
            </p>
          ) : (
            <div className="space-y-2">
              {getFilteredTasks().map((task) => (
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {task.category}
                        </span>
                      </div>
                      <span
                        className={`${
                          task.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {task.text}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {task.createdAt}
                      </div>
                    </div>
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

      {/* Stats Dialog */}
      {showStatsDialog && (
        <div
          className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowStatsDialog(false)}
        >
          <div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/20 dark:border-gray-700/50 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                📊 Task Statistics
              </h2>
              <button
                onClick={() => setShowStatsDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            {(() => {
              const stats = getStats();
              return (
                <div className="space-y-6">
                  {/* Overall Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Overall Summary
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {stats.totalTasks}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Tasks
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stats.completedTasks}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Completed
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {stats.pendingTasks}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Pending
                        </div>
                      </div>
                    </div>
                    {stats.totalTasks > 0 && (
                      <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        Completion Rate:{' '}
                        {Math.round(
                          (stats.completedTasks / stats.totalTasks) * 100
                        )}
                        %
                      </div>
                    )}
                  </div>

                  {/* Category Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Tasks by Category
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats.categoryStats).map(
                        ([category, count]) => (
                          <div
                            key={category}
                            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                          >
                            <span className="font-medium text-gray-900 dark:text-white">
                              {category}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Priority Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Tasks by Priority
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats.priorityStats).map(
                        ([priority, count]) => (
                          <div
                            key={priority}
                            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                  priority as Priority
                                )}`}
                              >
                                {priority}
                              </span>
                            </span>
                            <span className="px-2 py-1 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-full text-sm font-medium">
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
