import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import API_BASE from '../api-config'; // Import the centralized URL

export interface Admin {
  id: string;
  adminName?: string;
  adminEmail?: string;
  adminPhoneNumber?: string;
  role?: string;
}

/* -------------------- props ------------------- */
interface LoginProps {
  onLogin: (admin: Admin) => void;
  onSwitchToRegister: () => void;
}

/* -------------------- local state ------------- */
interface FormData {
  identifier: string;
  password: string;
}
interface FormErrors {
  identifier?: string;
  password?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;

const validatePassword = (value: string) => {
  const minLength = value.length >= 8;
  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  return minLength && hasUppercase && hasNumber && hasSpecial;
};

/* ============================================================ */
const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState<FormData>({ identifier: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ------------- validation ------------------ */
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    } else if (!emailRegex.test(formData.identifier) && !phoneRegex.test(formData.identifier)) {
      newErrors.identifier = 'Please enter a valid email or 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        'Password must be ≥8 chars, 1 uppercase, 1 number, 1 special char';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------- helpers --------------------- */
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  /* ------------- submit ---------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const isEmail = emailRegex.test(formData.identifier);

      /* payload expected by Spring controller */
      const payload = {
        adminEmail: isEmail ? formData.identifier : '',
        adminPhoneNumber: isEmail ? '' : formData.identifier,
        adminPassword: formData.password,
      };

      const { data } = await axios.post(`${API_BASE}/admin/admin-login`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      /* data = { token, email, role }  */
      if (data.token && data.token.split('.').length === 3) {
        localStorage.setItem('jwt_token', data.token);

        const loggedInAdmin: Admin = {
          id: data.email,      // or any id you want
          adminEmail: data.email,
          role: data.role,
        };

        onLogin(loggedInAdmin);
      } else {
        throw new Error('Invalid token received');
      }
    } catch (err: any) {
      alert(err.response?.data ?? 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============= UI ========================== */
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Admin Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identifier */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
            Email or Phone Number
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="identifier"
              type="text"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.identifier ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email or phone number"
              value={formData.identifier}
              onChange={e => handleInputChange('identifier', e.target.value)}
            />
          </div>
          {errors.identifier && <p className="mt-2 text-sm text-red-600">{errors.identifier}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Switch to register */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don’t have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;