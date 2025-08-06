import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Amenity } from '../App';

interface AmenitiesManagementProps {
  onBack: () => void;
}

const AmenitiesManagement: React.FC<AmenitiesManagementProps> = ({
  onBack
}) => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [newAmenity, setNewAmenity] = useState({
    name: ''
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    axios.get('http://192.168.1.11:8080/hotel/amenities/retrieve-all-amenities')
      .then(res => {
        const mappedAmenities = res.data.map((item: any) => ({
          id: item.amenitiesId,
          name: item.amenitiesName,
          category: item.category || '',
          icon: '🏷️'
        }));
        setAmenities(mappedAmenities);
      })
      .catch(() => alert('Failed to load amenities'));
  }, []);

  const handleAddAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    if (newAmenity.name) {
      axios.post(
        'http://192.168.1.11:8080/hotel/amenities/add',
        {
          amenitiesName: newAmenity.name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(() => {
        return axios.get('4:8080/hotel/amenities/retrieve-all-amenities', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      })
      .then(res => {
        const mappedAmenities = res.data.map((item: any) => ({
          id: item.amenitiesId,
          name: item.amenitiesName,
          category: item.category || '',
          icon: '🏷️'
        }));
        setAmenities(mappedAmenities);
        setNewAmenity({ name: '' });
        setShowAddForm(false);
      })
      .catch(() => alert('Failed to add amenity'));
    }
  };

  const handleEditAmenity = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setNewAmenity({ name: amenity.name }); // Set the current name for editing
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAmenity) {
      const token = localStorage.getItem('jwt_token'); // Retrieve the token
      axios.put(
        `http://192.168.1.11:8080/hotel/amenities/edit-amenities`,
        null,
        {
          params: {
            amenitiesId: editingAmenity.id,
            newName: newAmenity.name
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(() => {
        // Refresh amenities list after editing
        return axios.get('http://192.168.1.11:8080/hotel/amenities/retrieve-all-amenities');
      })
      .then(res => {
        const mappedAmenities = res.data.map((item: any) => ({
          id: item.amenitiesId,
          name: item.amenitiesName,
          category: item.category || '',
          icon: '🏷️'
        }));
        setAmenities(mappedAmenities);
        setEditingAmenity(null);
        setNewAmenity({ name: '' });
      })
      .catch(err => {
        console.error('Error updating amenity:', err);
        alert(err.response?.data ?? 'Failed to update amenity');
      });
    }
  };

  const handleDeleteAmenity = (id: string) => {
    const token = localStorage.getItem('jwt_token'); // Retrieve the token
    if (window.confirm('Are you sure you want to delete this amenity?')) {
      axios.delete(
        `http://192.168.1.11:8080/hotel/amenities/delete-amenities?amenitiesId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(() => {
        return axios.get('http://192.168.1.11:8080/hotel/amenities/retrieve-all-amenities', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      })
      .then(res => {
        const mappedAmenities = res.data.map((item: any) => ({
          id: item.amenitiesId,
          name: item.amenitiesName,
          category: item.category || '',
          icon: '🏷️'
        }));
        setAmenities(mappedAmenities);
      })
      .catch(err => {
        console.error('Error deleting amenity:', err);
        alert(err.response?.data ?? 'Failed to delete amenity');
      });
    }
  };

  const sortedAmenities = [...amenities].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Centered Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Amenities Management</h1>
        <p className="text-gray-600 mt-1">Manage hotel amenities and services</p>
      </div>

      {/* Stats Box on the Side */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 w-1/4 float-right">
        <div className="flex justify-center">
          <p className="text-2xl font-bold text-gray-900">{amenities.length}</p>
        </div>
        <div className="flex justify-center">
          <p className="text-sm text-gray-600">Total Amenities</p>
        </div>
      </div>

      {/* Sort and Add Amenity Button */}
      <div className="flex items-center mb-4 gap-4">
        <div className="flex items-center">
          <label className="mr-2 font-medium text-gray-700">Sort by:</label>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-2 py-1 border border-gray-300 rounded-lg"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Amenity</span>
        </button>
      </div>

      {/* Add Amenity Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add New Amenity</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddAmenity} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenity Name
              </label>
              <input
                type="text"
                value={newAmenity.name}
                onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Swimming Pool"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Amenity
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Amenities List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Amenities List
        </h2>
        {amenities.length === 0 ? (
          <p className="text-gray-600">No amenities found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedAmenities.map((amenity) => (
              <AmenityCard
                key={amenity.id}
                amenity={amenity}
                onEdit={handleEditAmenity}
                onDelete={handleDeleteAmenity}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingAmenity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Edit Amenity</h2>
                <button
                  onClick={() => setEditingAmenity(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenity Name
                  </label>
                  <input
                    type="text"
                    value={newAmenity.name}
                    onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingAmenity(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AmenityCardProps {
  amenity: Amenity;
  onEdit: (amenity: Amenity) => void;
  onDelete: (id: string) => void;
}

const AmenityCard: React.FC<AmenityCardProps> = ({ amenity, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-2xl">🏷️</span>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{amenity.name}</h3>
          <p className="text-sm text-gray-600">{amenity.category}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(amenity)}
          className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm transition-colors"
        >
          <Edit className="w-3 h-3" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(amenity.id)}
          className="flex-1 flex items-center justify-center space-x-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default AmenitiesManagement;