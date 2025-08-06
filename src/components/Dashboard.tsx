import React from 'react';
import { Hotel, Settings, Users, BarChart3, TrendingUp, MapPin, Star } from 'lucide-react';
import { Hotel as HotelType, Amenity } from '../App';

interface DashboardProps {
  hotels: HotelType[];
  amenities: Amenity[];
  onNavigate: (view: 'hotel-registration' | 'hotel-management' | 'amenities') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ hotels, amenities, onNavigate }) => {
  const totalHotels = hotels.length;
  const totalAmenities = amenities.length;
  const averageRating = hotels.length > 0 
    ? hotels.reduce((sum, hotel) => sum + (hotel.hotelRating || 0), 0) / hotels.length 
    : 0;
  const totalRevenue = hotels.reduce((sum, hotel) => sum + hotel.hotelBasicPricePerNight, 0);

  const recentHotels = hotels
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  const districtCounts = hotels.reduce((acc, hotel) => {
    acc[hotel.district] = (acc[hotel.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your hotel properties and amenities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hotels</p>
              <p className="text-3xl font-bold text-gray-900">{totalHotels}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Hotel className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Active properties</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Amenities</p>
              <p className="text-3xl font-bold text-gray-900">{totalAmenities}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Settings className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-emerald-600">
            <span>Available services</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-yellow-600">
            <span>Customer satisfaction</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <span>Per night revenue</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('hotel-registration')}
            className="flex items-center justify-center space-x-3 bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors"
          >
            <Hotel className="w-5 h-5" />
            <span className="font-medium">Add New Hotel</span>
          </button>
          <button
            onClick={() => onNavigate('hotel-management')}
            className="flex items-center justify-center space-x-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-4 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Manage Hotels</span>
          </button>
          <button
            onClick={() => onNavigate('amenities')}
            className="flex items-center justify-center space-x-3 bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Manage Amenities</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Hotels</h2>
          {recentHotels.length > 0 ? (
            <div className="space-y-4">
              {recentHotels.map((hotel) => (
                <div key={hotel.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Hotel className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{hotel.hotelName}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.district}</span>
                      {hotel.hotelRating && (
                        <>
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{hotel.hotelRating}/5</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{hotel.hotelBasicPricePerNight}</p>
                    <p className="text-sm text-gray-600">per night</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Hotel className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hotels registered yet</p>
              <button
                onClick={() => onNavigate('hotel-registration')}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first hotel
              </button>
            </div>
          )}
        </div>

        {/* District Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hotels by District</h2>
          {Object.keys(districtCounts).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(districtCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([district, count]) => (
                  <div key={district} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{district}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {count}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No district data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;