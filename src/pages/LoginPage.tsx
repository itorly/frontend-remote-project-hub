import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login as loginApi } from "../api";
import type { LoginRequest } from "../api/types";
import { useAuth } from "../providers/AuthProvider";

type LocationState = { from?: Location };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginRequest>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginRequest) => {
    setError(null);
    try {
      const response = await loginApi(values);
      login(response);
      const redirectTo = (location.state as LocationState | null)?.from?.pathname || "/";
      navigate(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 20%, #e0f2fe, transparent 25%), #0f172a",
        padding: "1rem",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 460,
          padding: "2rem",
          borderRadius: 16,
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <h1 style={{ margin: "0 0 0.5rem" }}>Welcome back</h1>
        <p style={{ color: "#475569", marginTop: 0 }}>
          Sign in to manage your Kanban projects and track activity.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: "1rem" }}>
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
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
          </label>
          {error ? (
            <div className="error-text" role="alert">
              {error}
            </div>
          ) : null}
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", color: "#475569" }}>
          New to Remote Project Hub? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
