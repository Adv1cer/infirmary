import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from 'lucide-react';

interface DialogAddSymptomProps {
  onSave?: (data: any) => void;
  onSuccess?: () => void;
}

export default function DialogAddSymptom({ onSave, onSuccess }: DialogAddSymptomProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    symptom_name: '',
  });

  // Helper to fetch CSRF token
  async function getCsrfToken(): Promise<string> {
    const res = await fetch('/api/csrf');
    const data = await res.json();
    return data.token || data.csrfToken;
  }

  // Helper to POST with CSRF and auto-retry on 403
  async function fetchWithCsrfRetry(
    url: string,
    options: RequestInit = {},
    maxRetry = 1
  ): Promise<Response> {
    let csrfToken = await getCsrfToken();
    let attempt = 0;
    while (attempt <= maxRetry) {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers ? options.headers : {}),
          'csrf-token': csrfToken,
        },
      });
      if (res.status !== 403) return res;
      // If forbidden, try to get a new token and retry
      csrfToken = await getCsrfToken();
      attempt++;
    }
    throw new Error('Forbidden: CSRF token expired or invalid');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.symptom_name.trim()) {
      setError('Symptom name is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetchWithCsrfRetry('/api/admin/symptom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptom_name: form.symptom_name.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add symptom');
      }

      const result = await response.json();
      
      if (result.success) {
        // Reset form and close dialog
        setForm({ symptom_name: '' });
        setOpen(false);
        
        // Call callbacks
        if (onSave) onSave(result.data);
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || 'Failed to add symptom');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ symptom_name: '' });
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Add Symptom
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Add New Symptom
          </DialogTitle>
          <DialogDescription>
            Add a new symptom to the system. This symptom will be available for patient forms and medical records.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Symptom Name Field */}
          <div className="space-y-2">
            <Label htmlFor="symptom_name" className="text-sm font-medium">
              Symptom Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="symptom_name"
              name="symptom_name"
              type="text"
              value={form.symptom_name}
              onChange={handleChange}
              placeholder="Enter symptom name (e.g., Fever, Headache, Cough)"
              disabled={loading}
              className="w-full"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.symptom_name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Symptom
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
