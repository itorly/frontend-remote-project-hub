import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/client';
import { LoginRequest } from '../types/api';
import { useAuth } from '../state/auth-context';

export const LoginPage = () => {
  const { register, handleSubmit } = useForm<LoginRequest>();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data);
      navigate('/');
    }
  });

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: '5vh' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h1>Welcome back</h1>
        <p className="text-muted">Sign in to manage your projects and boards.</p>
        <form className="form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="form-row">
            <label>Email</label>
            <input className="input" type="email" {...register('email', { required: true })} />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input className="input" type="password" {...register('password', { required: true })} />
          </div>
          <button className="button" type="submit" disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        {mutation.isError && (
          <div style={{ color: '#dc2626', marginTop: '0.5rem' }}>
            Unable to sign in. Please check your credentials.
          </div>
        )}
        <div className="text-muted" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
          Security note: this demo persists tokens in local storage for quick reloads. Memory-only storage reduces XSS
          risk but requires re-authentication after refresh.
        </div>
        <p style={{ marginTop: '1rem' }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};
