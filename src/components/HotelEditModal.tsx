import React, { useState } from 'react';
import { X, Save, Star, DollarSign, MapPin, Mail, Phone } from 'lucide-react';
import { Hotel, Amenity } from '../App';

interface HotelEditModalProps {
  hotel: Hotel;
  amenities: Amenity[];
  onSave: (updatedHotel: Partial<Hotel>) => void;
  onClose: () => void;
}

const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

const hotelTypes = [
  'Luxury Resort', 'Boutique Hotel', 'Business Hotel', 'Budget Hotel',
  'Beach Resort', 'Mountain Lodge', 'City Hotel', 'Heritage Hotel'
];

const landscapes = [
  'Beach Front', 'Mountain View', 'City Center', 'Lake View',
  'Forest View', 'Garden View', 'Sea View', 'Hill Country'
];

const HotelEditModal: React.FC<HotelEditModalProps> = ({ hotel, amenities, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    hotelName: hotel.hotelName,
    hotelDescription: hotel.hotelDescription,
    hotelRating: hotel.hotelRating || 0,
    hotelBasicPricePerNight: hotel.hotelBasicPricePerNight,
    hotelAddress: hotel.hotelAddress,
    district: hotel.district,
    hotelType: hotel.hotelType,
    landscape: hotel.landscape,
    location: hotel.location || '',
    hotelEmail: hotel.hotelEmail,
    hotelPhoneNumber: hotel.hotelPhoneNumber,
    selectedAmenities: hotel.amenities || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.hotelName) newErrors.hotelName = 'Hotel name is required';
    if (!formData.hotelDescription) newErrors.hotelDescription = 'Description is required';
    if (!formData.hotelBasicPricePerNight) newErrors.hotelBasicPricePerNight = 'Price is required';
    if (!formData.hotelAddress) newErrors.hotelAddress = 'Address is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.hotelType) newErrors.hotelType = 'Hotel type is required';
    if (!formData.landscape) newErrors.landscape = 'Landscape is required';
    if (!formData.hotelEmail) newErrors.hotelEmail = 'Email is required';
    if (!formData.hotelPhoneNumber) newErrors.hotelPhoneNumber = 'Phone number is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.hotelEmail && !emailRegex.test(formData.hotelEmail)) {
      newErrors.hotelEmail = 'Invalid email format';
    }

    if (formData.hotelPhoneNumber && !/^\d{10}$/.test(formData.hotelPhoneNumber)) {
      newErrors.hotelPhoneNumber = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        amenities: formData.selectedAmenities,
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleAmenity = (amenityId: string) => {
    const updated = formData.selectedAmenities.includes(amenityId)
      ? formData.selectedAmenities.filter(id => id !== amenityId)
      : [...formData.selectedAmenities, amenityId];
    setFormData(prev => ({ ...prev, selectedAmenities: updated }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Hotel Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) => handleInputChange('hotelName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hotelName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hotelName && <p className="mt-1 text-sm text-red-600">{errors.hotelName}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Description *
                </label>
                <textarea
                  value={formData.hotelDescription}
                  onChange={(e) => handleInputChange('hotelDescription', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hotelDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hotelDescription && <p className="mt-1 text-sm text-red-600">{errors.hotelDescription}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    onChange={(e) => handleInputChange('hotelRating', parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Per Night (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.hotelBasicPricePerNight}
                    onChange={(e) => handleInputChange('hotelBasicPricePerNight', parseInt(e.target.value) || 0)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.hotelBasicPricePerNight ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.hotelBasicPricePerNight && <p className="mt-1 text-sm text-red-600">{errors.hotelBasicPricePerNight}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Address *
                </label>
                <input
                  type="text"
                  value={formData.hotelAddress}
                  onChange={(e) => handleInputChange('hotelAddress', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hotelAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hotelAddress && <p className="mt-1 text-sm text-red-600">{errors.hotelAddress}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Type *
                </label>
                <select
                  value={formData.hotelType}
                  onChange={(e) => handleInputChange('hotelType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hotelType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Hotel Type</option>
                  {hotelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.hotelType && <p className="mt-1 text-sm text-red-600">{errors.hotelType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landscape *
                </label>
                <select
                  value={formData.landscape}
                  onChange={(e) => handleInputChange('landscape', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.landscape ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Landscape</option>
                  {landscapes.map(landscape => (
                    <option key={landscape} value={landscape}>{landscape}</option>
                  ))}
                </select>
                {errors.landscape && <p className="mt-1 text-sm text-red-600">{errors.landscape}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Location Details
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Landmarks, nearby attractions"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.hotelEmail}
                    onChange={(e) => handleInputChange('hotelEmail', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.hotelEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.hotelEmail && <p className="mt-1 text-sm text-red-600">{errors.hotelEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.hotelPhoneNumber}
                    onChange={(e) => handleInputChange('hotelPhoneNumber', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.hotelPhoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.hotelPhoneNumber && <p className="mt-1 text-sm text-red-600">{errors.hotelPhoneNumber}</p>}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenities.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      formData.selectedAmenities.includes(amenity.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{amenity.icon}</span>
                    <span className="text-sm font-medium">{amenity.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HotelEditModal;