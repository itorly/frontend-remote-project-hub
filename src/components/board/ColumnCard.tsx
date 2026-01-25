import { useDroppable } from '@dnd-kit/core';
import { BoardColumnResponse } from '../../types/api';
import { TaskCard } from './TaskCard';

export const ColumnCard = ({
  column,
  onAddTask,
  isDragging
}: {
  column: BoardColumnResponse;
  onAddTask: () => void;
  isDragging?: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}` });

  return (
    <div
      ref={setNodeRef}
      className="card"
      style={{
        border: isOver ? '2px solid #6366f1' : '1px solid #e2e8f0',
        minHeight: 200,
        background: isOver ? '#eef2ff' : 'white',
        opacity: isDragging ? 0.7 : 1
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
