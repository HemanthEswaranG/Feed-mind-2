import { getAuthToken } from "@/src/compat/next-auth-react";

export type FormByIdResult = {
  id: string;
  title: string;
  description?: string | null;
  isPublished?: boolean;
  questions?: unknown[];
  responses?: unknown[];
  _count?: { responses?: number };
};

type JsonBody = Record<string, unknown>;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: string }).error || "Request failed")
        : "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export async function createForm(data: JsonBody) {
  return request<FormByIdResult>("/api/forms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateForm(formId: string, data: JsonBody) {
  return request<FormByIdResult>(`/api/forms/${formId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteForm(formId: string) {
  return request<{ success: boolean }>(`/api/forms/${formId}`, {
    method: "DELETE",
  });
}

export async function publishForm(formId: string, _publish: boolean) {
  return request<FormByIdResult>(`/api/forms/${formId}/publish`, {
    method: "POST",
  });
}

export async function getUserForms() {
  return request<FormByIdResult[]>("/api/forms", {
    method: "GET",
  });
}

export async function getFormById(formId: string): Promise<FormByIdResult | null> {
  return request<FormByIdResult>(`/api/forms/${formId}`, {
    method: "GET",
  });
}

export async function addQuestion() {
  throw new Error("Question-level API is not exposed in React migration mode yet.");
}

export async function updateQuestion() {
  throw new Error("Question-level API is not exposed in React migration mode yet.");
}

export async function deleteQuestion() {
  throw new Error("Question-level API is not exposed in React migration mode yet.");
}

export async function reorderQuestions() {
  throw new Error("Question-level API is not exposed in React migration mode yet.");
}
