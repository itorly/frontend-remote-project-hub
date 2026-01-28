import { TaskResponse } from '../../types/api';

export const TaskList = ({
  entries,
  isLoading,
  pageInfo,
  onNext,
  onPrevious
}: {
  entries: TaskResponse[];
  isLoading: boolean;
  pageInfo?: { page: number; totalPages: number; totalItems: number };
  onNext: () => void;
  onPrevious: () => void;
}) => (
  <div className="card">
    <div className="section-title">
      <h2>All tasks</h2>
      <span className="badge">Paginated</span>
    </div>
    {isLoading && <p className="text-muted">Loading tasks…</p>}
    {!isLoading && entries.length === 0 && <p className="text-muted">No tasks found for this project yet.</p>}
    <div className="grid" style={{ gap: '0.75rem' }}>
      {entries.map((task) => (
        <div
          key={task.id}
          style={{
            padding: '0.75rem',
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
        >
          <div className="flex space-between">
            <div style={{ fontWeight: 700 }}>{task.title}</div>
            <span className="badge">{task.status}</span>
          </div>
          {task.description && (
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
              {task.description}
            </div>
          )}
          <div className="flex" style={{ marginTop: '0.35rem' }}>
            {task.assigneeDisplayName && <span className="tag">Assignee: {task.assigneeDisplayName}</span>}
            {task.tags && <span className="tag">{task.tags}</span>}
          </div>
        </div>
      ))}
    </div>
    {pageInfo && pageInfo.totalPages > 1 && (
      <div className="flex space-between" style={{ marginTop: '1rem' }}>
        <div className="text-muted">
          Page {pageInfo.page + 1} of {pageInfo.totalPages} • {pageInfo.totalItems} tasks
        </div>
        <div className="flex">
          <button className="button secondary" type="button" disabled={pageInfo.page === 0} onClick={onPrevious}>
            Previous
          </button>
          <button
            className="button secondary"
            type="button"
            disabled={pageInfo.page >= pageInfo.totalPages - 1}
            onClick={onNext}
          >
            Next
          </button>
        </div>
      </div>
    )}
  </div>
);
