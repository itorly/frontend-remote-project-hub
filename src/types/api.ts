export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  timezone?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface OrganizationResponse {
  id: number;
  name: string;
  description?: string;
  role?: OrganizationRole;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
}

export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface UpdateOrganizationRequest {
  name: string;
  description?: string;
}

export interface AddOrganizationMemberRequest {
  email: string;
  role?: OrganizationRole;
}

export interface UpdateOrganizationMemberRoleRequest {
  role: OrganizationRole;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  organizationId: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest extends CreateProjectRequest {
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface BoardResponse {
  projectId: number;
  projectName: string;
  columns: BoardColumnResponse[];
}

export interface BoardColumnResponse {
  id: number;
  name: string;
  position: number;
  tasks: TaskResponse[];
}

export interface CreateColumnRequest {
  name: string;
  position?: number;
}

export interface UpdateColumnRequest {
  name?: string;
  position?: number;
}

export interface TaskResponse {
  id: number;
  columnId: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  assigneeId?: number;
  assigneeDisplayName?: string;
  dueDate?: string;
  tags?: string;
  position?: number;
}

export interface CreateTaskRequest {
  columnId: number;
  title: string;
  description?: string;
  assigneeId?: number;
  dueDate?: string;
  tags?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigneeId?: number;
  clearAssignee?: boolean;
  dueDate?: string;
  clearDueDate?: boolean;
  tags?: string;
  clearTags?: boolean;
}

export interface MoveTaskRequest {
  targetColumnId: number;
  fromPosition: number;
  toPosition: number;
}

export interface ActivityLogResponse {
  id: number;
  projectId: number;
  taskId?: number;
  taskTitle?: string;
  actionType:
    | 'COLUMN_CREATED'
    | 'COLUMN_UPDATED'
    | 'COLUMN_DELETED'
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_MOVED'
    | 'TASK_DELETED'
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED';
  fromColumnId?: number;
  toColumnId?: number;
  fromPosition?: number;
  toPosition?: number;
  oldValue?: string;
  newValue?: string;
  metadataJson?: string;
  actorId?: number;
  actorDisplayName?: string;
  createdAt: string;
}

export interface Pageable {
  page: number;
  size: number;
  sort?: string[];
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
