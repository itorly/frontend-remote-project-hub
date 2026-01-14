import axios from 'axios';
import {
  ActivityLogResponse,
  AuthResponse,
  BoardResponse,
  CreateColumnRequest,
  CreateOrganizationRequest,
  CreateProjectRequest,
  CreateTaskRequest,
  LoginRequest,
  MoveTaskRequest,
  OrganizationResponse,
  ProjectResponse,
  RegisterRequest,
  TaskResponse,
  UpdateOrganizationRequest,
  UpdateColumnRequest,
  UpdateProjectRequest,
  UpdateTaskRequest
} from '../types/api';
import { getAuthToken } from '../state/auth-store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await api.post<AuthResponse>('/api/auth/login', data);
    return res.data;
  },
  register: async (data: RegisterRequest) => {
    const res = await api.post<AuthResponse>('/api/auth/register', data);
    return res.data;
  }
};

export const organizationApi = {
  list: async () => {
    const res = await api.get<OrganizationResponse[]>('/api/organizations');
    return res.data;
  },
  create: async (payload: CreateOrganizationRequest) => {
    const res = await api.post<OrganizationResponse>('/api/organizations', payload);
    return res.data;
  },
  update: async (organizationId: number, payload: UpdateOrganizationRequest) => {
    const res = await api.put<OrganizationResponse>(`/api/organizations/${organizationId}`, payload);
    return res.data;
  },
  remove: async (organizationId: number) => {
    await api.delete(`/api/organizations/${organizationId}`);
  }
};

export const projectApi = {
  list: async (organizationId: number) => {
    const res = await api.get<ProjectResponse[]>(`/api/organizations/${organizationId}/projects`);
    return res.data;
  },
  create: async (organizationId: number, payload: CreateProjectRequest) => {
    const res = await api.post<ProjectResponse>(`/api/organizations/${organizationId}/projects`, payload);
    return res.data;
  },
  update: async (organizationId: number, projectId: number, payload: UpdateProjectRequest) => {
    const res = await api.put<ProjectResponse>(
      `/api/organizations/${organizationId}/projects/${projectId}`,
      payload
    );
    return res.data;
  },
  remove: async (organizationId: number, projectId: number) => {
    await api.delete(`/api/organizations/${organizationId}/projects/${projectId}`);
  }
};

export const boardApi = {
  getBoard: async (projectId: number) => {
    const res = await api.get<BoardResponse>(`/api/projects/${projectId}/board`);
    return res.data;
  },
  createColumn: async (projectId: number, payload: CreateColumnRequest) => {
    const res = await api.post(`/api/projects/${projectId}/columns`, payload);
    return res.data;
  },
  updateColumn: async (projectId: number, columnId: number, payload: UpdateColumnRequest) => {
    const res = await api.patch(`/api/projects/${projectId}/columns/${columnId}`, payload);
    return res.data;
  },
  deleteColumn: async (projectId: number, columnId: number) => {
    await api.delete(`/api/projects/${projectId}/columns/${columnId}`);
  },
  createTask: async (projectId: number, payload: CreateTaskRequest) => {
    const res = await api.post<TaskResponse>(`/api/projects/${projectId}/tasks`, payload);
    return res.data;
  },
  updateTask: async (projectId: number, taskId: number, payload: UpdateTaskRequest) => {
    const res = await api.patch<TaskResponse>(`/api/projects/${projectId}/tasks/${taskId}`, payload);
    return res.data;
  },
  moveTask: async (projectId: number, taskId: number, payload: MoveTaskRequest) => {
    const res = await api.patch<TaskResponse>(`/api/projects/${projectId}/tasks/${taskId}/move`, payload);
    return res.data;
  },
  deleteTask: async (projectId: number, taskId: number) => {
    await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
  },
  getActivity: async (projectId: number) => {
    const res = await api.get<ActivityLogResponse[]>(`/api/projects/${projectId}/activity`);
    return res.data;
  }
};
