import type {
  ArtifactContentResponse,
  CatalogSnapshot,
  MetaResponse,
  OpenApplication,
  OpenPathResponse,
  OpenTarget,
  RevealApplication,
  RevealResponse,
  TaskDetailResponse,
  TaskHealthResponse,
} from './types';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class ApiClient {
  private async request<T>(path: string, signal?: AbortSignal, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(path, {
        cache: 'no-store',
        signal,
        ...init,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new ApiError(0, 'Could not reach the local Longrein dashboard backend.');
    }
    if (!response.ok) {
      let message = `${response.status} ${response.statusText}`;
      try {
        const body = (await response.json()) as { error?: string; message?: string };
        message = body.message ?? body.error ?? message;
      } catch {
        /* keep the status-derived message */
      }
      throw new ApiError(response.status, message);
    }
    return (await response.json()) as T;
  }

  meta(signal?: AbortSignal): Promise<MetaResponse> {
    return this.request('/api/v1/meta', signal);
  }

  catalog(signal?: AbortSignal): Promise<CatalogSnapshot> {
    return this.request('/api/v1/tasks', signal);
  }

  taskDetail(taskUid: string, signal?: AbortSignal): Promise<TaskDetailResponse> {
    return this.request(`/api/v1/tasks/${encodeURIComponent(taskUid)}`, signal);
  }

  taskHealth(taskUid: string, signal?: AbortSignal): Promise<TaskHealthResponse> {
    return this.request(`/api/v1/tasks/${encodeURIComponent(taskUid)}/health`, signal);
  }

  artifactContent(taskUid: string, artifactId: string, signal?: AbortSignal): Promise<ArtifactContentResponse> {
    return this.request(
      `/api/v1/tasks/${encodeURIComponent(taskUid)}/artifacts/${encodeURIComponent(artifactId)}/content`,
      signal,
    );
  }

  openTaskPath(taskUid: string, target: OpenTarget, application: OpenApplication): Promise<OpenPathResponse> {
    const query = new URLSearchParams({ target, application });
    return this.request(`/api/v1/tasks/${encodeURIComponent(taskUid)}/open?${query}`, undefined, { method: 'POST' });
  }

  revealPath(
    taskUid: string,
    relativePath: string,
    application: RevealApplication,
    line?: number | null,
  ): Promise<RevealResponse> {
    const query = new URLSearchParams({ path: relativePath, application });
    if (line) query.set('line', String(line));
    return this.request(`/api/v1/tasks/${encodeURIComponent(taskUid)}/reveal?${query}`, undefined, { method: 'POST' });
  }
}
