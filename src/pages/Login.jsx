//Rama Alassi
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { mockUsers } from '@/data/mockData';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({
    email: '',
    next: '',
    confirm: '',
  });
  const [pwErrors, setPwErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    const user = mockUsers.find(
      (u) => u.email === formData.email && u.password === formData.password
    );

    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      toast.error('Invalid email or password');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((p) => ({ ...p, [field]: undefined }));
    }
  };


  const validatePwForm = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pwForm.email) e.email = 'Email is required';
    else if (!emailRegex.test(pwForm.email)) e.email = 'Enter a valid email';

    if (!pwForm.next) e.next = 'New password is required';
    else if (pwForm.next.length < 6) e.next = 'At least 6 characters';

    if (!pwForm.confirm) e.confirm = 'Please confirm the new password';
    else if (pwForm.confirm !== pwForm.next) e.confirm = 'Passwords do not match';

    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!validatePwForm()) {
      toast.error('Please fix the errors in the change password form');
      return;
    }

    const user = mockUsers.find((u) => u.email === pwForm.email);
    if (!user) {
      toast.error('No account found for this email');
      return;
    }

    user.password = pwForm.next;

    toast.success('Password updated successfully! You can now sign in with the new password.');
    setShowChangePw(false);
    setPwForm({ email: '', next: '', confirm: '' });
    setPwErrors({});
  };

  const setPwField = (field, value) => {
    setPwForm((p) => ({ ...p, [field]: value }));
    if (pwErrors[field]) setPwErrors((pe) => ({ ...pe, [field]: undefined }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-primary to-destructive flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to continue your fitness journey
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Sign In */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setShowChangePw((s) => !s)}
                >
                  {showChangePw ? 'Close change password' : 'Change password'}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          {showChangePw && (
            <div className="mt-6 rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold text-sm">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="pw-email">Account Email</Label>
                  <Input
                    id="pw-email"
                    type="email"
                    placeholder="you@example.com"
                    value={pwForm.email}
                    onChange={(e) => setPwField('email', e.target.value)}
                    className={pwErrors.email ? 'border-destructive' : ''}
                  />
                  {pwErrors.email && (
                    <p className="text-xs text-destructive">{pwErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pw-next">New Password</Label>
                  <Input
                    id="pw-next"
                    type="password"
                    placeholder="New password"
                    value={pwForm.next}
                    onChange={(e) => setPwField('next', e.target.value)}
                    className={pwErrors.next ? 'border-destructive' : ''}
                  />
                  {pwErrors.next && (
                    <p className="text-xs text-destructive">{pwErrors.next}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pw-confirm">Confirm New Password</Label>
                  <Input
                    id="pw-confirm"
                    type="password"
                    placeholder="Confirm new password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwField('confirm', e.target.value)}
                    className={pwErrors.confirm ? 'border-destructive' : ''}
                  />
                  {pwErrors.confirm && (
                    <p className="text-xs text-destructive">{pwErrors.confirm}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm">Update Password</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowChangePw(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="text-center text-sm mt-6">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

