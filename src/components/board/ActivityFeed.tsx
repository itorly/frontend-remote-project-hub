import { ActivityLogResponse } from '../../types/api';

export const ActivityFeed = ({ entries }: { entries: ActivityLogResponse[] }) => (
  <div className="card">
    <div className="section-title">
      <h2>Recent activity</h2>
      <span className="badge">Live</span>
    </div>
    {entries.length === 0 && <p className="text-muted">No activity yet. Finish a few moves to see updates.</p>}
    <div className="grid" style={{ gap: '0.75rem' }}>
      {entries.map((item) => (
        <div
          key={item.id}
          style={{
            padding: '0.75rem',
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
        >
          <div className="flex space-between">
            <div style={{ fontWeight: 700 }}>{item.actionType}</div>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
          {item.taskTitle && <div>{item.taskTitle}</div>}
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
            {item.actorDisplayName || 'Unknown user'} • {item.oldValue ? `${item.oldValue} → ${item.newValue}` : item.newValue}
          </div>
        </div>
      ))}
    </div>
  </div>
);
