import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { TaskResponse } from '../../types/api';

export const TaskCard = ({ task, columnId }: { task: TaskResponse; columnId: number }) => {
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
