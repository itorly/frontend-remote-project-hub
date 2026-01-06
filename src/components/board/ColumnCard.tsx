import { useDroppable } from "@dnd-kit/core";
import type { Column } from "../../api/types";
import { TaskCard } from "./TaskCard";

type ColumnCardProps = {
  column: Column;
  onCreateTask: (columnId: number) => void;
};

export function ColumnCard({ column, onCreateTask }: ColumnCardProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className="card"
      style={{
        minWidth: 280,
        maxWidth: 340,
        padding: "1rem",
        borderColor: isOver ? "#2563eb" : "#e2e8f0",
        background: isOver ? "rgba(37, 99, 235, 0.06)" : "white",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800 }}>{column.name}</div>
          <small style={{ color: "#475569" }}>{column.tasks.length} task(s)</small>
        </div>
        <button className="btn btn-secondary" onClick={() => onCreateTask(column.id)}>
          + Task
        </button>
      </div>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {column.tasks.length === 0 ? (
          <p style={{ color: "#94a3b8", margin: 0 }}>Drag tasks here or create a new one.</p>
        ) : null}
      </div>
    </div>
  );
}
