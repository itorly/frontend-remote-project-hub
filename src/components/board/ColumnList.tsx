import { DndContext, DragEndEvent, SensorDescriptor } from '@dnd-kit/core';
import { BoardColumnResponse } from '../../types/api';
import { ColumnCard } from './ColumnCard';

export const ColumnList = ({
  columns,
  onAddTask,
  onAddColumn,
  onDragEnd,
  sensors,
  isMoving
}: {
  columns: BoardColumnResponse[];
  onAddTask: (columnId: number) => void;
  onAddColumn: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor[];
  isMoving: boolean;
}) => (
  <DndContext sensors={sensors} onDragEnd={onDragEnd}>
    <div className="board">
      {columns.map((column) => (
        <ColumnCard key={column.id} column={column} onAddTask={() => onAddTask(column.id)} isDragging={isMoving} />
      ))}
      <div className="card" style={{ border: '2px dashed #cbd5e1', display: 'grid', placeItems: 'center' }}>
        <button className="button secondary" onClick={onAddColumn}>
          + New column
        </button>
      </div>
    </div>
  </DndContext>
);
