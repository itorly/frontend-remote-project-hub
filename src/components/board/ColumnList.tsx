import { BoardColumnResponse } from '../../types/api';
import { ColumnCard } from './ColumnCard';

export const ColumnList = ({
  columns,
  onAddTask,
  onCreateColumn
}: {
  columns: BoardColumnResponse[];
  onAddTask: (columnId: number) => void;
  onCreateColumn: () => void;
}) => (
  <div className="board">
    {columns.map((column) => (
      <ColumnCard key={column.id} column={column} onAddTask={() => onAddTask(column.id)} />
    ))}
    <div className="card" style={{ border: '2px dashed #cbd5e1', display: 'grid', placeItems: 'center' }}>
      <button className="button secondary" onClick={onCreateColumn}>
        + New column
      </button>
    </div>
  </div>
);
