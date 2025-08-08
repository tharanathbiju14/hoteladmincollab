import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Star, DollarSign, MapPin, Mail, Phone } from 'lucide-react';
import { Hotel, Amenity } from '../App';

interface HotelEditModalProps {
  hotel: Hotel;
  amenities: Amenity[];
  onSave: (updatedHotel: Partial<Hotel>) => void;
  onClose: () => void;
}

interface HotelType {
  id: number;
  typeName: string;
}

interface Landscape {
  id: number;
  landscapeName: string;
}

interface District {
  id: number;
  name: string;
}

interface HotelAmenity {
  amenityId: number;
  name: string;
  icon: string;
  category: string;
}

const API_BASE = 'http://192.168.1.13:8080/hotel';

const HotelEditModal: React.FC<HotelEditModalProps> = ({ hotel, amenities, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    hotelName: hotel.hotelName,
    hotelDescription: hotel.hotelDescription,
    hotelRating: hotel.hotelRating || 0,
    hotelBasicPricePerNight: hotel.hotelBasicPricePerNight,
    hotelAddress: hotel.hotelAddress,
    district: hotel.district,
    hotelTypeId: 0,
    landscapeId: 0,
    location: hotel.location || '',
    hotelEmail: hotel.hotelEmail,
    hotelPhoneNumber: hotel.hotelPhoneNumber,
  });

  const [districts, setDistricts] = useState<District[]>([]);
  const [hotelTypes, setHotelTypes] = useState<HotelType[]>([]);
  const [landscapes, setLandscapes] = useState<Landscape[]>([]);
  const [hotelAmenities, setHotelAmenities] = useState<HotelAmenity[]>([]);
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[HotelEditModal] Fetching hotel details and related data for hotelId:', hotel.id);

        // Fetch all required data in parallel
        const [
          hotelDetailsRes,
          districtsRes, 
          hotelTypesRes, 
          landscapesRes,
          amenitiesRes
        ] = await Promise.all([
          axios.get(`${API_BASE}/get-by-hotel-id?hotelId=${hotel.id}`),
          axios.get(`${API_BASE}/districts`),
          axios.get(`${API_BASE}/get-all-hotel-types`),
          axios.get(`${API_BASE}/landscape/get-all-landscapes`),
          axios.get(`${API_BASE}/amenities/get-amenities-by-hotel?hotelId=${hotel.id}`)
        ]);

        console.log('[HotelEditModal] Hotel details response:', hotelDetailsRes.data);
        console.log('[HotelEditModal] Districts response:', districtsRes.data);
        console.log('[HotelEditModal] Hotel types response:', hotelTypesRes.data);
        console.log('[HotelEditModal] Landscapes response:', landscapesRes.data);
        console.log('[HotelEditModal] Amenities response:', amenitiesRes.data);

        const hotelDetails = hotelDetailsRes.data;
        
        // Set form data from fetched hotel details
        setFormData({
          hotelName: hotelDetails.hotelName,
          hotelDescription: hotelDetails.hotelDescription,
          hotelRating: hotelDetails.hotelRating || 0,
          hotelBasicPricePerNight: hotelDetails.hotelBasicPricePerNight,
          hotelAddress: hotelDetails.hotelAddress,
          district: hotelDetails.district,
          hotelTypeId: hotelDetails.hotelTypes?.id || 0,
          landscapeId: hotelDetails.landscape?.id || 0,
          location: hotelDetails.location || '',
          hotelEmail: hotelDetails.hotelEmail,
          hotelPhoneNumber: hotelDetails.hotelPhoneNumber,
        });

        setDistricts(districtsRes.data);
        setHotelTypes(hotelTypesRes.data);
        setLandscapes(landscapesRes.data);
        setAllAmenities(amenitiesRes.data);
        
        // Set hotel's current amenities
        setHotelAmenities(hotelDetails.amenities || []);
        setSelectedAmenities((hotelDetails.amenities || []).map((a: HotelAmenity) => a.amenityId));
        
      } catch (error) {
        console.error('[HotelEditModal] Error fetching data:', error);
        alert('Failed to load hotel data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hotel.id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.hotelName) newErrors.hotelName = 'Hotel name is required';
    if (!formData.hotelDescription) newErrors.hotelDescription = 'Description is required';
    if (!formData.hotelBasicPricePerNight) newErrors.hotelBasicPricePerNight = 'Price is required';
    if (!formData.hotelAddress) newErrors.hotelAddress = 'Address is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.hotelTypeId) newErrors.hotelTypeId = 'Hotel type is required';
    if (!formData.landscapeId) newErrors.landscapeId = 'Landscape is required';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Prepare form data for multipart request
      const formDataToSend = new FormData();
      
      const hotelUpdateData = {
        hotelName: formData.hotelName,
        hotelDescription: formData.hotelDescription,
        hotelRating: formData.hotelRating,
        hotelBasicPricePerNight: formData.hotelBasicPricePerNight,
        hotelAddress: formData.hotelAddress,
        district: formData.district,
        hotelTypeId: formData.hotelTypeId,
        landscapeId: formData.landscapeId,
        location: formData.location,
        hotelEmail: formData.hotelEmail,
        hotelPhoneNumber: formData.hotelPhoneNumber
      };

      formDataToSend.append('hotelData', new Blob([JSON.stringify(hotelUpdateData)], {
        type: 'application/json'
      }));

      // Update hotel details
      await axios.put(`${API_BASE}/edit-hotel-details?hotelId=${hotel.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Handle amenities updates
      const currentAmenityIds = hotelAmenities.map(a => a.amenityId);
      const amenitiesToAdd = selectedAmenities.filter(id => !currentAmenityIds.includes(id));
      const amenitiesToRemove = currentAmenityIds.filter(id => !selectedAmenities.includes(id));

      // Add new amenities
      if (amenitiesToAdd.length > 0) {
        await axios.post(`${API_BASE}/amenities/assign-to-hotel`, {
          hotelId: parseInt(hotel.id),
          amenityIds: amenitiesToAdd
        });
      }

      // Remove amenities
      if (amenitiesToRemove.length > 0) {
        await axios.delete(`${API_BASE}/amenities/remove-amenities-from-hotel`, {
          data: {
            hotelId: parseInt(hotel.id),
            amenityIds: amenitiesToRemove
          }
        });
      }

      // Call onSave with updated data
      const selectedAmenityNames = allAmenities
        .filter(a => selectedAmenities.includes(parseInt(a.id)))
        .map(a => a.name);

      const hotelType = hotelTypes.find(ht => ht.id === formData.hotelTypeId);
      const landscape = landscapes.find(l => l.id === formData.landscapeId);

      onSave({
        ...formData,
        hotelTypeName: hotelType?.typeName,
        landscapeTypeName: landscape?.landscapeName,
        amenities: selectedAmenityNames,
      });

      alert('Hotel updated successfully!');
      onClose();

    } catch (error) {
      console.error('Error updating hotel:', error);
      alert('Failed to update hotel. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleAmenity = (amenityId: number) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hotel data...</p>
          </div>
        </div>
      </div>
    );
  }

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
                    <option key={district.id} value={district.name}>{district.name}</option>
                  ))}
                </select>
                {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Type *
                </label>
                <select
                  value={formData.hotelTypeId}
                  onChange={(e) => handleInputChange('hotelTypeId', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hotelTypeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>Select Hotel Type</option>
                  {hotelTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.typeName}</option>
                  ))}
                </select>
                {errors.hotelTypeId && <p className="mt-1 text-sm text-red-600">{errors.hotelTypeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landscape *
                </label>
                <select
                  value={formData.landscapeId}
                  onChange={(e) => handleInputChange('landscapeId', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.landscapeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>Select Landscape</option>
                  {landscapes.map(landscape => (
                    <option key={landscape.id} value={landscape.id}>{landscape.landscapeName}</option>
                  ))}
                </select>
                {errors.landscapeId && <p className="mt-1 text-sm text-red-600">{errors.landscapeId}</p>}
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
                {allAmenities.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(parseInt(amenity.id))}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      selectedAmenities.includes(parseInt(amenity.id))
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
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HotelEditModal;