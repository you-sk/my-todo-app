import React, { useState, useEffect } from 'react';

export default function TodoApp() {
  const [todos, setTodos] = useState(() => {
    // 初期化時にLocalStorageからデータを読み込む
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [urlValue, setUrlValue] = useState('');

  // todosが変更されるたびにLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        url: urlValue.trim() || null,
        completed: false
      }]);
      setInputValue('');
      setUrlValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        📝 Todo アプリ
      </h1>
      
      {/* 統計表示 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          完了: {completedCount} / 全体: {totalCount}
        </p>
      </div>

      {/* 入力エリア */}
      <div className="space-y-2 mb-4">
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            追加
          </button>
        </div>
        <input
          type="url"
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="関連URLを入力（オプション）..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Todoリスト */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            タスクがありません
          </p>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className={`flex items-center p-3 border rounded-lg ${
                todo.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <span
                  className={`${
                    todo.completed 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-800'
                  }`}
                >
                  {todo.text}
                </span>
                {todo.url && (
                  <a
                    href={todo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1 text-sm text-blue-500 hover:text-blue-700 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    🔗 リンクを開く
                  </a>
                )}
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="ml-2 px-2 py-1 text-red-500 hover:bg-red-50 rounded focus:outline-none"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* クリア完了タスクボタン */}
      {completedCount > 0 && (
        <button
          onClick={() => setTodos(todos.filter(todo => !todo.completed))}
          className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          完了済みタスクを削除
        </button>
      )}
    </div>
  );
}