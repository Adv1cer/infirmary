import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';

interface Unit {
  unit_id: number;
  unit_type: string;
}

interface MedicineUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MedicineUnitDialog({ open, onOpenChange }: MedicineUnitDialogProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUnit, setEditingUnit] = useState<number | null>(null);
  const [newUnitType, setNewUnitType] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch units from API
  const fetchUnits = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/unit');
      if (!response.ok) {
        throw new Error('Failed to fetch units');
      }
      
      const result = await response.json();
      if (result.success) {
        const sortedUnits = result.data.sort((a: Unit, b: Unit) => a.unit_id - b.unit_id);
        setUnits(sortedUnits);
      } else {
        setError(result.error || 'Failed to fetch units');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add new unit
  const addUnit = async () => {
    if (!newUnitType.trim()) return;
    
    try {
      const csrfResponse = await fetch('/api/csrf');
      const { token } = await csrfResponse.json();
      
      const response = await fetch('/api/admin/unit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': token,
        },
        body: JSON.stringify({
          unit_type: newUnitType.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add unit');
      }

      const result = await response.json();
      if (result.success) {
        const updatedUnits = [...units, result.data].sort((a, b) => a.unit_id - b.unit_id);
        setUnits(updatedUnits);
        setNewUnitType('');
        setShowAddForm(false);
      } else {
        setError(result.error || 'Failed to add unit');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Update unit
  const updateUnit = async (unitId: number, newType: string) => {
    try {
      const csrfResponse = await fetch('/api/csrf');
      const { token } = await csrfResponse.json();
      
      const response = await fetch('/api/admin/unit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': token,
        },
        body: JSON.stringify({
          unit_id: unitId,
          unit_type: newType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update unit');
      }

      const result = await response.json();
      if (result.success) {
        const updatedUnits = units.map(u => u.unit_id === unitId ? result.data : u)
          .sort((a, b) => a.unit_id - b.unit_id);
        setUnits(updatedUnits);
        setEditingUnit(null);
      } else {
        setError(result.error || 'Failed to update unit');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Delete unit
  const deleteUnit = async (unitId: number) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        const csrfResponse = await fetch('/api/csrf');
        const { token } = await csrfResponse.json();
        
        const response = await fetch(`/api/admin/unit?unit_id=${unitId}`, {
          method: 'DELETE',
          headers: {
            'csrf-token': token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete unit');
        }

        const result = await response.json();
        if (result.success) {
          setUnits(units.filter(u => u.unit_id !== unitId));
        } else {
          setError(result.error || 'Failed to delete unit');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  // Filter units
  const filteredUnits = units.filter(unit =>
    unit.unit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.unit_id.toString().includes(searchTerm)
  );

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchUnits();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v11a3 3 0 01-3 3H6a3 3 0 01-3-3V7a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9zm1 4v8l5-4-5-4z" />
              </svg>
            </div>
            Medicine Unit Management
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Manage medicine units in the system
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
                placeholder="Search units by type or ID..."
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
              Add Unit
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-md border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value)}
                  placeholder="Enter unit type (e.g., mg, ml, tablets)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addUnit()}
                />
                <button
                  onClick={addUnit}
                  disabled={!newUnitType.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewUnitType('');
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
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Unit Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                        <span className="text-gray-500">Loading units...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      {searchTerm ? 'No units match your search.' : 'No units found.'}
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => (
                    <tr key={unit.unit_id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900">#{unit.unit_id}</td>
                      <td className="py-3 px-4">
                        {editingUnit === unit.unit_id ? (
                          <input
                            type="text"
                            defaultValue={unit.unit_type}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onBlur={(e) => {
                              if (e.target.value.trim() !== unit.unit_type) {
                                updateUnit(unit.unit_id, e.target.value.trim());
                              } else {
                                setEditingUnit(null);
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim() !== unit.unit_type) {
                                  updateUnit(unit.unit_id, target.value.trim());
                                } else {
                                  setEditingUnit(null);
                                }
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{unit.unit_type}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setEditingUnit(editingUnit === unit.unit_id ? null : unit.unit_id)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteUnit(unit.unit_id)}
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
              Showing {filteredUnits.length} of {units.length} units
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
