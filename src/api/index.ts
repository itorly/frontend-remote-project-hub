import { apiRequest } from "./client";
import type {
  ActivityLog,
  AuthResponse,
  Board,
  CreateColumnRequest,
  CreateOrganizationRequest,
  CreateProjectRequest,
  CreateTaskRequest,
  LoginRequest,
  MoveTaskRequest,
  Organization,
  Project,
  RegisterRequest,
  UpdateTaskRequest,
} from "./types";

export async function login(request: LoginRequest) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function register(request: RegisterRequest) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getOrganizations(token: string) {
  return apiRequest<Organization[]>("/api/organizations", {
    method: "GET",
    token,
  });
}

export async function createOrganization(token: string, payload: CreateOrganizationRequest) {
  return apiRequest<Organization>("/api/organizations", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function getProjects(token: string, organizationId: number) {
  return apiRequest<Project[]>(`/api/organizations/${organizationId}/projects`, {
    method: "GET",
    token,
  });
}

export async function createProject(
  token: string,
  organizationId: number,
  payload: CreateProjectRequest,
) {
  return apiRequest<Project>(`/api/organizations/${organizationId}/projects`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function getBoard(token: string, projectId: number) {
  return apiRequest<Board>(`/api/projects/${projectId}/board`, {
    method: "GET",
    token,
  });
}

export async function createColumn(
  token: string,
  projectId: number,
  payload: CreateColumnRequest,
) {
  return apiRequest(`/api/projects/${projectId}/columns`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function createTask(token: string, projectId: number, payload: CreateTaskRequest) {
  return apiRequest(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateTask(
  token: string,
  projectId: number,
  taskId: number,
  payload: UpdateTaskRequest,
) {
  return apiRequest(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function moveTask(
  token: string,
  projectId: number,
  taskId: number,
  payload: MoveTaskRequest,
) {
  return apiRequest(`/api/projects/${projectId}/tasks/${taskId}/move`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteTask(token: string, projectId: number, taskId: number) {
  return apiRequest(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
    token,
  });
}

export async function getActivity(token: string, projectId: number) {
  return apiRequest<ActivityLog[]>(`/api/projects/${projectId}/activity`, {
    method: "GET",
    token,
  });
}
