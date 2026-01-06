import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          backgroundColor: "#0f172a",
          color: "white",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #38bdf8, #6366f1)",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: "0.9rem",
              boxShadow: "0 10px 20px rgba(99, 102, 241, 0.45)",
            }}
          >
            RH
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Remote Project Hub</div>
            <small style={{ color: "#cbd5e1" }}>Kanban workspace</small>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700 }}>{user?.displayName || "Member"}</div>
            <small style={{ color: "#cbd5e1" }}>{user?.email}</small>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <main style={{ padding: "1.5rem 2rem 3rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
