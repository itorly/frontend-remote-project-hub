import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { ColumnCard } from "./ColumnCard";
import type { Column } from "../../api/types";

type ColumnListProps = {
  columns: Column[];
  onTaskMove: (taskId: number, targetColumnId: number) => void;
  onCreateTask: (columnId: number) => void;
};

export function ColumnList({ columns, onTaskMove, onCreateTask }: ColumnListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
    const taskId = active.data?.current?.taskId;
    const overColumnId = over.data?.current?.columnId;
    const activeColumnId = active.data?.current?.columnId;

    if (!taskId || !overColumnId || overColumnId === activeColumnId) {
      return;
    }
    onTaskMove(taskId, overColumnId);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-start",
          overflowX: "auto",
          paddingBottom: "0.5rem",
        }}
      >
        {columns
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((column) => (
            <ColumnCard key={column.id} column={column} onCreateTask={onCreateTask} />
          ))}
      </div>
    </DndContext>
  );
}
