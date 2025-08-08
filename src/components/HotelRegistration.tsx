import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  MapPin,
  Mail,
  Phone,
  Star,
  DollarSign,
} from 'lucide-react';
import { Hotel, Amenity } from '../App';
import API_BASE from '../api-config'; // Import the centralized URL

/* DTOs */
interface DistrictDto {
  key: string;
  name: string;
}
interface HotelTypeDto {
  hotelTypeId: number;
  hotelTypeName: string;
}
interface LandscapeDto {
  landscapeId: number;
  landscapeTypeName: string;
}

/* Props */
interface HotelRegistrationProps {
  onHotelAdd: (hotel: Hotel) => void;
  onBack: () => void;
}

/* Form & error shapes */
interface FormData {
  hotelName: string;
  hotelDescription: string;
  hotelRating: string; // changed from number to string
  hotelBasicPricePerNight: string; // changed from number to string
  hotelAddress: string;
  district: string;
  hotelType: string;
  landscape: string;
  location: string;
  hotelEmail: string;
  hotelPhoneNumber: string;
  hotelImageUrls: string;
  hotelImages: File[];
  selectedAmenities: string[];
}
interface FormErrors {
  [key: string]: string;
}

/* Constants */
const TOKEN = localStorage.getItem('jwt_token') ?? '';

const HotelRegistration: React.FC<HotelRegistrationProps> = ({
  onHotelAdd,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    hotelName: '',
    hotelDescription: '',
    hotelRating: '', // changed from 0 to ''
    hotelBasicPricePerNight: '', // changed from 0 to ''
    hotelAddress: '',
    district: '',
    hotelType: '',
    landscape: '',
    location: '',
    hotelEmail: '',
    hotelPhoneNumber: '',
    hotelImageUrls: '',
    hotelImages: [],
    selectedAmenities: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [hotelTypes, setHotelTypes] = useState<HotelTypeDto[]>([]);
  const [landscapes, setLandscapes] = useState<LandscapeDto[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    const hdr = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

    const fetchAll = async () => {
      try {
        const [dRes, tRes, lRes, aRes] = await Promise.all([
          axios.get<DistrictDto[]>(`${API_BASE}/districts`, { headers: hdr }),
          axios.get<any[]>(`${API_BASE}/get-all-hotel-types`, { headers: hdr }),
          axios.get<any[]>(`${API_BASE}/landscape/get-all-landscapes`, { headers: hdr }),
          axios.get<any[]>(`${API_BASE}/amenities/retrieve-all-amenities`, { headers: hdr }),
        ]);
        setDistricts(dRes.data);
        setHotelTypes(
          tRes.data.map((item: any) => ({
            hotelTypeId: item.hotelTypeId,
            hotelTypeName: item.hotelTypeName,
          }))
        );
        setLandscapes(
          lRes.data.map((item: any) => ({
            landscapeId: item.landscapeId,
            landscapeTypeName: item.landscapeTypeName,
          }))
        );
        setAmenities(
          aRes.data.map((item: any) => ({
            id: String(item.amenitiesId),
            name: item.amenitiesName,
            icon: '🏷️',
            category: item.category ?? ''
          }))
        );
      } catch (err) {
        console.error(err);
        alert('Failed to load master data. Try refreshing.');
      }
    };

    fetchAll();
  }, []);

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 3) {
      setErrors((p) => ({
        ...p,
        hotelImages: 'Maximum 3 images allowed',
      }));
      return;
    }
    handleInputChange('hotelImages', files);
  };
  const removeImage = (idx: number) => {
    const updated = formData.hotelImages.filter((_, i) => i !== idx);
    handleInputChange('hotelImages', updated);
  };

  const toggleAmenity = (id: string) => {
    const upd = formData.selectedAmenities.includes(id)
      ? formData.selectedAmenities.filter((a) => a !== id)
      : [...formData.selectedAmenities, id];
    handleInputChange('selectedAmenities', upd);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.hotelName)
        newErrors.hotelName = 'Hotel name is required';
      else if (formData.hotelName.length > 100)
        newErrors.hotelName = 'Max 100 characters';

      if (!formData.hotelDescription)
        newErrors.hotelDescription = 'Description required';
      else if (formData.hotelDescription.length > 1000)
        newErrors.hotelDescription = 'Max 1000 characters';

      const ratingNum = parseFloat(formData.hotelRating);
      if (formData.hotelRating && (ratingNum < 0 || ratingNum > 5))
        newErrors.hotelRating = 'Rating 0-5';

      if (!formData.hotelBasicPricePerNight)
        newErrors.hotelBasicPricePerNight = 'Price required';
      else if (parseFloat(formData.hotelBasicPricePerNight) < 0)
        newErrors.hotelBasicPricePerNight = 'Must be positive';

      if (!formData.hotelAddress) newErrors.hotelAddress = 'Address required';
      if (!formData.district) newErrors.district = 'District required';
      if (!formData.hotelType) newErrors.hotelType = 'Hotel type required';
      if (!formData.landscape) newErrors.landscape = 'Landscape required';
    }

    if (step === 2) {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.hotelEmail) newErrors.hotelEmail = 'Email required';
      else if (!emailRx.test(formData.hotelEmail))
        newErrors.hotelEmail = 'Invalid email';

      if (!formData.hotelPhoneNumber)
        newErrors.hotelPhoneNumber = 'Phone required';
      else if (!/^\d{10}$/.test(formData.hotelPhoneNumber))
        newErrors.hotelPhoneNumber = '10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((p) => Math.min(p + 1, 3));
  };
  const handlePrevious = () =>
    setCurrentStep((p) => Math.max(p - 1, 1));

  const handleSubmit = async () => {
  if (!validateStep(2)) return;

  try {
    const hotelReq = {
      hotelName: formData.hotelName,
      hotelDescription: formData.hotelDescription,
      hotelRating: formData.hotelRating ? parseFloat(formData.hotelRating) : 0,
      hotelBasicPricePerNight: formData.hotelBasicPricePerNight,
      hotelAddress: formData.hotelAddress,
      hotelEmail: formData.hotelEmail,
      hotelPhoneNumber: formData.hotelPhoneNumber,
      district: formData.district,
      location: formData.location,
      hotelTypeId: Number(formData.hotelType),
      landscapeId: Number(formData.landscape),
    };

    const fd = new FormData();
    fd.append(
      'hotelData',
      new Blob([JSON.stringify(hotelReq)], { type: 'application/json' })
    );
    formData.hotelImages.forEach((f) => fd.append('imageFiles', f));

    // --- THIS IS THE ONLY PART YOU NEED TO CHANGE ---
    const urls = formData.hotelImageUrls
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);

    fd.append('imageUrls', JSON.stringify(urls)); // Always send as JSON array string
    // ------------------------------------------------

    const headers = {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${TOKEN}`,
    };

    const { data } = await axios.post(
      `${API_BASE}/register-hotel`,
      fd,
      { headers }
    );

    const hotelId = data.hotelId as string;

    if (formData.selectedAmenities.length) {
      await axios.post(
        `${API_BASE}/amenities/assign-to-hotel`,
        {
          hotelId,
          amenitiesIds: formData.selectedAmenities,
        },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
    }

    alert('Hotel registered successfully!');
    onHotelAdd(data);
    onBack();
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data ?? 'Registration failed');
  }
};

  /* Step 1 */
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏨 Basic Information
        </h2>
        <p className="text-gray-600">
          Enter the essential details about your hotel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* hotel name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Hotel Name *
          </label>
          <input
            type="text"
            value={formData.hotelName}
            onChange={(e) =>
              handleInputChange('hotelName', e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg ${
              errors.hotelName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter hotel name"
          />
          {errors.hotelName && (
            <p className="mt-1 text-sm text-red-600">{errors.hotelName}</p>
          )}
        </div>

        {/* description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Hotel Description *
          </label>
          <textarea
            rows={4}
            value={formData.hotelDescription}
            onChange={(e) =>
              handleInputChange('hotelDescription', e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg ${
              errors.hotelDescription ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your hotel"
          />
          {errors.hotelDescription && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hotelDescription}
            </p>
          )}
        </div>

        {/* rating */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Hotel Rating (0-5)
          </label>
          <div className="relative">
            <Star className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.hotelRating}
              onChange={(e) =>
                handleInputChange('hotelRating', e.target.value)
              }
              className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                errors.hotelRating ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.0"
            />
          </div>
          {errors.hotelRating && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hotelRating}
            </p>
          )}
        </div>

        {/* price */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Price Per Night (₹) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.hotelBasicPricePerNight}
              onChange={(e) =>
                handleInputChange('hotelBasicPricePerNight', e.target.value)
              }
              className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                errors.hotelBasicPricePerNight
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="0"
            />
          </div>
          {errors.hotelBasicPricePerNight && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hotelBasicPricePerNight}
            </p>
          )}
        </div>

        {/* address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Hotel Address *
          </label>
          <input
            type="text"
            value={formData.hotelAddress}
            onChange={(e) =>
              handleInputChange('hotelAddress', e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg ${
              errors.hotelAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter full address"
          />
          {errors.hotelAddress && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hotelAddress}
            </p>
          )}
        </div>

        {/* district */}
        <div>
          <label className="block text-sm font-medium mb-2">
            District *
          </label>
          <select
            value={formData.district}
            onChange={(e) =>
              handleInputChange('district', e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg ${
              errors.district ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select district</option>
            {districts.map((d) => (
              <option key={d.key} value={d.key}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="mt-1 text-sm text-red-600">{errors.district}</p>
          )}
        </div>

        {/* hotel type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Hotel Type *
          </label>
          <select
            value={formData.hotelType}
            onChange={(e) => handleInputChange('hotelType', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg ${
              errors.hotelType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select type</option>
            {hotelTypes.map((t) => (
              <option key={t.hotelTypeId} value={t.hotelTypeId}>
                {t.hotelTypeName}
              </option>
            ))}
          </select>
          {errors.hotelType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hotelType}
            </p>
          )}
        </div>

        {/* landscape */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Landscape *
          </label>
          <select
            value={formData.landscape}
            onChange={(e) =>
              handleInputChange('landscape', e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg ${
              errors.landscape ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select landscape</option>
            {landscapes.map((l) => (
              <option key={l.landscapeId} value={l.landscapeId}>
                {l.landscapeTypeName}
              </option>
            ))}
          </select>
          {errors.landscape && (
            <p className="mt-1 text-sm text-red-600">
              {errors.landscape}
            </p>
          )}
        </div>

        {/* extra location */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Additional Location Details
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={ formData.location}
              onChange={(e) =>
                handleInputChange('location', e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Landmarks, nearby attractions"
            />
          </div>
        </div>
      </div>
    </div>
  );

  /* Step 2 */
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">📧 Contact Details</h2>
        <p className="text-gray-600">
          Provide contact information for your hotel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* email */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Hotel Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={formData.hotelEmail}
              onChange={(e) =>
                handleInputChange('hotelEmail', e.target.value)
              }
              className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                errors.hotelEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="hotel@example.com"
            />
          </div>
          {errors.hotelEmail && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hotelEmail}
            </p>
          )}
        </div>

        {/* phone */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              value={formData.hotelPhoneNumber}
              onChange={(e) =>
                handleInputChange('hotelPhoneNumber', e.target.value)
              }
              className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                errors.hotelPhoneNumber
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="0123456789"
            />
          </div>
          {errors.hotelPhoneNumber && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hotelPhoneNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  /* Step 3 */
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">🖼️ Images & Amenities</h2>
        <p className="text-gray-600">
          Upload images and select amenities for your hotel
        </p>
      </div>

      {/* image upload */}
      <div>
        <label className="block text-sm font-medium mb-4">
          Hotel Images (Max 3)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label className="cursor-pointer">
                <span className="mt-2 block text-sm">
                  Upload hotel images
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </label>
              <p className="mt-1 text-sm text-gray-500">
                PNG, JPG, GIF up to 10 MB each
              </p>
            </div>
          </div>
        </div>
        {errors.hotelImages && (
          <p className="mt-1 text-sm text-red-600">
            {errors.hotelImages}
          </p>
        )}

        {/* thumbnails */}
        {formData.hotelImages.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {formData.hotelImages.map((f, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(f)}
                  alt={`img-${i}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* image URL textarea */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Image URLs (optional, comma-separated)
        </label>
        <textarea
          rows={3}
          value={formData.hotelImageUrls}
          onChange={(e) =>
            handleInputChange('hotelImageUrls', e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="http://... , http://..."
        />
      </div>

      {/* amenity check-list */}
      <div>
        <label className="block text-sm font-medium mb-4">
          Select Amenities
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {amenities.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAmenity(a.id)}
              className={`flex items-center space-x-2 p-3 rounded-lg border ${
                formData.selectedAmenities.includes(a.id)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{a.icon}</span>
              <span className="text-sm font-medium">{a.name}</span>
              {formData.selectedAmenities.includes(a.id) && (
                <Check className="ml-auto w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  s === currentStep
                    ? 'bg-blue-600 text-white'
                    : s < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s < currentStep ? <Check size={16} /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* step content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* nav buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 text-gray-600 disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              <Check size={16} />
              <span>Register Hotel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelRegistration;