import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [resetFormData, setResetFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [resetErrors, setResetErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        }
        else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
        setLoading(true);
        const result = await login(formData.email, formData.password);
        setLoading(false);
        if (result.success) {
            // Navigation only - toast with user's name is handled by AuthContext
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        }
        // Error handling and toast are both handled by AuthContext
    };
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleResetInputChange = (field, value) => {
        setResetFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (resetErrors[field]) {
            setResetErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateResetForm = () => {
        const newErrors = {};
        
        if (!resetFormData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (resetFormData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }

        if (!resetFormData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (resetFormData.newPassword !== resetFormData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setResetErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!formData.email) {
            toast.error('Please enter your email address first');
            return;
        }

        if (!validateResetForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setResetLoading(true);
        try {
            const result = await authAPI.resetPassword(
                formData.email,
                resetFormData.newPassword,
                resetFormData.confirmPassword
            );
            
            if (result.success) {
                toast.success('Password reset successfully! You can now login with your new password.');
                setShowResetPassword(false);
                setResetFormData({ newPassword: '', confirmPassword: '' });
                setResetErrors({});
            }
        } catch (error) {
            toast.error(error.message || 'Failed to reset password. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };
    return (<div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-primary to-destructive flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-white"/>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to continue your fitness journey
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={errors.email ? 'border-destructive' : ''}/>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button 
                  type="button" 
                  className="text-xs text-primary hover:underline" 
                  onClick={() => {
                    if (!formData.email) {
                      toast.error('Please enter your email address first');
                      return;
                    }
                    setShowResetPassword(!showResetPassword);
                    if (showResetPassword) {
                      setResetFormData({ newPassword: '', confirmPassword: '' });
                      setResetErrors({});
                    }
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className={errors.password ? 'border-destructive pr-10' : 'pr-10'}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* Submit Button - hide when reset password form is shown */}
            {!showResetPassword && (
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            )}
          </form>

          {/* Reset Password Form - appears directly under password field, replaces Demo Credentials */}
          {showResetPassword && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-4 animate-[fadeIn_0.3s_ease-in-out] mt-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Reset Password</h3>
                <p className="text-xs text-muted-foreground">
                  Enter your new password for <span className="font-medium">{formData.email}</span>
                </p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={resetFormData.newPassword} 
                    onChange={(e) => handleResetInputChange('newPassword', e.target.value)}
                    className={resetErrors.newPassword ? 'border-destructive' : ''}
                  />
                  {resetErrors.newPassword && (
                    <p className="text-sm text-destructive">{resetErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={resetFormData.confirmPassword} 
                    onChange={(e) => handleResetInputChange('confirmPassword', e.target.value)}
                    className={resetErrors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {resetErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{resetErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetFormData({ newPassword: '', confirmPassword: '' });
                      setResetErrors({});
                    }}
                    disabled={resetLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Divider - only show when not in reset password mode */}
          {!showResetPassword && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"/>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
          )}

          {/* Demo Credentials - only show when not in reset password mode */}
          {!showResetPassword && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold mb-2">Demo Credentials:</p>
              <p className="text-xs text-muted-foreground">Email: john@example.com</p>
              <p className="text-xs text-muted-foreground">Password: password123</p>
            </div>
          )}

          {/* Sign Up Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>);
}
