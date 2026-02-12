import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { organizationApi, organizationMemberApi, projectApi } from '../api/client';
import {
  CreateOrganizationRequest,
  OrganizationResponse,
  OrganizationRole,
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

  const deleteProject = useMutation({
    mutationFn: ({ organizationId, projectId }: { organizationId: number; projectId: number }) =>
      projectApi.remove(organizationId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', selectedOrg] });
    }
  });

  const orgForm = useForm<CreateOrganizationRequest>({ defaultValues: { name: '' } });

  const organizations = useMemo(() => orgQuery.data || [], [orgQuery.data]);
  const selectedOrganization = useMemo(
    () => organizations.find((org) => org.id === selectedOrg),
    [organizations, selectedOrg]
  );
  const selectedRole = selectedOrganization?.role;
  const canManageMembers = isOrgAdmin(selectedRole);
  const canDeleteProjects = isOrgAdmin(selectedRole);

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
        {orgQuery.isPending && <p className="text-muted">Loading organizations…</p>}
        {organizations.length === 0 && !orgQuery.isPending && (
          <p className="text-muted">No organizations yet. Create your first workspace.</p>
        )}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {organizations.map((org) => (
            <button
              key={org.id}
              className={`card button secondary`}
              style={{ textAlign: 'left', border: selectedOrg === org.id ? '2px solid #6366f1' : '1px solid #e2e8f0' }}
              onClick={() => setSelectedOrg(org.id)}
            >
              <div style={{ fontWeight: 700 }}>{org.name}</div>
              <div className="text-muted" style={{ fontSize: '0.9rem' }}>{org.description || 'No description'}</div>
              {org.role && <div className="badge" style={{ marginTop: '0.5rem' }}>Role: {org.role}</div>}
            </button>
          ))}
        </div>
        <form
          onSubmit={orgForm.handleSubmit((values) => createOrg.mutate(values))}
          style={{ marginTop: '1rem' }}
        >
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
          <button className="button" type="submit" disabled={createOrg.isPending}>
            {createOrg.isPending ? 'Creating…' : 'Create organization'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">
          <h2>Projects</h2>
          {selectedOrg && <span className="badge">Org #{selectedOrg}</span>}
        </div>
        {!selectedOrg && <p className="text-muted">Select an organization to view its projects.</p>}
        {selectedOrganization && (
          <p className="text-muted" style={{ marginTop: 0 }}>
            Your role in this organization: <strong>{selectedOrganization.role ?? 'MEMBER'}</strong>.{' '}
            {canDeleteProjects
              ? 'You can create and delete projects.'
              : 'Members can view and create projects but cannot delete projects.'}
          </p>
        )}
        {selectedOrg && projectsQuery.isPending && <p className="text-muted">Loading projects…</p>}
        {selectedOrg && projectsQuery.data && projects.length === 0 && (
          <p className="text-muted">No projects yet. Create one below.</p>
        )}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {projects.map((project: ProjectResponse) => (
            <div key={project.id} className="card" style={{ border: '1px solid #e2e8f0' }}>
              <div className="flex space-between">
                <div>
                  <div style={{ fontWeight: 700 }}>{project.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {project.description || 'No description yet'}
                  </div>
                </div>
                <span className="badge">{project.status}</span>
              </div>
              <button
                className="button"
                style={{ marginTop: '0.75rem', width: '100%' }}
                onClick={() => navigate(`/projects/${project.id}/board?org=${project.organizationId}`)}
              >
                Open board
              </button>
              {canDeleteProjects && (
                <button
                  className="button secondary"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                  onClick={() => deleteProject.mutate({ organizationId: project.organizationId, projectId: project.id })}
                  disabled={deleteProject.isPending}
                >
                  Delete project
                </button>
              )}
            </div>
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
                disabled={projectsPage.page === 0 || projectsQuery.isPending}
                onClick={() => setProjectPage((page) => Math.max(0, page - 1))}
              >
                Previous
              </button>
              <button
                className="button secondary"
                type="button"
                disabled={projectsPage.page >= projectsPage.totalPages - 1 || projectsQuery.isPending}
                onClick={() => setProjectPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {selectedOrg && <ProjectCreateForm organizationId={selectedOrg} />}
      </div>

      {selectedOrg && (
        <OrganizationMembersCard
          organizationId={selectedOrg}
          canManageMembers={canManageMembers}
        />
      )}
    </div>
  );
};

const ProjectCreateForm = ({ organizationId }: { organizationId: number }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<{ name: string; description?: string }>({
    defaultValues: { name: '' }
  });

  const createProject = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      projectApi.create(organizationId, payload),
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
        <textarea
          className="input"
          placeholder="Description (optional)"
          rows={2}
          {...register('description')}
        />
      </div>
      <button className="button" type="submit" disabled={createProject.isPending}>
        {createProject.isPending ? 'Creating…' : 'Create project'}
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
  const [feedback, setFeedback] = useState<string | null>(null);
  const addMemberForm = useForm<{ email: string; role: 'ADMIN' | 'MEMBER' }>({
    defaultValues: { email: '', role: 'MEMBER' }
  });
  const updateRoleForm = useForm<{ memberId: number; role: 'ADMIN' | 'MEMBER' }>({
    defaultValues: { role: 'MEMBER' }
  });
  const removeMemberForm = useForm<{ memberId: number }>({});

  const addMember = useMutation({
    mutationFn: (payload: { email: string; role: 'ADMIN' | 'MEMBER' }) =>
      organizationMemberApi.add(organizationId, payload),
    onSuccess: (member) => {
      setFeedback(`Added ${member.email} as ${member.role}.`);
      addMemberForm.reset({ email: '', role: 'MEMBER' });
    }
  });

  const updateRole = useMutation({
    mutationFn: (payload: { memberId: number; role: 'ADMIN' | 'MEMBER' }) =>
      organizationMemberApi.updateRole(organizationId, payload.memberId, { role: payload.role }),
    onSuccess: (member) => {
      setFeedback(`Updated member #${member.id} role to ${member.role}.`);
      updateRoleForm.reset({ role: 'MEMBER' });
    }
  });

  const removeMember = useMutation({
    mutationFn: (payload: { memberId: number }) => organizationMemberApi.remove(organizationId, payload.memberId),
    onSuccess: () => {
      setFeedback('Member removed successfully.');
      removeMemberForm.reset();
    }
  });

  return (
    <div className="card">
      <div className="section-title">
        <h2>Organization members</h2>
        <span className="badge">RBAC</span>
      </div>
      {!canManageMembers && (
        <p className="text-muted">Only admins can manage organization members.</p>
      )}
      {feedback && <p className="text-muted">{feedback}</p>}
      {canManageMembers && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <form onSubmit={addMemberForm.handleSubmit((values) => addMember.mutate(values))}>
            <div className="form-row">
              <label>Add member</label>
              <input
                className="input"
                type="email"
                placeholder="member@example.com"
                {...addMemberForm.register('email', { required: true })}
              />
              <select className="input" {...addMemberForm.register('role')}>
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button className="button" type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? 'Adding…' : 'Add member'}
            </button>
          </form>

          <form onSubmit={updateRoleForm.handleSubmit((values) => updateRole.mutate(values))}>
            <div className="form-row">
              <label>Update member role</label>
              <input
                className="input"
                type="number"
                placeholder="Member ID"
                {...updateRoleForm.register('memberId', { required: true, valueAsNumber: true })}
              />
              <select className="input" {...updateRoleForm.register('role')}>
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button className="button secondary" type="submit" disabled={updateRole.isPending}>
              {updateRole.isPending ? 'Saving…' : 'Update role'}
            </button>
          </form>

          <form onSubmit={removeMemberForm.handleSubmit((values) => removeMember.mutate(values))}>
            <div className="form-row">
              <label>Remove member</label>
              <input
                className="input"
                type="number"
                placeholder="Member ID"
                {...removeMemberForm.register('memberId', { required: true, valueAsNumber: true })}
              />
            </div>
            <button className="button secondary" type="submit" disabled={removeMember.isPending}>
              {removeMember.isPending ? 'Removing…' : 'Remove member'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const isOrgAdmin = (role?: OrganizationRole) => role === 'OWNER' || role === 'ADMIN';
