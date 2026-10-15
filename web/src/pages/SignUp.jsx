import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function SignUp() {
  const { signup } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      error('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      const user = await signup(form);
      success(`Welcome to Maison Fraise, ${user.fullName || 'friend'}.`);
      navigate('/account', { replace: true });
    } catch (err) {
      error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x py-14">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-5xl bg-white shadow-card lg:grid-cols-2">
        <div className="bg-lavender p-10">
          <p className="eyebrow">Join us</p>
          <h1 className="h-display mt-3 text-4xl">Create an account</h1>
          <p className="mt-4 text-sm text-cocoa/75">
            Faster checkout, saved addresses, order tracking and a wishlist you can come back to.
          </p>
        </div>

        <form onSubmit={submit} className="p-10">
          <div>
            <label htmlFor="su-name" className="label">Full name</label>
            <input
              id="su-name"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="field"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="su-email" className="label">Email</label>
            <input
              id="su-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="field"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="su-phone" className="label">Phone (optional)</label>
            <input
              id="su-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="field"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="su-password" className="label">Password</label>
            <input
              id="su-password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="field"
            />
            <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
          </div>
          <button type="submit" disabled={busy} className="btn-dark mt-6 w-full">
            {busy ? 'Creating account…' : 'Create account'}
          </button>
          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-rose hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
