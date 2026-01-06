import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrganization,
  createProject,
  getOrganizations,
  getProjects,
} from "../api";
import type { CreateOrganizationRequest, CreateProjectRequest, Organization, Project } from "../api/types";
import { useAuth } from "../providers/AuthProvider";

export function DashboardPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: () => getOrganizations(token!),
    enabled: Boolean(token),
  });

  const selectedOrganizationId = useMemo(() => {
    if (selectedOrgId) return selectedOrgId;
    if (organizationsQuery.data?.length) {
      return organizationsQuery.data[0].id;
    }
    return null;
  }, [organizationsQuery.data, selectedOrgId]);

  const projectsQuery = useQuery({
    queryKey: ["projects", selectedOrganizationId],
    queryFn: () => getProjects(token!, selectedOrganizationId!),
    enabled: Boolean(token && selectedOrganizationId),
  });

  const orgForm = useForm<CreateOrganizationRequest>({ defaultValues: { name: "", description: "" } });
  const projectForm = useForm<CreateProjectRequest>({ defaultValues: { name: "", description: "" } });

  const createOrgMutation = useMutation({
    mutationFn: (payload: CreateOrganizationRequest) => createOrganization(token!, payload),
    onSuccess: (org) => {
      queryClient.setQueryData<Organization[]>(["organizations"], (prev) =>
        prev ? [...prev, org] : [org],
      );
      setSelectedOrgId(org.id);
      orgForm.reset();
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (payload: CreateProjectRequest) =>
      createProject(token!, selectedOrganizationId!, payload),
    onSuccess: (project) => {
      queryClient.setQueryData<Project[]>(["projects", selectedOrganizationId], (prev) =>
        prev ? [...prev, project] : [project],
      );
      projectForm.reset();
    },
  });

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, color: "#6366f1", fontWeight: 700, letterSpacing: 0.5 }}>
              Welcome back
            </p>
            <h2 style={{ margin: "0.2rem 0" }}>{user?.displayName ?? "Teammate"}</h2>
            <p style={{ margin: 0, color: "#475569" }}>
              Manage organizations, launch projects, and jump into boards quickly.
            </p>
          </div>
          <div style={{ textAlign: "right", color: "#475569" }}>
            <div style={{ fontWeight: 700 }}>Token storage</div>
            <small>
              Stored in localStorage for persistence. For higher security, swap to an in-memory store
              and refresh tokens to reduce XSS exposure.
            </small>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1.2fr 1fr" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Organizations</h3>
            {organizationsQuery.isLoading ? <span>Loading...</span> : null}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            {organizationsQuery.data?.map((org) => (
              <button
                key={org.id}
                className="btn btn-secondary"
                onClick={() => setSelectedOrgId(org.id)}
                style={{
                  borderColor: selectedOrganizationId === org.id ? "#2563eb" : "#e2e8f0",
                  background:
                    selectedOrganizationId === org.id ? "rgba(37, 99, 235, 0.08)" : "#e2e8f0",
                }}
              >
                <div style={{ fontWeight: 700 }}>{org.name}</div>
                <small style={{ color: "#0f172a" }}>{org.description}</small>
              </button>
            ))}
            {!organizationsQuery.data?.length && !organizationsQuery.isLoading ? (
              <p style={{ color: "#475569" }}>No organizations yet. Create one below.</p>
            ) : null}
          </div>
          <form
            onSubmit={orgForm.handleSubmit((values) => createOrgMutation.mutate(values))}
            style={{ display: "grid", gap: "0.75rem", marginTop: "1.25rem" }}
          >
            <h4 style={{ margin: "0.5rem 0" }}>Create organization</h4>
            <input
              className="input"
              placeholder="Organization name"
              {...orgForm.register("name", { required: true })}
            />
            <textarea
              className="input"
              placeholder="Description (optional)"
              style={{ minHeight: 80 }}
              {...orgForm.register("description")}
            />
            <button className="btn btn-primary" type="submit" disabled={createOrgMutation.isPending}>
              {createOrgMutation.isPending ? "Creating..." : "Create organization"}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ margin: 0 }}>Create project</h3>
          <p style={{ color: "#475569", marginTop: "0.25rem" }}>
            Projects live inside organizations. Choose an org to attach your new work.
          </p>
          <form
            onSubmit={projectForm.handleSubmit((values) => createProjectMutation.mutate(values))}
            style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}
          >
            <input
              className="input"
              placeholder="Project name"
              {...projectForm.register("name", { required: true })}
              disabled={!selectedOrganizationId}
            />
            <textarea
              className="input"
              placeholder="Description"
              style={{ minHeight: 80 }}
              {...projectForm.register("description")}
              disabled={!selectedOrganizationId}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!selectedOrganizationId || createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? "Creating..." : "Create project"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem" }}>
            <h4 style={{ margin: "0 0 0.5rem" }}>Projects</h4>
            {projectsQuery.isLoading ? <p>Loading projects...</p> : null}
            {projectsQuery.data?.map((project) => (
              <div
                key={project.id}
                className="card"
                style={{
                  padding: "0.75rem 1rem",
                  marginBottom: "0.75rem",
                  borderColor: "#e2e8f0",
                  boxShadow: "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{project.name}</div>
                    <small style={{ color: "#475569" }}>{project.description}</small>
                  </div>
                  <Link className="btn btn-secondary" to={`/projects/${project.id}/board`}>
                    Open board
                  </Link>
                </div>
              </div>
            ))}
            {!projectsQuery.data?.length && !projectsQuery.isLoading ? (
              <p style={{ color: "#475569" }}>No projects yet. Create one to get started.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
