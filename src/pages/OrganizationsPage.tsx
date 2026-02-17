import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { organizationApi, projectApi } from '../api/client';
import {
  AddOrganizationMemberRequest,
  CreateOrganizationRequest,
  OrganizationResponse,
  ProjectResponse
} from '../types/api';

export const OrganizationsPage = () => {
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [projectPage, setProjectPage] = useState(0);
  const projectPageSize = 6;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const orgQuery = useQuery({ queryKey: ['organizations'], queryFn: organizationApi.list });

  const createOrg = useMutation({
    mutationFn: organizationApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setSelectedOrg(data.id);
    }
  });

  const projectsQuery = useQuery({
    queryKey: ['projects', selectedOrg, projectPage, projectPageSize],
    queryFn: () => projectApi.list(selectedOrg!, { page: projectPage, size: projectPageSize }),
    enabled: Boolean(selectedOrg)
  });

  const orgForm = useForm<CreateOrganizationRequest>({ defaultValues: { name: '' } });

  const organizations = useMemo(() => orgQuery.data || [], [orgQuery.data]);
  const selectedOrganization = useMemo(
    () => organizations.find((organization) => organization.id === selectedOrg),
    [organizations, selectedOrg]
  );
  const canManageMembers = selectedOrganization?.role === 'OWNER' || selectedOrganization?.role === 'ADMIN';

  const projectsPage = projectsQuery.data;
  const projects = projectsPage?.items ?? [];

  useEffect(() => {
    setProjectPage(0);
  }, [selectedOrg]);

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <div className="card">
        <div className="section-title">
          <h2>Organizations</h2>
          <span className="badge">Workspace</span>
        </div>
        {orgQuery.isLoading && <p className="text-muted">Loading organizations…</p>}
        {organizations.length === 0 && !orgQuery.isLoading && (
          <p className="text-muted">No organizations yet. Create your first workspace.</p>
        )}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {organizations.map((org: OrganizationResponse) => (
            <button
              key={org.id}
              className={`card button secondary`}
              style={{ textAlign: 'left', border: selectedOrg === org.id ? '2px solid #6366f1' : '1px solid #e2e8f0' }}
              onClick={() => setSelectedOrg(org.id)}
            >
              <div className="flex space-between" style={{ alignItems: 'center' }}>
                <div style={{ fontWeight: 700 }}>{org.name}</div>
                {org.role && <span className="badge">{org.role}</span>}
              </div>
              <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                {org.description || 'No description'}
              </div>
            </button>
          ))}
        </div>
        <form onSubmit={orgForm.handleSubmit((values) => createOrg.mutate(values))} style={{ marginTop: '1rem' }}>
          <div className="form-row">
            <label>New organization</label>
            <input className="input" placeholder="Acme Inc" {...orgForm.register('name', { required: true })} />
            <textarea
              className="input"
              placeholder="Description (optional)"
              rows={2}
              {...orgForm.register('description')}
            />
          </div>
          <button className="button" type="submit" disabled={createOrg.isLoading}>
            {createOrg.isLoading ? 'Creating…' : 'Create organization'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">
          <h2>Projects</h2>
          {selectedOrg && <span className="badge">Org #{selectedOrg}</span>}
        </div>
        {!selectedOrg && <p className="text-muted">Select an organization to view its projects.</p>}
        {selectedOrg && projectsQuery.isLoading && <p className="text-muted">Loading projects…</p>}
        {selectedOrg && projectsQuery.data && projects.length === 0 && (
          <p className="text-muted">No projects yet. Create one below.</p>
        )}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {projects.map((project: ProjectResponse) => (
            <ProjectCard
              key={project.id}
              project={project}
              canDelete={canManageMembers}
              onOpenBoard={() => navigate(`/projects/${project.id}/board?org=${project.organizationId}`)}
              onDeleted={() => {
                queryClient.invalidateQueries({ queryKey: ['projects', selectedOrg] });
              }}
            />
          ))}
        </div>
        {projectsPage && projectsPage.totalPages > 1 && (
          <div className="flex space-between" style={{ marginTop: '1rem' }}>
            <div className="text-muted">
              Page {projectsPage.page + 1} of {projectsPage.totalPages} • {projectsPage.totalItems} projects
            </div>
            <div className="flex">
              <button
                className="button secondary"
                type="button"
                disabled={projectsPage.page === 0 || projectsQuery.isLoading}
                onClick={() => setProjectPage((page) => Math.max(0, page - 1))}
              >
                Previous
              </button>
              <button
                className="button secondary"
                type="button"
                disabled={projectsPage.page >= projectsPage.totalPages - 1 || projectsQuery.isLoading}
                onClick={() => setProjectPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {selectedOrg && <ProjectCreateForm organizationId={selectedOrg} />}
      </div>

      {selectedOrg && <OrganizationMembersCard organizationId={selectedOrg} canManageMembers={canManageMembers} />}
    </div>
  );
};

const ProjectCard = ({
  project,
  canDelete,
  onOpenBoard,
  onDeleted
}: {
  project: ProjectResponse;
  canDelete: boolean;
  onOpenBoard: () => void;
  onDeleted: () => void;
}) => {
  const deleteProject = useMutation({
    mutationFn: () => projectApi.remove(project.organizationId, project.id),
    onSuccess: onDeleted
  });

  return (
    <div className="card" style={{ border: '1px solid #e2e8f0' }}>
      <div className="flex space-between">
        <div>
          <div style={{ fontWeight: 700 }}>{project.name}</div>
          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
            {project.description || 'No description yet'}
          </div>
        </div>
        <span className="badge">{project.status}</span>
      </div>
      <div className="grid" style={{ marginTop: '0.75rem', gap: '0.5rem' }}>
        <button className="button" onClick={onOpenBoard}>
          Open board
        </button>
        {canDelete ? (
          <button
            className="button secondary"
            onClick={() => deleteProject.mutate()}
            disabled={deleteProject.isLoading}
          >
            {deleteProject.isLoading ? 'Deleting…' : 'Delete project'}
          </button>
        ) : (
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Only admins can delete projects.
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectCreateForm = ({ organizationId }: { organizationId: number }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<{ name: string; description?: string }>({
    defaultValues: { name: '' }
  });

  const createProject = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => projectApi.create(organizationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', organizationId] });
      reset();
    }
  });

  return (
    <form onSubmit={handleSubmit((values) => createProject.mutate(values))} style={{ marginTop: '1rem' }}>
      <div className="form-row">
        <label>New project</label>
        <input className="input" placeholder="Launch planning" {...register('name', { required: true })} />
        <textarea className="input" placeholder="Description (optional)" rows={2} {...register('description')} />
      </div>
      <button className="button" type="submit" disabled={createProject.isLoading}>
        {createProject.isLoading ? 'Creating…' : 'Create project'}
      </button>
    </form>
  );
};

const OrganizationMembersCard = ({
  organizationId,
  canManageMembers
}: {
  organizationId: number;
  canManageMembers: boolean;
}) => {
  const { register, handleSubmit, reset } = useForm<AddOrganizationMemberRequest>({
    defaultValues: { email: '', role: 'MEMBER' }
  });

  const addMember = useMutation({
    mutationFn: (payload: AddOrganizationMemberRequest) => organizationApi.addMember(organizationId, payload),
    onSuccess: () => {
      reset({ email: '', role: 'MEMBER' });
    }
  });

  return (
    <div className="card">
      <div className="section-title">
        <h2>Organization Members</h2>
        <span className="badge">Admin</span>
      </div>
      {!canManageMembers ? (
        <p className="text-muted">Only admins can manage organization members.</p>
      ) : (
        <form onSubmit={handleSubmit((values) => addMember.mutate(values))}>
          <div className="form-row">
            <label>Add member</label>
            <input className="input" type="email" placeholder="member@example.com" {...register('email', { required: true })} />
            <select className="input" {...register('role')}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button className="button" type="submit" disabled={addMember.isLoading}>
            {addMember.isLoading ? 'Adding…' : 'Add member'}
          </button>
        </form>
      )}
    </div>
  );
};
