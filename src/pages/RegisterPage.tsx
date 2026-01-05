import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/client';
import { RegisterRequest } from '../types/api';
import { useAuth } from '../state/auth-context';

export const RegisterPage = () => {
  const { register, handleSubmit } = useForm<RegisterRequest>();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data);
      navigate('/');
    }
  });

  return (
    <div className="container" style={{ maxWidth: 520, marginTop: '5vh' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h1>Create an account</h1>
        <p className="text-muted">Sign up to start organizing your work.</p>
        <form className="form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="form-row">
            <label>Display name</label>
            <input className="input" {...register('displayName', { required: true })} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input className="input" type="email" {...register('email', { required: true })} />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input className="input" type="password" {...register('password', { required: true, minLength: 6 })} />
          </div>
          <div className="form-row">
            <label>Timezone (optional)</label>
            <input className="input" placeholder="e.g. America/New_York" {...register('timezone')} />
          </div>
          <button className="button" type="submit" disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        {mutation.isError && (
          <div style={{ color: '#dc2626', marginTop: '0.5rem' }}>
            Unable to create account. Please try again.
          </div>
        )}
        <p style={{ marginTop: '1rem' }}>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};
