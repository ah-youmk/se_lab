'use client';

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Category = 'Work' | 'Personal' | 'Shopping' | 'Others' | 'Home';
type TransactionType = 'income' | 'expense';

interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  description: string;
  category: Category;
  createdAt: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [category, setCategory] = useState<Category>('Personal');
  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterType, setFilterType] = useState<TransactionType | 'All'>('All');
  const [activeTab, setActiveTab] = useState<
    'transactions' | 'analytics' | 'budget'
  >('transactions');
  const [budget, setBudget] = useState<number>(0);
  const [budgetInput, setBudgetInput] = useState<string>('');

  const getTypeColor = (type: TransactionType) => {
    return type === 'income'
      ? 'bg-green-600 text-white'
      : 'bg-red-600 text-white';
  };

  const getFilteredTransactions = () => {
    return transactions.filter((transaction) => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'All' || transaction.category === filterCategory;
      const matchesType =
        filterType === 'All' || transaction.type === filterType;

      return matchesSearch && matchesCategory && matchesType;
    });
  };

  const getCurrentBalance = () => {
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'income'
        ? balance + transaction.amount
        : balance - transaction.amount;
    }, 0);
  };

  // Analytics calculation functions
  const getAnalyticsData = () => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const totalTransactions = transactions.length;

    // Calculate average monthly expense (assuming current month for simplicity)
    const avgMonthlyExpense = totalExpenses; // For demo purposes, can be enhanced with actual monthly calculation

    // Find largest expense
    const expenseTransactions = transactions.filter(
      (t) => t.type === 'expense'
    );
    const largestExpense =
      expenseTransactions.length > 0
        ? Math.max(...expenseTransactions.map((t) => t.amount))
        : 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      totalTransactions,
      avgMonthlyExpense,
      largestExpense,
    };
  };

  const getCategoryDistribution = () => {
    const expensesByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<Category, number>);

    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
      color: getCategoryColor(category as Category),
    }));
  };

  const getIncomeVsExpenseData = () => {
    // Group by month (simplified - using just one data point for demo)
    const incomeTotal = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseTotal = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      {
        name: 'Current Period',
        income: incomeTotal,
        expense: expenseTotal,
      },
    ];
  };

  const getCategoryColor = (category: Category) => {
    const colors = {
      Work: '#3B82F6',
      Personal: '#10B981',
      Shopping: '#F59E0B',
      Others: '#8B5CF6',
      Home: '#EF4444',
    };
    return colors[category];
  };

  // Budget related functions
  const setBudgetAmount = () => {
    const numBudget = parseFloat(budgetInput);
    if (!isNaN(numBudget) && numBudget > 0) {
      setBudget(numBudget);
      setBudgetInput('');
    }
  };

  const getBudgetData = () => {
    const totalSpent = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = budget - totalSpent;
    const percentageSpent = budget > 0 ? (totalSpent / budget) * 100 : 0;

    return {
      budget,
      spent: totalSpent,
      remaining: Math.max(0, remaining),
      percentageSpent: Math.min(100, percentageSpent),
    };
  };

  const addTransaction = () => {
    const numAmount = parseFloat(amount);
    if (
      amount.trim() !== '' &&
      !isNaN(numAmount) &&
      numAmount > 0 &&
      description.trim() !== ''
    ) {
      const transaction: Transaction = {
        id: Date.now(),
        amount: numAmount,
        type: transactionType,
        description: description.trim(),
        category: category,
        createdAt: new Date().toLocaleString(),
      };
      setTransactions([...transactions, transaction]);
      setAmount('');
      setDescription('');
    }
  };

  const deleteTransaction = () => {
    if (selectedTransactionId !== null) {
      setTransactions(
        transactions.filter(
          (transaction) => transaction.id !== selectedTransactionId
        )
      );
      setSelectedTransactionId(null);
    }
  };

  const clearAllTransactions = () => {
    setTransactions([]);
    setSelectedTransactionId(null);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Description'];
    const csvData = [
      headers.join(','),
      ...transactions.map((transaction) =>
        [
          `"${transaction.createdAt}"`,
          transaction.type,
          transaction.amount,
          transaction.category,
          `"${transaction.description}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallet-transactions-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Personal Wallet Manager
            </h1>
            <div className="text-3xl font-bold">
              <span className="text-gray-600 dark:text-gray-400">
                Current Balance:{' '}
              </span>
              <span
                className={
                  getCurrentBalance() >= 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                ${getCurrentBalance().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'transactions'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'budget'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Budget
              </button>
            </div>
          </div>

          {/* Conditional Content Based on Active Tab */}
          {activeTab === 'transactions' && (
            <>
              {/* Add Transaction Section */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount..."
                    step="0.01"
                    min="0"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTransaction()}
                    placeholder="Description..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    onChange={(e) =>
                      setTransactionType(e.target.value as TransactionType)
                    }
                    value={transactionType}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    onChange={(e) => setCategory(e.target.value as Category)}
                    value={category}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Others">Others</option>
                    <option value="Home">Home</option>
                  </select>
                  <button
                    onClick={addTransaction}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Add Transaction
                  </button>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by description..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex gap-4 items-center">
                  <select
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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

                  <select
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    onChange={(e) =>
                      setFilterType(e.target.value as TransactionType | 'All')
                    }
                    value={filterType}
                  >
                    <option value="All">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>

                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('All');
                      setFilterType('All');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                </div>

                {(searchTerm ||
                  filterCategory !== 'All' ||
                  filterType !== 'All') && (
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
                    {filterType !== 'All' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs">
                        Type: {filterType}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Scrollable Middle Section */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {activeTab === 'transactions' ? (
              // Transactions View
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Transactions ({getFilteredTransactions().length} of{' '}
                    {transactions.length})
                  </h2>
                </div>

                <div className="p-4">
                  {getFilteredTransactions().length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      {transactions.length === 0
                        ? 'No transactions yet. Add one above!'
                        : 'No transactions match your current filters.'}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                              Type
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                              Amount
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                              Category
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                              Description
                            </th>
                            <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredTransactions().map((transaction) => (
                            <tr
                              key={transaction.id}
                              onClick={() =>
                                setSelectedTransactionId(transaction.id)
                              }
                              className={`border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                                selectedTransactionId === transaction.id
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                  : ''
                              }`}
                            >
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                    transaction.type
                                  )}`}
                                >
                                  {transaction.type.charAt(0).toUpperCase() +
                                    transaction.type.slice(1)}
                                </span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`font-semibold ${
                                    transaction.type === 'income'
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {transaction.type === 'income' ? '+' : '-'}$
                                  {transaction.amount.toFixed(2)}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {transaction.category}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-900 dark:text-white">
                                    {transaction.description}
                                  </span>
                                  {selectedTransactionId === transaction.id && (
                                    <span className="text-blue-500 text-xs font-medium ml-2">
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {transaction.createdAt}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'analytics' ? (
              // Analytics View
              <div className="space-y-6">
                {/* Financial Statistics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Financial Statistics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(() => {
                      const analytics = getAnalyticsData();
                      return (
                        <>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
                              Total Income
                            </h3>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                              ${analytics.totalIncome.toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                              Total Expenses
                            </h3>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                              ${analytics.totalExpenses.toFixed(2)}
                            </p>
                          </div>
                          <div
                            className={`${
                              analytics.netSavings >= 0
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'bg-orange-50 dark:bg-orange-900/20'
                            } p-4 rounded-lg`}
                          >
                            <h3
                              className={`text-sm font-medium ${
                                analytics.netSavings >= 0
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-orange-600 dark:text-orange-400'
                              }`}
                            >
                              Net Savings
                            </h3>
                            <p
                              className={`text-2xl font-bold ${
                                analytics.netSavings >= 0
                                  ? 'text-blue-700 dark:text-blue-300'
                                  : 'text-orange-700 dark:text-orange-300'
                              }`}
                            >
                              ${analytics.netSavings.toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                              Total Transactions
                            </h3>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                              {analytics.totalTransactions}
                            </p>
                          </div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                              Avg Monthly Expense
                            </h3>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                              ${analytics.avgMonthlyExpense.toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                              Largest Expense
                            </h3>
                            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                              ${analytics.largestExpense.toFixed(2)}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Expense Distribution by Category */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Expense Distribution by Category
                    </h3>
                    {getCategoryDistribution().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getCategoryDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) =>
                              `${name}: $${Number(value).toFixed(0)}`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getCategoryDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `$${Number(value).toFixed(2)}`,
                              'Amount',
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                        No expense data available
                      </div>
                    )}
                  </div>

                  {/* Income vs Expense Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Income vs Expense
                    </h3>
                    {transactions.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getIncomeVsExpenseData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [
                              `$${Number(value).toFixed(2)}`,
                              '',
                            ]}
                          />
                          <Legend />
                          <Bar dataKey="income" fill="#10B981" name="Income" />
                          <Bar
                            dataKey="expense"
                            fill="#EF4444"
                            name="Expense"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                        No transaction data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'budget' ? (
              // Budget View
              <div className="space-y-6">
                {/* Set Budget Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Set Your Budget
                  </h2>
                  <div className="flex gap-4 items-center">
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && setBudgetAmount()}
                      placeholder="Enter budget amount..."
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={setBudgetAmount}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Set Budget
                    </button>
                  </div>
                  {budget > 0 && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      Current budget: ${budget.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Budget Progress Section */}
                {budget > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Budget Progress
                    </h3>
                    {(() => {
                      const budgetData = getBudgetData();
                      return (
                        <>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <span>
                                Budget: ${budgetData.budget.toFixed(2)}
                              </span>
                              <span>Spent: ${budgetData.spent.toFixed(2)}</span>
                              <span>
                                Remaining: ${budgetData.remaining.toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                              <div
                                className={`h-4 rounded-full transition-all duration-300 ${
                                  budgetData.percentageSpent <= 50
                                    ? 'bg-green-500'
                                    : budgetData.percentageSpent <= 80
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    budgetData.percentageSpent
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {budgetData.percentageSpent.toFixed(1)}% of budget
                              used
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Budget Notice Section */}
                {budget > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div
                      className={`p-4 rounded-lg ${
                        getBudgetData().percentageSpent <= 50
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : getBudgetData().percentageSpent <= 80
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                          : getBudgetData().percentageSpent < 100
                          ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <p
                        className={`text-center font-medium ${
                          getBudgetData().percentageSpent <= 50
                            ? 'text-green-700 dark:text-green-300'
                            : getBudgetData().percentageSpent <= 80
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : getBudgetData().percentageSpent < 100
                            ? 'text-orange-700 dark:text-orange-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}
                      >
                        {getBudgetData().percentageSpent >= 100
                          ? `You have exceeded your budget by ${(
                              getBudgetData().percentageSpent - 100
                            ).toFixed(1)}%!`
                          : `You have spent ${getBudgetData().percentageSpent.toFixed(
                              1
                            )}% of your budget`}
                      </p>
                    </div>
                  </div>
                )}

                {/* No Budget Set Message */}
                {budget === 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No budget set yet. Set a budget above to track your
                        spending progress.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Sticky Footer - Utility Buttons (only for transactions tab) */}
      {activeTab === 'transactions' && (
        <footer className="sticky bottom-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={deleteTransaction}
                disabled={selectedTransactionId === null}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Delete Selected
              </button>
              <button
                onClick={clearAllTransactions}
                disabled={transactions.length === 0}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Clear All
              </button>
              <button
                onClick={exportToCSV}
                disabled={transactions.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                📄 Export CSV
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
