import axios from 'axios';
import {
  ActivityLogResponse,
  AddOrganizationMemberRequest,
  AuthResponse,
  BoardResponse,
  CreateColumnRequest,
  CreateOrganizationRequest,
  CreateProjectRequest,
  CreateTaskRequest,
  LogoutRequest,
  LoginRequest,
  MoveTaskRequest,
  OrganizationMemberResponse,
  OrganizationResponse,
  PageResponse,
  Pageable,
  ProjectResponse,
  RefreshRequest,
  RegisterRequest,
  TaskResponse,
  UpdateOrganizationRequest,
  UpdateOrganizationMemberRoleRequest,
  UpdateColumnRequest,
  UpdateProjectRequest,
  UpdateTaskRequest
} from '../types/api';
import { getAuthToken, getRefreshToken, useAuthStore } from '../state/auth-store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

const authApiClient = axios.create({
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        originalRequest._retry = true;
        try {
          const res = await authApiClient.post<AuthResponse>('/api/auth/refresh', { refreshToken });
          const { setAuth } = useAuthStore.getState();
          setAuth(res.data);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${res.data.accessToken}`
          };
          return api(originalRequest);
        } catch (refreshError) {
          // fall through to clear auth
        }
      }
      const { clear } = useAuthStore.getState();
      clear();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await api.post<AuthResponse>('/api/auth/login', data);
    return res.data;
  },
  register: async (data: RegisterRequest) => {
    const res = await api.post<AuthResponse>('/api/auth/register', data);
    return res.data;
  },
  refresh: async (data: RefreshRequest) => {
    const res = await authApiClient.post<AuthResponse>('/api/auth/refresh', data);
    return res.data;
  },
  logout: async (data: LogoutRequest) => {
    await authApiClient.post('/api/auth/logout', data);
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
  list: async (organizationId: number, pageable: Pageable) => {
    const res = await api.get<PageResponse<ProjectResponse>>(
      `/api/organizations/${organizationId}/projects`,
      { params: pageable }
    );
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

export const organizationMemberApi = {
  add: async (organizationId: number, payload: AddOrganizationMemberRequest) => {
    const res = await api.post<OrganizationMemberResponse>(
      `/api/organizations/${organizationId}/members`,
      payload
    );
    return res.data;
  },
  updateRole: async (
    organizationId: number,
    memberId: number,
    payload: UpdateOrganizationMemberRoleRequest
  ) => {
    const res = await api.patch<OrganizationMemberResponse>(
      `/api/organizations/${organizationId}/members/${memberId}`,
      payload
    );
    return res.data;
  },
  remove: async (organizationId: number, memberId: number) => {
    await api.delete(`/api/organizations/${organizationId}/members/${memberId}`);
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
  listTasks: async (projectId: number, pageable: Pageable) => {
    const res = await api.get<PageResponse<TaskResponse>>(`/api/projects/${projectId}/tasks`, {
      params: pageable
    });
    return res.data;
  },
  getActivity: async (projectId: number) => {
    const res = await api.get<ActivityLogResponse[]>(`/api/projects/${projectId}/activity`);
    return res.data;
  }
};
