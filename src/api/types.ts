export type Status = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type ProjectStatus = "ACTIVE" | "ARCHIVED";

export type AuthResponse = {
  token: string;
  userId: number;
  email: string;
  displayName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
  timezone?: string;
};

export type Organization = {
  id: number;
  name: string;
  description?: string;
  role?: "OWNER" | "ADMIN" | "MEMBER";
};

export type CreateOrganizationRequest = {
  name: string;
  description?: string;
};

export type Project = {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  organizationId: number;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
};

export type Column = {
  id: number;
  name: string;
  position: number;
  tasks: Task[];
};

export type CreateColumnRequest = {
  name: string;
  position?: number;
};

export type Task = {
  id: number;
  columnId: number;
  title: string;
  description?: string;
  status?: Status;
  assigneeId?: number;
  assigneeDisplayName?: string;
  dueDate?: string;
  tags?: string;
};

export type CreateTaskRequest = {
  columnId: number;
  title: string;
  description?: string;
  assigneeId?: number;
  dueDate?: string;
  tags?: string;
};

export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, "columnId">> & {
  clearAssignee?: boolean;
  clearDueDate?: boolean;
  clearTags?: boolean;
};

export type MoveTaskRequest = {
  targetColumnId: number;
};

export type Board = {
  projectId: number;
  projectName: string;
  columns: Column[];
};

export type ActivityLog = {
  id: number;
  projectId: number;
  taskId?: number;
  taskTitle?: string;
  actionType:
    | "TASK_CREATED"
    | "TASK_UPDATED"
    | "TASK_MOVED"
    | "TASK_DELETED"
    | "PROJECT_CREATED"
    | "PROJECT_UPDATED";
  oldValue?: string;
  newValue?: string;
  actorId?: number;
  actorDisplayName?: string;
  createdAt: string;
};
