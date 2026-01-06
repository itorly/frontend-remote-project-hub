import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityFeed } from "../components/ActivityFeed";
import { ColumnList } from "../components/board/ColumnList";
import { CreateColumnModal } from "../components/modals/CreateColumnModal";
import { CreateTaskModal } from "../components/modals/CreateTaskModal";
import { createColumn, createTask, getActivity, getBoard, moveTask } from "../api";
import type { Board, CreateColumnRequest, CreateTaskRequest } from "../api/types";
import { useAuth } from "../providers/AuthProvider";

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const numericProjectId = Number(projectId);
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<number | null>(null);

  const boardQuery = useQuery({
    queryKey: ["board", numericProjectId],
    queryFn: () => getBoard(token!, numericProjectId),
    enabled: Boolean(token && numericProjectId),
  });

  const activityQuery = useQuery({
    queryKey: ["activity", numericProjectId],
    queryFn: () => getActivity(token!, numericProjectId),
    enabled: Boolean(token && numericProjectId),
  });

  const createColumnMutation = useMutation({
    mutationFn: (payload: CreateColumnRequest) => createColumn(token!, numericProjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", numericProjectId] });
      setShowColumnModal(false);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskRequest) => createTask(token!, numericProjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", numericProjectId] });
      setShowTaskModal(false);
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, targetColumnId }: { taskId: number; targetColumnId: number }) =>
      moveTask(token!, numericProjectId, taskId, { targetColumnId }),
    onMutate: async ({ taskId, targetColumnId }) => {
      await queryClient.cancelQueries({ queryKey: ["board", numericProjectId] });
      const previousBoard = queryClient.getQueryData<Board>(["board", numericProjectId]);
      if (previousBoard) {
        const nextColumns = previousBoard.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task.id !== taskId),
        }));
        const task = previousBoard.columns.flatMap((c) => c.tasks).find((t) => t.id === taskId);
        const targetColumn = nextColumns.find((c) => c.id === targetColumnId);
        if (task && targetColumn) {
          targetColumn.tasks = [...targetColumn.tasks, { ...task, columnId: targetColumnId }];
          queryClient.setQueryData<Board>(["board", numericProjectId], {
            ...previousBoard,
            columns: nextColumns,
          });
        }
      }
      return { previousBoard };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", numericProjectId], context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["board", numericProjectId] });
    },
  });

  const columns = boardQuery.data?.columns ?? [];

  const defaultColumnId = useMemo(() => {
    if (targetColumnId) return targetColumnId;
    return columns[0]?.id ?? null;
  }, [columns, targetColumnId]);

  if (!numericProjectId) {
    return <p>Invalid project.</p>;
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="card" style={{ padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#6366f1", margin: 0, fontWeight: 700 }}>Project</p>
            <h2 style={{ margin: 0 }}>
              {boardQuery.data?.projectName || "Loading..."}{" "}
              <span style={{ fontSize: "0.95rem", color: "#475569" }}>#{numericProjectId}</span>
            </h2>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-secondary" onClick={() => setShowColumnModal(true)}>
              + Column
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setTargetColumnId(columns[0]?.id ?? null);
                setShowTaskModal(true);
              }}
              disabled={!columns.length}
            >
              + Task
            </button>
            <Link className="btn btn-secondary" to="/">
              Back to dashboard
            </Link>
          </div>
        </div>
        <p style={{ margin: "0.5rem 0 0", color: "#475569" }}>
          Drag tasks between columns to update status. Task moves call the backend move endpoint.
        </p>
      </div>

      {boardQuery.isLoading ? (
        <p>Loading board...</p>
      ) : (
        <ColumnList
          columns={columns}
          onTaskMove={(taskId, colId) => moveTaskMutation.mutate({ taskId, targetColumnId: colId })}
          onCreateTask={(colId) => {
            setTargetColumnId(colId);
            setShowTaskModal(true);
          }}
        />
      )}

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "2fr 1fr" }}>
        <div className="card" style={{ padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>Board tips</h3>
          <ul style={{ color: "#475569", lineHeight: 1.6 }}>
            <li>Use the column and task modals to add work items quickly.</li>
            <li>Dragging a task triggers the backend <code>PATCH /tasks/{{taskId}}/move</code>.</li>
            <li>Keep the activity panel open to see audit history for the project.</li>
          </ul>
        </div>
        <ActivityFeed items={activityQuery.data} isLoading={activityQuery.isLoading} />
      </div>

      <CreateColumnModal
        open={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        onSubmit={(values) => createColumnMutation.mutate(values)}
      />

      <CreateTaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={(values) => createTaskMutation.mutate(values)}
        columns={columns}
        defaultColumnId={defaultColumnId}
      />
    </div>
  );
}
