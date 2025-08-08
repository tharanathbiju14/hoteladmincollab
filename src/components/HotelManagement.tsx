import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Search, Filter, Edit, MapPin, Star, Mail, Phone, DollarSign, Eye,
  ChevronLeft, ChevronRight, Maximize2, X
} from 'lucide-react';
import { Hotel, Amenity } from '../App';
import HotelEditModal from './HotelEditModal';

interface HotelManagementProps {
  amenities: Amenity[];
  onHotelUpdate: (id: string, updatedHotel: Partial<Hotel>) => void;
  onBack: () => void;
}

interface District {
  id: number;
  name: string;
}

const API_BASE = 'http://192.168.1.13:8080/hotel';

const HotelManagement: React.FC<HotelManagementProps> = ({
  amenities,
  onHotelUpdate,
  onBack
}) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [districts, setDistricts] = useState<string[]>(['All Districts']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [viewingHotel, setViewingHotel] = useState<Hotel | null>(null);
  const [viewingHotelImages, setViewingHotelImages] = useState<string[]>([]);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch districts and hotels in parallel
      const [districtsRes, hotelsRes] = await Promise.all([
        axios.get(`${API_BASE}/districts`),
        axios.get(`${API_BASE}/fetch-all-hotels`)
      ]);

      // Set districts
      const districtNames = districtsRes.data.map((d: District) => d.name);
      setDistricts(['All Districts', ...districtNames]);

      // Set hotels
      const hotelsData = hotelsRes.data.map((h: any) => ({
        ...h,
        id: h.hotelId?.toString() || h.id?.toString(),
        createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
        // Map amenities to names if they come as objects
        amenities: h.amenities ? h.amenities.map((a: any) => 
          typeof a === 'string' ? a : a.name
        ) : []
      }));
      
      setHotels(hotelsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.hotelAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === 'All Districts' || hotel.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  const handleEdit = async (hotel: Hotel) => {
    try {
      // Fetch complete hotel data before editing
      const response = await axios.get(`${API_BASE}/get-by-hotel-id?hotelId=${hotel.id}`);
      const completeHotelData = {
        ...hotel,
        ...response.data,
        id: hotel.id, // Keep the original ID
      };
      setEditingHotel(completeHotelData);
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      alert('Failed to load hotel details. Please try again.');
    }
  };

  const handleView = async (hotel: Hotel) => {
    try {
      setViewingHotel(hotel);
      
      // Fetch hotel images
      const [imageUrlsRes, imagesRes] = await Promise.all([
        axios.get(`${API_BASE}/get-hotel-image-urls?hotelId=${hotel.id}`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/get-hotel-images?hotelId=${hotel.id}`).catch(() => ({ data: [] }))
      ]);

      // Combine all images: uploaded (base64) and URLs
      const uploadedImages = (imagesRes.data || []).map(
        (base64: string) => `data:image/jpeg;base64,${base64}`
      );
      const urlImages = imageUrlsRes.data || [];
      setViewingHotelImages([...uploadedImages, ...urlImages]);
    } catch (error) {
      console.error('Error fetching hotel images:', error);
      // Still show the modal even if images fail to load
      setViewingHotelImages([]);
    }
  };

  const handleSaveEdit = async (updatedHotel: Partial<Hotel>) => {
    if (editingHotel) {
      try {
        // Update the hotel in local state
        setHotels(prev => prev.map(hotel => 
          hotel.id === editingHotel.id 
            ? { ...hotel, ...updatedHotel }
            : hotel
        ));
        
        // Also call the parent callback
        onHotelUpdate(editingHotel.id, updatedHotel);
        
        setEditingHotel(null);
        
        // Optionally refresh data to ensure consistency
        await fetchData();
      } catch (error) {
        console.error('Error updating hotel in management:', error);
      }
    }
  };

  const getAmenityNames = (amenitiesArr: string[]) => {
    return (amenitiesArr || []).join(', ');
  };

  // Auto-scrolling carousel for grid
  const GridImageCarousel: React.FC<{ images: string[], onImageClick?: (img: string) => void }> = ({ images, onImageClick }) => {
    const [current, setCurrent] = useState(0);

    // Auto-scroll every 2.5 seconds
    useEffect(() => {
      if (images.length <= 1) return;
      const interval = setInterval(() => {
        setCurrent(prev => (prev + 1) % images.length);
      }, 2500);
      return () => clearInterval(interval);
    }, [images]);

    useEffect(() => { setCurrent(0); }, [images]);

    if (!images.length) {
      return (
        <div className="aspect-[16/9] bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">🏨</div>
            <p className="text-sm opacity-90">No Images</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group">
        <img
          src={images[current]}
          alt={`Hotel Image ${current + 1}`}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
          onClick={() => onImageClick && onImageClick(images[current])}
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`block w-2 h-2 rounded-full ${idx === current ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Manual carousel for modal
  const ImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => { setCurrent(0); }, [images]);

    if (images.length === 0) return (
      <div className="aspect-[16/9] bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-2">🏨</div>
          <p className="text-sm opacity-90">No Images</p>
        </div>
      </div>
    );

    return (
      <div className="relative aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg">
        <img
          src={images[current]}
          alt={`Hotel Image ${current + 1}`}
          className="object-cover w-full h-full cursor-pointer"
          onClick={() => setOpenImage(images[current])}
        />
        {images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1"
              onClick={() => setCurrent((current - 1 + images.length) % images.length)}
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1"
              onClick={() => setCurrent((current + 1) % images.length)}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        <button
          className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1"
          onClick={() => setOpenImage(images[current])}
          aria-label="Open Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`block w-2 h-2 rounded-full ${idx === current ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Open image modal
  const OpenImageModal = ({ image, onClose }: { image: string, onClose: () => void }) => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="relative">
        <img src={image} alt="Full" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
              <p className="text-gray-600 mt-1">View and manage all registered hotels</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
            <p className="text-gray-600 mt-1">View and manage all registered hotels</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search hotels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* District Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredHotels.length} of {hotels.length} hotels
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => {
            // For grid preview, use existing hotel images if available
            const uploadedImages = (hotel.hotelImageUploadBase64 || []).map(
              (base64: string) => `data:image/jpeg;base64,${base64}`
            );
            const urlImages = hotel.hotelImageUrls || [];
            const allImages = [...uploadedImages, ...urlImages];

            return (
              <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Hotel Image Carousel */}
                <GridImageCarousel
                  images={allImages}
                  onImageClick={img => img && setOpenImage(img)}
                />

                <div className="p-6">
                  {/* Hotel Name & Rating */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1">{hotel.hotelName}</h3>
                    {(hotel.hotelRating !== undefined && hotel.hotelRating > 0) && (
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{hotel.hotelRating}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {hotel.hotelDescription}
                  </p>

                  {/* Location */}
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{hotel.district}</span>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm truncate">{hotel.hotelEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{hotel.hotelPhoneNumber}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-4">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">
                      ₹{hotel.hotelBasicPricePerNight}
                    </span>
                    <span className="text-sm text-gray-600">per night</span>
                  </div>

                  {/* Hotel Type & Landscape */}
                  <div className="mb-4 space-y-1">
                    {hotel.hotelTypeName && (
                      <p className="text-xs text-gray-500">
                        Type: <span className="text-gray-700">{hotel.hotelTypeName}</span>
                      </p>
                    )}
                    {hotel.landscapeTypeName && (
                      <p className="text-xs text-gray-500">
                        Landscape: <span className="text-gray-700">{hotel.landscapeTypeName}</span>
                      </p>
                    )}
                  </div>

                  {/* Amenities */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                      <p className="text-sm text-gray-700 line-clamp-1">
                        {getAmenityNames(hotel.amenities)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(hotel)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </button>
                    <button
                      onClick={() => handleEdit(hotel)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedDistrict !== 'All Districts'
              ? 'Try adjusting your search criteria'
              : 'No hotels have been registered yet'}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingHotel && (
        <HotelEditModal
          hotel={editingHotel}
          amenities={amenities}
          onSave={handleSaveEdit}
          onClose={() => setEditingHotel(null)}
        />
      )}

      {/* View Modal */}
      {viewingHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Hotel Details</h2>
                <button
                  onClick={() => setViewingHotel(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Show all images */}
              <ImageCarousel images={viewingHotelImages} />

              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{viewingHotel.hotelName}</h3>
                  <p className="text-gray-600 mt-1">{viewingHotel.hotelDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">District:</span>
                    <p className="text-gray-600">{viewingHotel.district}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Hotel Type:</span>
                    <p className="text-gray-600">{viewingHotel.hotelTypeName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Landscape:</span>
                    <p className="text-gray-600">{viewingHotel.landscapeTypeName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Rating:</span>
                    <p className="text-gray-600">{viewingHotel.hotelRating || 0}/5</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-900">Address:</span>
                  <p className="text-gray-600">{viewingHotel.hotelAddress}</p>
                  {viewingHotel.location && (
                    <p className="text-gray-600 text-sm">{viewingHotel.location}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Email:</span>
                    <p className="text-gray-600 break-words">{viewingHotel.hotelEmail}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Phone:</span>
                    <p className="text-gray-600">{viewingHotel.hotelPhoneNumber}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-900">Price per night:</span>
                  <p className="text-2xl font-bold text-green-600">₹{viewingHotel.hotelBasicPricePerNight}</p>
                </div>

                {viewingHotel.amenities && viewingHotel.amenities.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-900">Amenities:</span>
                    <p className="text-gray-600">{getAmenityNames(viewingHotel.amenities)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Image Modal */}
      {openImage && (
        <OpenImageModal image={openImage} onClose={() => setOpenImage(null)} />
      )}
    </div>
  );
};

export default HotelManagement;