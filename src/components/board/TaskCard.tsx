import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../../api/types";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id, columnId: task.columnId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    cursor: "grab",
    userSelect: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "#fff",
        borderRadius: 12,
        padding: "0.75rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 6px 14px rgba(15,23,42,0.08)",
      }}
      {...listeners}
      {...attributes}
    >
      <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{task.title}</div>
      {task.description ? (
        <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>{task.description}</p>
      ) : null}
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {task.dueDate ? (
          <span
            style={{
              background: "#eef2ff",
              color: "#312e81",
              borderRadius: 8,
              padding: "0.15rem 0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        ) : null}
        {task.tags ? (
          <span
            style={{
              background: "#ecfeff",
              color: "#0e7490",
              borderRadius: 8,
              padding: "0.15rem 0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {task.tags}
          </span>
        ) : null}
      </div>
    </div>
  );
}
