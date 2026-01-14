import { ReactNode, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { boardApi } from '../api/client';
import {
  ActivityLogResponse,
  BoardColumnResponse,
  BoardResponse,
  CreateTaskRequest,
  TaskResponse
} from '../types/api';
import { useForm } from 'react-hook-form';

export const BoardPage = () => {
  const { projectId } = useParams();
  const [params] = useSearchParams();
  const organizationId = params.get('org');
  const queryClient = useQueryClient();
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<null | number>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const boardQuery = useQuery<BoardResponse>({
    queryKey: ['board', projectId],
    queryFn: () => boardApi.getBoard(Number(projectId))
  });

  const activityQuery = useQuery<ActivityLogResponse[]>({
    queryKey: ['activity', projectId],
    queryFn: () => boardApi.getActivity(Number(projectId)),
    enabled: Boolean(projectId)
  });

  const createColumn = useMutation({
    mutationFn: (payload: { name: string }) => boardApi.createColumn(Number(projectId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
      setIsColumnModalOpen(false);
    }
  });

  const createTask = useMutation({
    mutationFn: (payload: CreateTaskRequest) => boardApi.createTask(Number(projectId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
      setIsTaskModalOpen(null);
    }
  });

  const moveTask = useMutation({
    mutationFn: (payload: { taskId: number; targetColumnId: number; fromPosition: number; toPosition: number }) =>
      boardApi.moveTask(Number(projectId), payload.taskId, {
        targetColumnId: payload.targetColumnId,
        fromPosition: payload.fromPosition,
        toPosition: payload.toPosition
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', projectId] })
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (!over) return;
    const targetColumnId = Number(String(over.id).replace('column-', ''));
    const origin = active.data.current as { columnId: number; taskId: number } | undefined;
    if (!origin) return;
    if (origin.columnId === targetColumnId) return;
    const originColumn = columns.find((column) => column.id === origin.columnId);
    const targetColumn = columns.find((column) => column.id === targetColumnId);
    const fromPosition = originColumn ? originColumn.tasks.findIndex((task) => task.id === origin.taskId) : -1;
    const toPosition = targetColumn ? targetColumn.tasks.length : 0;
    if (fromPosition < 0) return;
    moveTask.mutate({ taskId: origin.taskId, targetColumnId, fromPosition, toPosition });
  };

  const columns = useMemo(() => boardQuery.data?.columns || [], [boardQuery.data]);

  if (boardQuery.isError) {
    return (
      <div className="card">
        <h2>Unable to load board</h2>
        <p className="text-muted">Please verify the project exists and you have access.</p>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <div className="flex space-between" style={{ alignItems: 'center' }}>
        <div>
          <h1>{boardQuery.data?.projectName || 'Project Board'}</h1>
          {organizationId && <div className="text-muted">Organization #{organizationId}</div>}
        </div>
        <div className="flex">
          <button className="button secondary" onClick={() => setIsColumnModalOpen(true)}>
            + Add column
          </button>
        </div>
      </div>

      {boardQuery.isLoading && <p className="text-muted">Loading board…</p>}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="board">
          {columns.map((column) => (
            <ColumnCard
              key={column.id}
              column={column}
              onAddTask={() => setIsTaskModalOpen(column.id)}
              isDragging={moveTask.isLoading}
            />
          ))}
          <div className="card" style={{ border: '2px dashed #cbd5e1', display: 'grid', placeItems: 'center' }}>
            <button className="button secondary" onClick={() => setIsColumnModalOpen(true)}>
              + New column
            </button>
          </div>
        </div>
      </DndContext>

      <ActivityFeed entries={activityQuery.data || []} />

      {isColumnModalOpen && (
        <Modal title="Create column" onClose={() => setIsColumnModalOpen(false)}>
          <ColumnForm onSubmit={(values) => createColumn.mutate(values)} isSubmitting={createColumn.isLoading} />
        </Modal>
      )}

      {isTaskModalOpen && (
        <Modal title="Create task" onClose={() => setIsTaskModalOpen(null)}>
          <TaskForm
            columnId={isTaskModalOpen}
            onSubmit={(values) => createTask.mutate(values)}
            isSubmitting={createTask.isLoading}
          />
        </Modal>
      )}
    </div>
  );
};

const ColumnCard = ({ column, onAddTask }: { column: BoardColumnResponse; onAddTask: () => void; isDragging?: boolean }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}` });
  return (
    <div
      ref={setNodeRef}
      className="card"
      style={{
        border: isOver ? '2px solid #6366f1' : '1px solid #e2e8f0',
        minHeight: 200,
        background: isOver ? '#eef2ff' : 'white'
      }}
    >
      <div className="column-header">
        <div>
          <div style={{ fontWeight: 700 }}>{column.name}</div>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
            {column.tasks.length} tasks
          </div>
        </div>
        <button className="button secondary" onClick={onAddTask}>
          + Task
        </button>
      </div>
      <div className="grid" style={{ marginTop: '0.75rem' }}>
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} columnId={column.id} />
        ))}
      </div>
    </div>
  );
};

const TaskCard = ({ task, columnId }: { task: TaskResponse; columnId: number }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { columnId, taskId: task.id }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    boxShadow: isDragging ? '0 20px 50px rgba(15,23,42,0.15)' : '0 10px 30px rgba(15,23,42,0.08)',
    border: '1px solid #e2e8f0',
    background: 'white',
    borderRadius: 12,
    padding: '0.75rem'
  } as const;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontWeight: 700 }}>{task.title}</div>
      {task.description && (
        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
          {task.description.slice(0, 140)}
        </div>
      )}
      <div className="flex" style={{ marginTop: '0.35rem' }}>
        <span className="badge">{task.status}</span>
        {task.tags && <span className="tag">{task.tags}</span>}
      </div>
    </div>
  );
};

const ColumnForm = ({ onSubmit, isSubmitting }: { onSubmit: (payload: { name: string }) => void; isSubmitting: boolean }) => {
  const { register, handleSubmit } = useForm<{ name: string }>({ defaultValues: { name: '' } });
  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))}>
      <div className="form-row">
        <label>Name</label>
        <input className="input" {...register('name', { required: true })} />
      </div>
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create column'}
      </button>
    </form>
  );
};

const TaskForm = ({
  columnId,
  onSubmit,
  isSubmitting
}: {
  columnId: number;
  onSubmit: (payload: CreateTaskRequest) => void;
  isSubmitting: boolean;
}) => {
  const { register, handleSubmit } = useForm<CreateTaskRequest>({ defaultValues: { columnId } });

  return (
    <form onSubmit={handleSubmit((values) => onSubmit({ ...values, columnId }))}>
      <div className="form-row">
        <label>Title</label>
        <input className="input" {...register('title', { required: true })} />
      </div>
      <div className="form-row">
        <label>Description</label>
        <textarea className="input" rows={3} {...register('description')} />
      </div>
      <div className="form-row">
        <label>Tags (comma separated)</label>
        <input className="input" placeholder="design,frontend" {...register('tags')} />
      </div>
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating…' : 'Create task'}
      </button>
    </form>
  );
};

const ActivityFeed = ({ entries }: { entries: ActivityLogResponse[] }) => (
  <div className="card">
    <div className="section-title">
      <h2>Recent activity</h2>
      <span className="badge">Live</span>
    </div>
    {entries.length === 0 && <p className="text-muted">No activity yet. Finish a few moves to see updates.</p>}
    <div className="grid" style={{ gap: '0.75rem' }}>
      {entries.map((item) => (
        <div
          key={item.id}
          style={{
            padding: '0.75rem',
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
        >
          <div className="flex space-between">
            <div style={{ fontWeight: 700 }}>{item.actionType}</div>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
          {item.taskTitle && <div>{item.taskTitle}</div>}
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
            {item.actorDisplayName || 'Unknown user'} • {item.oldValue ? `${item.oldValue} → ${item.newValue}` : item.newValue}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Modal = ({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) => (
  <div className="modal-backdrop" role="dialog">
    <div className="card modal-card">
      <div className="flex space-between" style={{ marginBottom: '0.5rem' }}>
        <h3>{title}</h3>
        <button className="button secondary" onClick={onClose}>
          Close
        </button>
      </div>
      {children}
    </div>
  </div>
);
