import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function SignIn() {
  const { login } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      success(`Welcome back, ${user.fullName || user.email}.`);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/account'), {
        replace: true,
      });
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x py-14">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-5xl bg-white shadow-card lg:grid-cols-2">
        <div className="bg-blush p-10">
          <p className="eyebrow">Welcome back</p>
          <h1 className="h-display mt-3 text-4xl">Sign in</h1>
          <p className="mt-4 text-sm text-cocoa/75">
            Sign in to track orders, save your addresses and keep a wishlist of favourite desserts.
          </p>
          <div className="mt-8 rounded-3xl bg-white/70 p-5 text-xs text-cocoa/70">
            <p className="font-semibold text-cocoa">Demo accounts</p>
            <p className="mt-2">Customer: demo@maisonfraise.test / Demo123!</p>
            <p>Admin: admin@maisonfraise.test / Maison123!</p>
          </div>
        </div>

        <form onSubmit={submit} className="p-10">
          <div>
            <label htmlFor="si-email" className="label">Email</label>
            <input
              id="si-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="field"
              required
            />
          </div>
          <div className="mt-4">
            <label htmlFor="si-password" className="label">Password</label>
            <input
              id="si-password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="field"
              required
            />
          </div>
          <button type="submit" disabled={busy} className="btn-dark mt-6 w-full">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="mt-5 text-center text-sm text-muted">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-rose hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
