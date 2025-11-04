//Rama Alassi
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import { mockUsers } from '@/data/mockData';
export default function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        goals: '',
    });
    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};
        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        }
        else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        else if (mockUsers.some((u) => u.email === formData.email)) {
            newErrors.email = 'Email already registered';
        }
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }
        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        }
        else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        // Goals validation (optional but with character limit)
        if (formData.goals.length > 500) {
            newErrors.goals = 'Goals must be less than 500 characters';
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
        // Simulate creating a new user account
        toast.success(<div className="flex items-center gap-2">
        <Check className="h-4 w-4"/>
        <span>Account created successfully!</span>
      </div>);
        // Reset form
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            goals: '',
        });
        // Navigate to login after a short delay
        setTimeout(() => {
            navigate('/login');
        }, 1500);
    };
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };
    return (<div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-primary to-destructive flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-white"/>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base mt-2">
              Start your fitness journey today
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className={errors.name ? 'border-destructive' : ''}/>
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={errors.email ? 'border-destructive' : ''}/>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className={errors.password ? 'border-destructive pr-10' : 'pr-10'}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}/>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
              {errors.confirmPassword && (<p className="text-sm text-destructive">{errors.confirmPassword}</p>)}
            </div>

            {/* Goals Field */}
            <div className="space-y-2">
              <Label htmlFor="goals">Fitness Goals (Optional)</Label>
              <Textarea id="goals" placeholder="E.g., Build muscle, lose weight, improve endurance..." value={formData.goals} onChange={(e) => handleInputChange('goals', e.target.value)} className={errors.goals ? 'border-destructive' : ''} rows={3}/>
              <p className="text-xs text-muted-foreground">
                {formData.goals.length}/500 characters
              </p>
              {errors.goals && <p className="text-sm text-destructive">{errors.goals}</p>}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center text-sm mt-6">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>);
}
