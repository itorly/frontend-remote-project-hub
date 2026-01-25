import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { boardApi } from '../api/client';
import { ActivityLogResponse, BoardResponse, CreateTaskRequest } from '../types/api';
import { ActivityFeed } from '../components/board/ActivityFeed';
import { ColumnList } from '../components/board/ColumnList';
import { CreateColumnModal } from '../components/board/CreateColumnModal';
import { CreateTaskModal } from '../components/board/CreateTaskModal';
import { TaskList } from '../components/board/TaskList';

export const BoardPage = () => {
  const { projectId } = useParams();
  const [params] = useSearchParams();
  const organizationId = params.get('org');
  const queryClient = useQueryClient();
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<null | number>(null);
  const [taskPage, setTaskPage] = useState(0);
  const taskPageSize = 8;

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
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    }
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

  const tasksQuery = useQuery({
    queryKey: ['project-tasks', projectId, taskPage, taskPageSize],
    queryFn: () => boardApi.listTasks(Number(projectId), { page: taskPage, size: taskPageSize }),
    enabled: Boolean(projectId)
  });

  const tasksPage = tasksQuery.data;
  const tasks = tasksPage?.items ?? [];

  useEffect(() => {
    setTaskPage(0);
  }, [projectId]);

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

      <ColumnList
        columns={columns}
        onAddTask={(columnId) => setIsTaskModalOpen(columnId)}
        onAddColumn={() => setIsColumnModalOpen(true)}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        isMoving={moveTask.isLoading}
      />

      <TaskList
        entries={tasks}
        isLoading={tasksQuery.isLoading}
        pageInfo={tasksPage}
        onNext={() => setTaskPage((page) => page + 1)}
        onPrevious={() => setTaskPage((page) => Math.max(0, page - 1))}
      />

      <ActivityFeed entries={activityQuery.data || []} />

      {isColumnModalOpen && (
        <CreateColumnModal
          onClose={() => setIsColumnModalOpen(false)}
          onSubmit={(values) => createColumn.mutate(values)}
          isSubmitting={createColumn.isLoading}
        />
      )}

      {isTaskModalOpen && (
        <CreateTaskModal
          columnId={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(null)}
          onSubmit={(values) => createTask.mutate(values)}
          isSubmitting={createTask.isLoading}
        />
      )}
    </div>
  );
};
