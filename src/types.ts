export type Priority = '高' | '中' | '低';

export interface Todo {
  id: string;
  title: string;
  content: string;
  due_date: string; // "YYYY-MM-DD" or ""
  priority: Priority;
  done: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoInput {
  title: string;
  content: string;
  due_date: string;
  priority: Priority;
}
