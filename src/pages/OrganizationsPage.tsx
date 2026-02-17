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
      queryClient.invalidateQueries({ queryKey: ['board'] });
    }
  });

  const orgForm = useForm<CreateOrganizationRequest>({ defaultValues: { name: '' } });

  const organizations = useMemo(() => orgQuery.data || [], [orgQuery.data]);
  const selectedOrganization = useMemo(
    () => organizations.find((org) => org.id === selectedOrg) || null,
    [organizations, selectedOrg]
  );
  const canManageMembers = selectedOrganization?.role === 'OWNER' || selectedOrganization?.role === 'ADMIN';
  const canDeleteProjects = canManageMembers;
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
          {organizations.map((org) => (
            <button
              key={org.id}
              className="card button secondary"
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
        {selectedOrg && selectedOrganization?.role && (
          <p className="text-muted">Your role in this organization: {selectedOrganization.role}</p>
        )}
        {selectedOrg && !canDeleteProjects && (
          <p className="text-muted">Only admins can delete projects.</p>
        )}
        {selectedOrg && projectsQuery.isLoading && <p className="text-muted">Loading projects…</p>}
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
                  disabled={deleteProject.isLoading}
                  onClick={() =>
                    deleteProject.mutate({ organizationId: project.organizationId, projectId: project.id })
                  }
                >
                  {deleteProject.isLoading ? 'Deleting…' : 'Delete project'}
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

      {selectedOrg && (
        <OrganizationMembersCard
          organization={selectedOrganization}
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
      <button className="button" type="submit" disabled={createProject.isLoading}>
        {createProject.isLoading ? 'Creating…' : 'Create project'}
      </button>
    </form>
  );
};

const OrganizationMembersCard = ({
  organization,
  canManageMembers
}: {
  organization: OrganizationResponse | null;
  canManageMembers: boolean;
}) => {
  const queryClient = useQueryClient();

  const addMemberForm = useForm<{ email: string; role: OrganizationRole }>({
    defaultValues: { email: '', role: 'MEMBER' }
  });
  const updateRoleForm = useForm<{ memberId: number; role: OrganizationRole }>({
    defaultValues: { memberId: 0, role: 'MEMBER' }
  });
  const removeMemberForm = useForm<{ memberId: number }>({
    defaultValues: { memberId: 0 }
  });

  const addMember = useMutation({
    mutationFn: (payload: { email: string; role: OrganizationRole }) =>
      organizationMemberApi.add(organization!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      addMemberForm.reset({ email: '', role: 'MEMBER' });
    }
  });

  const updateRole = useMutation({
    mutationFn: (payload: { memberId: number; role: OrganizationRole }) =>
      organizationMemberApi.updateRole(organization!.id, payload.memberId, { role: payload.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      updateRoleForm.reset({ memberId: 0, role: 'MEMBER' });
    }
  });

  const removeMember = useMutation({
    mutationFn: (payload: { memberId: number }) =>
      organizationMemberApi.remove(organization!.id, payload.memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      removeMemberForm.reset({ memberId: 0 });
    }
  });

  return (
    <div className="card">
      <div className="section-title">
        <h2>Organization members</h2>
        {organization?.role && <span className="badge">Your role: {organization.role}</span>}
      </div>
      {!canManageMembers && (
        <p className="text-muted">Only admins can manage members.</p>
      )}
      {canManageMembers && (
        <div className="grid" style={{ gap: '1rem' }}>
          <form onSubmit={addMemberForm.handleSubmit((values) => addMember.mutate(values))}>
            <div className="form-row">
              <label>Add member by email</label>
              <input className="input" placeholder="member@company.com" {...addMemberForm.register('email', { required: true })} />
              <select className="input" {...addMemberForm.register('role')}>
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="OWNER">OWNER</option>
              </select>
            </div>
            <button className="button" type="submit" disabled={addMember.isLoading}>
              {addMember.isLoading ? 'Adding…' : 'Add member'}
            </button>
          </form>

          <form onSubmit={updateRoleForm.handleSubmit((values) => updateRole.mutate(values))}>
            <div className="form-row">
              <label>Update member role</label>
              <input className="input" type="number" min={1} placeholder="Member ID" {...updateRoleForm.register('memberId', { required: true, valueAsNumber: true, min: 1 })} />
              <select className="input" {...updateRoleForm.register('role')}>
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="OWNER">OWNER</option>
              </select>
            </div>
            <button className="button secondary" type="submit" disabled={updateRole.isLoading}>
              {updateRole.isLoading ? 'Updating…' : 'Update role'}
            </button>
          </form>

          <form onSubmit={removeMemberForm.handleSubmit((values) => removeMember.mutate(values))}>
            <div className="form-row">
              <label>Remove member</label>
              <input className="input" type="number" min={1} placeholder="Member ID" {...removeMemberForm.register('memberId', { required: true, valueAsNumber: true, min: 1 })} />
            </div>
            <button className="button secondary" type="submit" disabled={removeMember.isLoading}>
              {removeMember.isLoading ? 'Removing…' : 'Remove member'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
