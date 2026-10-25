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
      success(`خوش آمدید، ${user.fullName || user.email}.`);
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
          <p className="eyebrow">خوش آمدید</p>
          <h1 className="h-display mt-3 text-4xl">ورود</h1>
          <p className="mt-4 text-sm text-cocoa/75">
            برای پیگیری سفارش‌ها، ذخیره نشانی‌ها و ساختن لیست علاقه‌مندی از دسرهای محبوب وارد شوید.
          </p>
          <div className="mt-8 rounded-3xl bg-white/70 p-5 text-xs text-cocoa/70">
            <p className="font-semibold text-cocoa">حساب‌های نمایشی</p>
            <p className="mt-2">مشتری: <span className="ltr inline-block">demo@maisonfraise.test / Demo123!</span></p>
            <p>مدیر: <span className="ltr inline-block">admin@maisonfraise.test / Maison123!</span></p>
          </div>
        </div>

        <form onSubmit={submit} className="p-10">
          <div>
            <label htmlFor="si-email" className="label">ایمیل</label>
            <input
              id="si-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="field ltr"
              required
            />
          </div>
          <div className="mt-4">
            <label htmlFor="si-password" className="label">رمز عبور</label>
            <input
              id="si-password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="field ltr"
              required
            />
          </div>
          <button type="submit" disabled={busy} className="btn-dark mt-6 w-full">
            {busy ? 'در حال ورود…' : 'ورود'}
          </button>
          <p className="mt-5 text-center text-sm text-muted">
            تازه آمده‌اید؟{' '}
            <Link to="/signup" className="font-semibold text-rose hover:underline">
              ساخت حساب کاربری
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
