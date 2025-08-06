/* ───────────────────────────────────────────────────────────────
   Register.tsx (Vite edition) – fully wired to Spring backend
   ----------------------------------------------------------- */
import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react';

/* 📝  Replace with your own exported Admin interface if it
   already exists elsewhere. */
export interface Admin {
  id: string;
  adminName: string;
  adminEmail?: string;
  adminPhoneNumber: string;
}

interface RegisterProps {
  onRegister: (admin: Admin) => void;
  onSwitchToLogin: () => void;
}

interface FormData {
  adminName: string;
  identifier: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}
interface FormErrors {
  adminName?: string;
  identifier?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
}

/* ──────────────────────────────────────────
   Helpers
─────────────────────────────────────────── */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;

const validatePassword = (value: string) => {
  const minLength = value.length >= 8;
  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  return minLength && hasUppercase && hasNumber && hasSpecial;
};

/* ──────────────────────────────────────────
   Component
─────────────────────────────────────────── */
const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<FormData>({
    adminName: '',
    identifier: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ------------ validation -------------- */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Admin name
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin name is required';
    } else if (formData.adminName.length < 3) {
      newErrors.adminName = 'Admin name must be at least 3 characters';
    } else if (formData.adminName.length > 100) {
      newErrors.adminName = 'Admin name must not exceed 100 characters';
    }

    // Identifier (email / phone)
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    } else if (!emailRegex.test(formData.identifier) && !phoneRegex.test(formData.identifier)) {
      newErrors.identifier = 'Enter valid email or 10-digit phone';
    }

    // Dedicated phone number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Enter valid 10-digit mobile number';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = '≥8 chars, 1 uppercase, 1 number & 1 special';
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------ handlers ---------------- */
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const isEmail = emailRegex.test(formData.identifier);

      const payload = {
        adminName: formData.adminName,
        adminEmail: isEmail ? formData.identifier : '',
        adminPhoneNumber: isEmail ? formData.phoneNumber : formData.identifier,
        adminPassword: formData.password,
      };

      // 👉  Vite exposes any env var that starts with VITE_
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.1.11:8080/hotel';

      const { data } = await axios.post(`${API_BASE}/admin/admin-register`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const admin: Admin = {
        id: Date.now().toString(),
        adminName: payload.adminName,
        adminEmail: payload.adminEmail || undefined,
        adminPhoneNumber: payload.adminPhoneNumber,
      };

      onRegister(admin);
      alert(data || 'Admin Registration Successful');

      // (optional) reset
      setFormData({
        adminName: '',
        identifier: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      alert(err.response?.data ?? 'Registration failed / server unreachable');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------ UI ---------------------- */
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Registration</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Admin Name */}
        <div>
          <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">
            Admin Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="adminName"
              value={formData.adminName}
              onChange={e => handleInputChange('adminName', e.target.value)}
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.adminName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.adminName && <p className="mt-2 text-sm text-red-600">{errors.adminName}</p>}
        </div>

        {/* Identifier */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
            Email or Phone Number
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="identifier"
              value={formData.identifier}
              onChange={e => handleInputChange('identifier', e.target.value)}
              placeholder="Enter email or phone number"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.identifier ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.identifier && <p className="mt-2 text-sm text-red-600">{errors.identifier}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={e => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter 10-digit mobile number"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.phoneNumber && <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              placeholder="Create a strong password"
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={e => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {isSubmitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;