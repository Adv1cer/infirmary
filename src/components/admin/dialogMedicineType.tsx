import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';

interface PillType {
  type_id: number;
  type_name: string;
}

interface MedicineTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MedicineTypeDialog({ open, onOpenChange }: MedicineTypeDialogProps) {
  const [pillTypes, setPillTypes] = useState<PillType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingType, setEditingType] = useState<number | null>(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch pill types from API
  const fetchPillTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/pilltype');
      if (!response.ok) {
        throw new Error('Failed to fetch pill types');
      }
      
      const result = await response.json();
      if (result.success) {
        const sortedTypes = result.data.sort((a: PillType, b: PillType) => a.type_id - b.type_id);
        setPillTypes(sortedTypes);
      } else {
        setError(result.error || 'Failed to fetch pill types');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add new pill type
  const addPillType = async () => {
    if (!newTypeName.trim()) return;
    
    try {
      const csrfResponse = await fetch('/api/csrf');
      const { token } = await csrfResponse.json();
      
      const response = await fetch('/api/admin/pilltype', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': token,
        },
        body: JSON.stringify({
          type_name: newTypeName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add pill type');
      }

      const result = await response.json();
      if (result.success) {
        const updatedTypes = [...pillTypes, result.data].sort((a, b) => a.type_id - b.type_id);
        setPillTypes(updatedTypes);
        setNewTypeName('');
        setShowAddForm(false);
      } else {
        setError(result.error || 'Failed to add pill type');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Update pill type
  const updatePillType = async (typeId: number, newName: string) => {
    try {
      const csrfResponse = await fetch('/api/csrf');
      const { token } = await csrfResponse.json();
      
      const response = await fetch('/api/admin/pilltype', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': token,
        },
        body: JSON.stringify({
          type_id: typeId,
          type_name: newName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pill type');
      }

      const result = await response.json();
      if (result.success) {
        const updatedTypes = pillTypes.map(t => t.type_id === typeId ? result.data : t)
          .sort((a, b) => a.type_id - b.type_id);
        setPillTypes(updatedTypes);
        setEditingType(null);
      } else {
        setError(result.error || 'Failed to update pill type');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Delete pill type
  const deletePillType = async (typeId: number) => {
    if (window.confirm('Are you sure you want to delete this pill type?')) {
      try {
        const csrfResponse = await fetch('/api/csrf');
        const { token } = await csrfResponse.json();
        
        const response = await fetch(`/api/admin/pilltype?type_id=${typeId}`, {
          method: 'DELETE',
          headers: {
            'csrf-token': token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete pill type');
        }

        const result = await response.json();
        if (result.success) {
          setPillTypes(pillTypes.filter(t => t.type_id !== typeId));
        } else {
          setError(result.error || 'Failed to delete pill type');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  // Filter pill types
  const filteredTypes = pillTypes.filter(type =>
    type.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.type_id.toString().includes(searchTerm)
  );

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchPillTypes();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            Medicine Type Management
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Manage medicine types in the system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Search Bar and Add Button */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicine types by name or ID..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Type
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-md border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Enter medicine type name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addPillType()}
                />
                <button
                  onClick={addPillType}
                  disabled={!newTypeName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTypeName('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Type Name</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                        <span className="text-gray-500">Loading types...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTypes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      {searchTerm ? 'No types match your search.' : 'No types found.'}
                    </td>
                  </tr>
                ) : (
                  filteredTypes.map((type) => (
                    <tr key={type.type_id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900">#{type.type_id}</td>
                      <td className="py-3 px-4">
                        {editingType === type.type_id ? (
                          <input
                            type="text"
                            defaultValue={type.type_name}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onBlur={(e) => {
                              if (e.target.value.trim() !== type.type_name) {
                                updatePillType(type.type_id, e.target.value.trim());
                              } else {
                                setEditingType(null);
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim() !== type.type_name) {
                                  updatePillType(type.type_id, target.value.trim());
                                } else {
                                  setEditingType(null);
                                }
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{type.type_name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setEditingType(editingType === type.type_id ? null : type.type_id)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deletePillType(type.type_id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Search Results Summary */}
          {searchTerm && (
            <div className="text-sm text-gray-500 text-center">
              Showing {filteredTypes.length} of {pillTypes.length} types
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
