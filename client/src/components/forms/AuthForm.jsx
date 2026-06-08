import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext.jsx';

const schemas = {
  login: yup.object({
    email: yup.string().email('Enter a valid email.').required('Email is required.'),
    password: yup.string().required('Password is required.'),
  }),
  register: yup.object({
    name: yup.string().min(2, 'Name is too short.').required('Name is required.'),
    email: yup.string().email('Enter a valid email.').required('Email is required.'),
    password: yup
      .string()
      .min(8, 'Use at least 8 characters.')
      .matches(/[a-z]/, 'Add a lowercase letter.')
      .matches(/[A-Z]/, 'Add an uppercase letter.')
      .matches(/[0-9]/, 'Add a number.')
      .required('Password is required.'),
    department: yup.string().max(100).nullable(),
  }),
};

const AuthForm = ({ mode }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === 'register';

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemas[mode]),
    defaultValues: { name: '', email: '', password: '', department: '' },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register({ ...values, role: 'Employee' });
      } else {
        await login(values);
      }
      navigate('/dashboard');
    } catch (error) {
      Swal.fire({
        title: 'Authentication failed',
        text: error.friendlyMessage,
        icon: 'error',
        confirmButtonColor: '#135fb0',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-surface w-full max-w-md rounded-xl bg-white p-7 shadow-soft transition-colors dark:border dark:border-slate-800 dark:bg-[#0f1020]">
      <div>
        <p className="text-sm font-semibold text-brand-600">TicketDesk Pro</p>
        <h1 className="mt-2 text-3xl font-bold text-ink dark:text-white">{isRegister ? 'Create your account' : 'Sign in'}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {isRegister ? 'Start with an employee profile for ticket submission.' : 'Access your support operations dashboard.'}
        </p>
      </div>
      <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {isRegister && (
          <label className="block">
            <span className="form-label">Full name</span>
            <input className="form-input" {...registerField('name')} />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </label>
        )}
        <label className="block">
          <span className="form-label">Email address</span>
          <input className="form-input" type="email" autoComplete="email" {...registerField('email')} />
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </label>
        <label className="block">
          <span className="form-label">Password</span>
          <input className="form-input" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} {...registerField('password')} />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </label>
        {isRegister && (
          <label className="block">
            <span className="form-label">Department</span>
            <input className="form-input" placeholder="IT, HR, Finance..." {...registerField('department')} />
            {errors.department && <span className="form-error">{errors.department.message}</span>}
          </label>
        )}
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {isRegister ? 'Already have an account?' : 'New to TicketDesk?'}{' '}
        <Link className="font-semibold text-brand-600" to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Sign in' : 'Create account'}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
