import type { ActivityLog } from "../api/types";

type ActivityFeedProps = {
  items?: ActivityLog[];
  isLoading?: boolean;
};

export function ActivityFeed({ items, isLoading }: ActivityFeedProps) {
  return (
    <div className="card" style={{ padding: "1rem", maxHeight: 420, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Activity</h3>
        {isLoading ? <small>Loading...</small> : null}
      </div>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
        {items?.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "0.75rem",
              borderRadius: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700 }}>{item.actionType.replace("_", " ")}</div>
              <small style={{ color: "#475569" }}>
                {new Date(item.createdAt).toLocaleString()}
              </small>
            </div>
            <div style={{ color: "#475569" }}>
              <strong>{item.actorDisplayName ?? "User"}</strong>{" "}
              {item.taskTitle ? `on ${item.taskTitle}` : ""}
            </div>
            {item.oldValue || item.newValue ? (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                {item.oldValue ? (
                  <span
                    style={{
                      background: "#fee2e2",
                      color: "#b91c1c",
                      borderRadius: 8,
                      padding: "0.15rem 0.5rem",
                    }}
                  >
                    {item.oldValue}
                  </span>
                ) : null}
                {item.newValue ? (
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      borderRadius: 8,
                      padding: "0.15rem 0.5rem",
                    }}
                  >
                    {item.newValue}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
        {!items?.length && !isLoading ? (
          <p style={{ color: "#94a3b8" }}>No activity yet. Actions will appear here.</p>
        ) : null}
      </div>
    </div>
  );
}
