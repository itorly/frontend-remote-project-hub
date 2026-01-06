import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../api";
import type { RegisterRequest } from "../api/types";
import { useAuth } from "../providers/AuthProvider";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterRequest>({
    defaultValues: { displayName: "", email: "", password: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  });

  const onSubmit = async (values: RegisterRequest) => {
    setError(null);
    try {
      const response = await registerApi(values);
      login(response);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle at 90% 10%, #e0e7ff, transparent 25%), #0f172a",
        padding: "1rem",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 520,
          padding: "2rem",
          borderRadius: 16,
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <h1 style={{ margin: "0 0 0.5rem" }}>Create your workspace</h1>
        <p style={{ color: "#475569", marginTop: 0 }}>
          Register to start creating organizations, projects, and real Kanban boards.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: "1rem" }}>
          <label className="label">
            Display name
            <input
              className="input"
              type="text"
              placeholder="Taylor Swift"
              {...register("displayName", { required: true, minLength: 2 })}
            />
          </label>
          <label className="label">
            Email
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email", { required: true })}
            />
          </label>
          <label className="label">
            Password
            <input
              className="input"
              type="password"
              placeholder="Strong password"
              autoComplete="new-password"
              {...register("password", { required: true, minLength: 6 })}
            />
          </label>
          <label className="label">
            Timezone
            <input
              className="input"
              type="text"
              placeholder="America/New_York"
              {...register("timezone")}
            />
          </label>
          {error ? (
            <div className="error-text" role="alert">
              {error}
            </div>
          ) : null}
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", color: "#475569" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
