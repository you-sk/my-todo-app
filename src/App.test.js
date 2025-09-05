import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// LocalStorageのモック
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TodoApp', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('初期状態で「タスクがありません」と表示される', () => {
    render(<App />);
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  test('新しいタスクを追加できる', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    const addButton = screen.getByText('追加');

    userEvent.type(input, 'テストタスク');
    fireEvent.click(addButton);

    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(screen.queryByText('タスクがありません')).not.toBeInTheDocument();
  });

  test('Enterキーでタスクを追加できる', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('新しいタスクを入力...');

    userEvent.type(input, 'テストタスク{enter}');
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });

  test('タスクを完了状態に切り替えられる', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    userEvent.type(input, 'テストタスク{enter}');

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const taskText = screen.getByText('テストタスク');
    expect(taskText).toHaveClass('line-through');
  });

  test('タスクを削除できる', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    userEvent.type(input, 'テストタスク{enter}');

    const deleteButton = screen.getByText('🗑️');
    fireEvent.click(deleteButton);

    expect(screen.queryByText('テストタスク')).not.toBeInTheDocument();
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  test('完了済みタスクを一括削除できる', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    
    // 2つのタスクを追加
    userEvent.type(input, 'タスク1{enter}');
    userEvent.type(input, 'タスク2{enter}');

    // 1つ目のタスクを完了状態にする
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    // 完了済みタスクを削除
    const clearButton = screen.getByText('完了済みタスクを削除');
    fireEvent.click(clearButton);

    expect(screen.queryByText('タスク1')).not.toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
  });

  test('タスクの統計が正しく表示される', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    
    // 2つのタスクを追加
    userEvent.type(input, 'タスク1{enter}');
    userEvent.type(input, 'タスク2{enter}');

    // 1つ目のタスクを完了状態にする
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText('完了: 1 / 全体: 2')).toBeInTheDocument();
  });

  test('LocalStorageにタスクが保存される', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    userEvent.type(input, 'テストタスク{enter}');

    expect(localStorage.setItem).toHaveBeenCalled();
    const savedTodos = JSON.parse(localStorage.setItem.mock.calls[localStorage.setItem.mock.calls.length - 1][1]);
    expect(savedTodos[0].text).toBe('テストタスク');
  });

  test('URLを含むタスクを追加できる', () => {
    render(<App />);
    const taskInput = screen.getByPlaceholderText('新しいタスクを入力...');
    const urlInput = screen.getByPlaceholderText('関連URLを入力（オプション）...');
    const addButton = screen.getByText('追加');

    userEvent.type(taskInput, 'ドキュメントを読む');
    userEvent.type(urlInput, 'https://example.com');
    fireEvent.click(addButton);

    expect(screen.getByText('ドキュメントを読む')).toBeInTheDocument();
    expect(screen.getByText('🔗 リンクを開く')).toBeInTheDocument();
  });

  test('URLリンクが新しいタブで開く', () => {
    render(<App />);
    const taskInput = screen.getByPlaceholderText('新しいタスクを入力...');
    const urlInput = screen.getByPlaceholderText('関連URLを入力（オプション）...');
    
    userEvent.type(taskInput, 'テストタスク{enter}');
    userEvent.type(urlInput, 'https://example.com');
    
    const addButton = screen.getByText('追加');
    fireEvent.click(addButton);

    const link = screen.getByText('🔗 リンクを開く');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('URLなしでもタスクを追加できる', () => {
    render(<App />);
    const taskInput = screen.getByPlaceholderText('新しいタスクを入力...');
    userEvent.type(taskInput, 'URLなしタスク{enter}');

    expect(screen.getByText('URLなしタスク')).toBeInTheDocument();
    expect(screen.queryByText('🔗 リンクを開く')).not.toBeInTheDocument();
  });
});