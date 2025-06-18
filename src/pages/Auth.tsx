
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type UserGroup = 'accounting_firm' | 'business_owner';
type UserRole = 'partner' | 'senior_staff' | 'staff' | 'client' | 'management' | 'accounting_team';

// Security: Input validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  // Security: Enforce strong password requirements
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userGroup: '' as UserGroup,
    userRole: '' as UserRole,
    firmName: '',
    businessName: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Note: RouteGuard will handle redirecting authenticated users
    // No need to check auth state here
  }, []);

  // Security: Rate limiting for authentication attempts
  const checkRateLimit = (): boolean => {
    if (attemptCount >= 5) {
      toast.error('Too many attempts. Please wait before trying again.');
      return false;
    }
    return true;
  };

  // Security: Comprehensive form validation
  const validateSignInForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignUpForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateName(formData.firstName)) {
      errors.firstName = 'First name must be 2-50 characters, letters only';
    }

    if (!validateName(formData.lastName)) {
      errors.lastName = 'Last name must be 2-50 characters, letters only';
    }

    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (step === 2) {
      if (!formData.userGroup || !formData.userRole) {
        errors.role = 'Please select your role and organization type';
      }

      if (formData.userGroup === 'accounting_firm' && (!formData.firmName || formData.firmName.length < 2)) {
        errors.firmName = 'Please enter a valid firm name (minimum 2 characters)';
      }

      if (formData.userGroup === 'business_owner' && (!formData.businessName || formData.businessName.length < 2)) {
        errors.businessName = 'Please enter a valid business name (minimum 2 characters)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    // Security: Sanitize input
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security: Check rate limiting
    if (!checkRateLimit()) return;
    
    // Security: Validate form
    if (!validateSignInForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setAttemptCount(prev => prev + 1);
        toast.error(error.message);
      } else {
        toast.success('Successfully signed in!');
        setAttemptCount(0);
        // RouteGuard will handle the redirect
      }
    } catch (error) {
      setAttemptCount(prev => prev + 1);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate basic info
      if (!validateSignUpForm()) {
        return;
      }
      setStep(2);
      return;
    }

    // Step 2: Complete registration
    if (!validateSignUpForm()) {
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/app`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_group: formData.userGroup,
            user_role: formData.userRole,
            firm_name: formData.firmName,
            business_name: formData.businessName,
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created successfully! Please check your email for verification.');
        // RouteGuard will handle the redirect after email confirmation
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleOptions = (userGroup: UserGroup): { value: UserRole; label: string }[] => {
    if (userGroup === 'accounting_firm') {
      return [
        { value: 'partner', label: 'Partner' },
        { value: 'senior_staff', label: 'Senior Staff' },
        { value: 'staff', label: 'Staff' },
      ];
    } else {
      return [
        { value: 'management', label: 'Management' },
        { value: 'accounting_team', label: 'Accounting Team' },
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <BarChart3 className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">EasyAccounts.ai</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isSignUp ? (step === 1 ? 'Get Started' : 'Organization Details') : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? (step === 1 ? 'Enter your details to create an account' : 'Tell us about your organization')
                : 'Enter your credentials to access your account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSignUp ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className={formErrors.password ? 'border-red-500' : ''}
                  />
                  {formErrors.password && (
                    <p className="text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading || attemptCount >= 5}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            ) : step === 1 ? (
              // Step 1 sign up form with enhanced validation
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                      maxLength={50}
                      className={formErrors.firstName ? 'border-red-500' : ''}
                    />
                    {formErrors.firstName && (
                      <p className="text-sm text-red-500">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                      maxLength={50}
                      className={formErrors.lastName ? 'border-red-500' : ''}
                    />
                    {formErrors.lastName && (
                      <p className="text-sm text-red-500">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className={formErrors.password ? 'border-red-500' : ''}
                  />
                  {formErrors.password && (
                    <p className="text-sm text-red-500">{formErrors.password}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Must be 8+ characters with uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className={formErrors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            ) : (
              // Step 2 sign up form with enhanced validation
              <form onSubmit={handleSignUp} className="space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="mb-4 p-0 h-auto"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <div className="space-y-2">
                  <Label htmlFor="userGroup">I am a:</Label>
                  <Select value={formData.userGroup} onValueChange={(value: UserGroup) => {
                    handleInputChange('userGroup', value);
                    handleInputChange('userRole', '');
                  }}>
                    <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accounting_firm">Chartered Accountant</SelectItem>
                      <SelectItem value="business_owner">Business Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.userGroup && (
                  <div className="space-y-2">
                    <Label htmlFor="userRole">Role:</Label>
                    <Select value={formData.userRole} onValueChange={(value: UserRole) => handleInputChange('userRole', value)}>
                      <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {getRoleOptions(formData.userGroup).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formErrors.role && (
                  <p className="text-sm text-red-500">{formErrors.role}</p>
                )}

                {formData.userGroup === 'accounting_firm' && (
                  <div className="space-y-2">
                    <Label htmlFor="firmName">Firm Name</Label>
                    <Input
                      id="firmName"
                      placeholder="Your CA Firm Name"
                      value={formData.firmName}
                      onChange={(e) => handleInputChange('firmName', e.target.value)}
                      required
                      maxLength={100}
                      className={formErrors.firmName ? 'border-red-500' : ''}
                    />
                    {formErrors.firmName && (
                      <p className="text-sm text-red-500">{formErrors.firmName}</p>
                    )}
                  </div>
                )}

                {formData.userGroup === 'business_owner' && (
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Your Business Name"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      required
                      maxLength={100}
                      className={formErrors.businessName ? 'border-red-500' : ''}
                    />
                    {formErrors.businessName && (
                      <p className="text-sm text-red-500">{formErrors.businessName}</p>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            )}

            <Separator className="my-6" />

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setStep(1);
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    firstName: '',
                    lastName: '',
                    userGroup: '' as UserGroup,
                    userRole: '' as UserRole,
                    firmName: '',
                    businessName: '',
                  });
                  setFormErrors({});
                  setAttemptCount(0);
                }}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Demo Account</p>
                  <p>Use email: demo@easyaccounts.ai | Password: demo123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
