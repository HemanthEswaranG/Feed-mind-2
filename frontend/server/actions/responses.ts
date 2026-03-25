import { getAuthToken } from "@/src/compat/next-auth-react";

type RequestOptions = RequestInit & {
  skipContentType?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.skipContentType ? {} : { "Content-Type": "application/json" }),
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

export async function submitResponse(
  formId: string,
  data: {
    answers: Array<{ questionId: string; value: string }>;
    respondentEmail?: string;
    metadata?: object;
  }
) {
  return request<{ success: boolean; responseId: string }>(`/api/submit/${formId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getFormResponses(formId: string) {
  return request<Array<unknown>>(`/api/forms/${formId}/responses`, {
    method: "GET",
  });
}

export async function getAllResponses() {
  return request<Array<unknown>>("/api/forms/responses/all", {
    method: "GET",
  });
}

export async function markResponseAsSpam(responseId: string) {
  return request(`/api/forms/responses/${responseId}/spam`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function flagResponse(responseId: string, flagged: boolean) {
  return request(`/api/forms/responses/${responseId}/flag`, {
    method: "PATCH",
    body: JSON.stringify({ flagged }),
  });
}

export async function deleteResponse(responseId: string) {
  return request<{ success: boolean }>(`/api/forms/responses/${responseId}`, {
    method: "DELETE",
  });
}
