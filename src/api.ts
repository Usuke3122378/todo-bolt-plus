import { API_URL } from '@/config';
import type { Todo, TodoInput, Priority } from '@/types';

async function postJson(body: unknown): Promise<unknown> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`通信エラー (HTTP ${res.status})`);
  }
  return res.json();
}

function assertOk(data: unknown, message = '操作に失敗しました'): void {
  if (typeof data !== 'object' || data === null || (data as Record<string, unknown>).ok !== true) {
    const err = (data as Record<string, unknown> | null)?.error;
    throw new Error(typeof err === 'string' ? err : message);
  }
}

function asTodo(v: unknown): Todo {
  const o = v as Record<string, unknown>;
  return {
    id: String(o.id),
    title: String(o.title ?? ''),
    content: String(o.content ?? ''),
    due_date: typeof o.due_date === 'string' ? o.due_date : '',
    priority: (['高', '中', '低'].includes(o.priority as string) ? o.priority : '中') as Priority,
    done: Boolean(o.done),
    created_at: String(o.created_at ?? ''),
    updated_at: String(o.updated_at ?? ''),
  };
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`通信エラー (HTTP ${res.status})`);
  const data = await res.json();
  assertOk(data, '一覧の取得に失敗しました');
  const list = (data as Record<string, unknown>).todos;
  return Array.isArray(list) ? list.map(asTodo) : [];
}

export async function createTodo(input: TodoInput): Promise<Todo> {
  const data = await postJson({ action: 'create', todo: input });
  assertOk(data, '登録に失敗しました');
  return asTodo((data as Record<string, unknown>).todo);
}

export async function updateTodo(id: string, patch: Partial<TodoInput> & { done?: boolean }): Promise<Todo> {
  const data = await postJson({ action: 'update', id, todo: patch });
  assertOk(data, '更新に失敗しました');
  return asTodo((data as Record<string, unknown>).todo);
}

export async function deleteTodo(id: string): Promise<void> {
  const data = await postJson({ action: 'delete', id });
  assertOk(data, '削除に失敗しました');
}
