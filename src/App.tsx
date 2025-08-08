import React, { useState } from 'react';
import { ChevronRight, Hotel, Users, Settings, BarChart3 } from 'lucide-react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import HotelRegistration from './components/HotelRegistration';
import HotelManagement from './components/HotelManagement';
import AmenitiesManagement from './components/AmenitiesManagement';

export interface Admin {
  id: string;
  adminName: string;
  identifier: string;
  phoneNumber?: string;
}

export interface Hotel {
  id: string;
  hotelName: string;
  hotelDescription: string;
  hotelRating?: number;
  hotelBasicPricePerNight: number | string;
  hotelAddress: string;
  district: string;
  hotelType: string;
  landscape: string;
  location?: string;
  hotelEmail: string;
  hotelPhoneNumber: string;
  hotelImageUrls?: string[]; // <-- should be array
  hotelImageUploadBase64?: string[]; // <-- should be array
  hotelTypeName?: string; 
  landscapeTypeName?: string;
  hotelImages?: File[];
  amenities?: string[];
  createdAt: Date;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard' | 'hotel-registration' | 'hotel-management' | 'amenities'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([
    { id: '1', name: 'WiFi', icon: '📶', category: 'Technology' },
    { id: '2', name: 'Swimming Pool', icon: '🏊', category: 'Recreation' },
    { id: '3', name: 'Spa', icon: '🧘', category: 'Wellness' },
    { id: '4', name: 'Gym', icon: '💪', category: 'Fitness' },
    { id: '5', name: 'Restaurant', icon: '🍽️', category: 'Dining' },
    { id: '6', name: 'Room Service', icon: '🛎️', category: 'Service' },
    { id: '7', name: 'Parking', icon: '🚗', category: 'Transport' },
    { id: '8', name: 'Pet Friendly', icon: '🐕', category: 'Policy' },
  ]);

  const handleLogin = (admin: Admin) => {
    setCurrentAdmin(admin);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
    setIsAuthenticated(false);
    setCurrentView('login');
  };

  const handleHotelAdd = (hotel: Omit<Hotel, 'id' | 'createdAt'>) => {
    const newHotel: Hotel = {
      ...hotel,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setHotels(prev => [...prev, newHotel]);
  };

  const handleHotelUpdate = (id: string, updatedHotel: Partial<Hotel>) => {
    setHotels(prev => prev.map(hotel => 
      hotel.id === id ? { ...hotel, ...updatedHotel } : hotel
    ));
  };

  const handleAmenityAdd = (amenity: Omit<Amenity, 'id'>) => {
    const newAmenity: Amenity = {
      ...amenity,
      id: Date.now().toString(),
    };
    setAmenities(prev => [...prev, newAmenity]);
  };

  const handleAmenityUpdate = (id: string, updatedAmenity: Partial<Amenity>) => {
    setAmenities(prev => prev.map(amenity => 
      amenity.id === id ? { ...amenity, ...updatedAmenity } : amenity
    ));
  };

  const handleAmenityDelete = (id: string) => {
    setAmenities(prev => prev.filter(amenity => amenity.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                <Hotel size={24} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hotel Admin</h1>
              <p className="text-gray-600">Manage your hotel properties with ease</p>
            </div>

            {currentView === 'login' ? (
              <Login 
                onLogin={handleLogin} 
                onSwitchToRegister={() => setCurrentView('register')} 
              />
            ) : (
              <Register 
                onRegister={handleLogin} 
                onSwitchToLogin={() => setCurrentView('login')} 
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Hotel className="w-8 h-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">Hotel Admin</span>
              </div>
              
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setCurrentView('hotel-registration')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'hotel-registration' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Hotel size={16} />
                  <span>Add Hotel</span>
                </button>
                <button
                  onClick={() => setCurrentView('hotel-management')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'hotel-management' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users size={16} />
                  <span>Manage Hotels</span>
                </button>
                <button
                  onClick={() => setCurrentView('amenities')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'amenities' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={16} />
                  <span>Amenities</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{currentAdmin?.adminName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <Dashboard 
            hotels={hotels} 
            amenities={amenities}
            onNavigate={setCurrentView}
          />
        )}
        {currentView === 'hotel-registration' && (
          <HotelRegistration 
            onHotelAdd={handleHotelAdd}
            amenities={amenities}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'hotel-management' && (
          <HotelManagement 
            hotels={hotels}
            amenities={amenities}
            onHotelUpdate={handleHotelUpdate}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'amenities' && (
          <AmenitiesManagement 
            amenities={amenities}
            onAmenityAdd={handleAmenityAdd}
            onAmenityUpdate={handleAmenityUpdate}
            onAmenityDelete={handleAmenityDelete}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>
    </div>
  );
}

export default App;