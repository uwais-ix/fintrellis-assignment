import { getAccessToken } from "./access-token";
import { API_BASE_URL } from "./config";

export interface ProblemInput {
  status: number;
  title: string;
  detail: string;
  fieldErrors?: Record<string, string>;
  requestId?: string;
}

export class ApiProblem extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail: string;
  readonly fieldErrors: Record<string, string>;
  readonly requestId: string | null;

  constructor(input: ProblemInput) {
    super(input.detail);
    this.name = "ApiProblem";
    this.status = input.status;
    this.title = input.title;
    this.detail = input.detail;
    this.fieldErrors = input.fieldErrors ?? {};
    this.requestId = input.requestId ?? null;
  }

  static offline(): ApiProblem {
    return new ApiProblem({
      status: 0,
      title: "Cannot reach the service",
      detail: "Check that the API is running, then try again.",
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function readFieldErrors(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([field, message]) => [field, message]),
  );
}

async function readProblem(response: Response): Promise<ApiProblem> {
  let body: unknown;
  try {
    const type = response.headers.get("content-type") ?? "";
    body = type.includes("json") ? await response.json() : undefined;
  } catch {
    body = undefined;
  }
  const problem = isRecord(body) ? body : {};
  return new ApiProblem({
    status: response.status,
    title: text(problem.title, "Request failed"),
    detail: text(problem.detail, "The service could not complete this request."),
    fieldErrors: readFieldErrors(problem.fieldErrors),
    requestId: typeof problem.requestId === "string" ? problem.requestId : undefined,
  });
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({ Accept: "application/json, application/problem+json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw ApiProblem.offline();
  }

  if (!response.ok) throw await readProblem(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
