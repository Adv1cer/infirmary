import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, RefreshCw, Award, Download, User, Share, Briefcase, Edit, Trash2, Plus, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DialogAddSymptom from './dialogSymptom/dialogAddSymptom';
import MedicineTypeDialog from './dialogMedicineType';
import MedicineUnitDialog from './dialogMedicineUnit';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import toast from 'react-hot-toast';

interface DropdownOption {
  value: string;
  label: string;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface UserData {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role_id: number;
  role_name: string;
}

interface Symptom {
  symptom_id: number;
  symptom_name: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

function CustomDropdown({ 
  options, 
  placeholder = "Select...", 
  value, 
  onChange,
  className = ""
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    onChange?.(optionValue);
  };

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Text box that triggers dropdown */}
      <div
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer
          bg-white text-sm text-gray-700 hover:border-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          flex items-center justify-between
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          ${!selectedValue ? 'text-gray-400' : 'text-gray-700'}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayText}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={`
                  px-3 py-2 text-sm cursor-pointer hover:bg-gray-100
                  ${selectedValue === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                `}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Expandable Settings Item Component
interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
}

function ExpandableSettingsItem({ 
  icon, 
  title, 
  description, 
  children, 
  defaultExpanded = false 
}: SettingsItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-600">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <ChevronRight 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`} 
        />
      </button>
      
      {isExpanded && children && (
        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
          <div className="pt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [dropdownType, setDropdownType] = useState('');
  const [dropdownVariant, setDropdownVariant] = useState('');  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editingSymptom, setEditingSymptom] = useState<number | null>(null);
  const [symptomSearchTerm, setSymptomSearchTerm] = useState('');  const [showMedicineTypeDialog, setShowMedicineTypeDialog] = useState(false);
  const [showMedicineUnitDialog, setShowMedicineUnitDialog] = useState(false);
  const [generatedSignupLink, setGeneratedSignupLink] = useState<string | null>(null);
  const [showSignupLinkDialog, setShowSignupLinkDialog] = useState(false);

  // Role change confirmation dialog state
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: number;
    newRoleId: number;
    userName: string;
    newRoleName: string;
    isOwnRole: boolean;
  } | null>(null);
  // Check authentication and authorization
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      toast.error('Please login to access admin panel');
      router.push('/Login');
      return;
    }
    
    // Check if user has admin role (role ID 1 or role name 'admin' or 'Administrator')
    const userRole = session.user?.role;
    if (userRole !== '1' && userRole !== 'admin' && userRole !== 'Administrator') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/Home');
      return;
    }
  }, [session, status, router]);

  // Watch for session changes and refresh admin state if needed
  useEffect(() => {
    if (session?.user) {
      // If this is a session update (not initial load), refresh the data
      const currentTime = Date.now();
      const lastFetch = localStorage.getItem('adminLastFetch');
      
      if (lastFetch && (currentTime - parseInt(lastFetch)) < 5000) {
        // Recent session update, refresh the admin data
        fetchUsers();
        fetchRoles();
        fetchSymptoms();
      }
    }
  }, [session?.user?.role]); // Watch specifically for role changes

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  // Fetch roles from database
  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRoles(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      // Fallback to default roles if API fails
      setRoles([
        { role_id: 1, role_name: 'Administrator' },
        { role_id: 2, role_name: 'Doctor' },
        { role_id: 3, role_name: 'Nurse' },
        { role_id: 4, role_name: 'Pharmacist' },
        { role_id: 5, role_name: 'Receptionist' },
      ]);
    }  };

  // Initial data fetch
  useEffect(() => {
    // Only fetch data if user is authenticated and authorized
    if (session && (session.user?.role === '1' || session.user?.role === 'admin' || session.user?.role === 'Administrator')) {
      fetchUsers();
      fetchRoles();
      fetchSymptoms();
    }
  }, [session]);
  // Prepare role change with confirmation
  const prepareRoleChange = (userId: number, newRoleId: number) => {
    const user = users.find(u => u.user_id === userId);
    const newRole = roles.find(r => r.role_id === newRoleId);
    
    if (!user || !newRole) {
      toast.error('Invalid user or role selection');
      return;
    }

    const isOwnRole = session?.user?.id === userId.toString();
    
    setPendingRoleChange({
      userId,
      newRoleId,
      userName: user.name,
      newRoleName: newRole.role_name,
      isOwnRole
    });
    setShowRoleChangeDialog(true);
  };
  // Confirm and execute role change
  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    
    setShowRoleChangeDialog(false);
    
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: pendingRoleChange.userId,
          role_id: pendingRoleChange.newRoleId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      const result = await response.json();
      if (result.success) {
        // Update the user in local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.user_id === pendingRoleChange.userId 
              ? { ...user, role_id: pendingRoleChange.newRoleId, role_name: result.data.role_name }
              : user
          )
        );
        
        toast.success(`Role updated successfully for ${pendingRoleChange.userName}`);        // If admin changed their own role, handle session update
        if (pendingRoleChange.isOwnRole) {
          try {
            // Trigger session update and wait for it
            await update();
            
            // Give a moment for the session to fully update
            setTimeout(async () => {
              // Check the updated role from the result data (fresh from database)
              const newRole = result.data.role_name?.toLowerCase() || '';
              if (newRole !== 'administrator' && newRole !== 'admin') {
                // Lost admin privileges, sign out
                toast.loading('Role changed. You no longer have admin access. Redirecting to login...', { duration: 3000 });
                setTimeout(() => {
                  signOut({ callbackUrl: '/Login' });
                }, 3000);
              } else {
                // Still admin, force page reload to ensure everything updates
                toast.success('Your role has been updated. Refreshing page...', { duration: 2000 });
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }
            }, 500);
          } catch (sessionError) {
            console.error('Error refreshing session:', sessionError);
            // Fallback to page reload
            toast.loading('Role changed. Refreshing page to update session...', { duration: 2000 });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } else {
        setError(result.error || 'Failed to update user role');
        toast.error(result.error || 'Failed to update user role');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPendingRoleChange(null);
      setEditingUser(null);
    }
  };

  // Update user role
  const updateUserRole = async (userId: number, newRoleId: number) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          role_id: newRoleId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      const result = await response.json();
      if (result.success) {
        // Update the user in local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.user_id === userId 
              ? { ...user, role_id: newRoleId, role_name: result.data.role_name }
              : user
          )
        );
      } else {
        setError(result.error || 'Failed to update user role');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Sample options
  const typeOptions: DropdownOption[] = [
    { value: 'user', label: 'User Management' },
    { value: 'medicine', label: 'Medicine Management' },
    { value: 'patient', label: 'Patient Management' },
    { value: 'prescription', label: 'Prescription Management' },
    { value: 'statistics', label: 'Statistics & Reports' }
  ];

  const variantOptions: DropdownOption[] = [
    { value: 'create', label: 'Create' },
    { value: 'read', label: 'Read' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'export', label: 'Export' }
  ];
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/admin?user_id=${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        const result = await response.json();
        if (result.success) {
          // Remove user from local state
          setUsers(users.filter(user => user.user_id !== userId));
        } else {
          setError(result.error || 'Failed to delete user');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }    }
  };  // Fetch symptoms from API
  const fetchSymptoms = async () => {
    try {
      console.log('Fetching symptoms...');
      const response = await fetch('/api/admin/symptom');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch symptoms');
      }
      
      const result = await response.json();
      console.log('Symptoms API result:', result);
        if (result.success) {
        // Sort by symptom_id
        const sortedSymptoms = result.data.sort((a: Symptom, b: Symptom) => a.symptom_id - b.symptom_id);
        setSymptoms(sortedSymptoms);
        console.log('Symptoms set to state:', sortedSymptoms);
      } else {
        setError(result.error || 'Failed to fetch symptoms');
      }
    } catch (err) {
      console.error('Error fetching symptoms:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Handle successful symptom addition from dialog
  const handleSymptomAdded = (newSymptom: Symptom) => {
    // Sort by symptom_id and add to state
    const updatedSymptoms = [...symptoms, newSymptom].sort((a, b) => a.symptom_id - b.symptom_id);
    setSymptoms(updatedSymptoms);
  };

  // Update symptom
  const updateSymptom = async (symptomId: number, newName: string) => {
    try {
      const csrfResponse = await fetch('/api/csrf');
      const { token } = await csrfResponse.json();
      
      const response = await fetch('/api/admin/symptom', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': token,
        },
        body: JSON.stringify({
          symptom_id: symptomId,
          symptom_name: newName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update symptom');
      }      const result = await response.json();
      if (result.success) {
        // Update and maintain sorting
        const updatedSymptoms = symptoms.map(s => s.symptom_id === symptomId ? result.data : s)
          .sort((a, b) => a.symptom_id - b.symptom_id);
        setSymptoms(updatedSymptoms);
        setEditingSymptom(null);
      } else {
        setError(result.error || 'Failed to update symptom');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Delete symptom
  const deleteSymptom = async (symptomId: number) => {
    if (window.confirm('Are you sure you want to delete this symptom?')) {
      try {
        const csrfResponse = await fetch('/api/csrf');
        const { token } = await csrfResponse.json();
        
        const response = await fetch(`/api/admin/symptom?symptom_id=${symptomId}`, {
          method: 'DELETE',
          headers: {
            'csrf-token': token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete symptom');
        }        const result = await response.json();
        if (result.success) {
          // Remove and maintain sorting (though filtering already maintains order)
          setSymptoms(symptoms.filter(s => s.symptom_id !== symptomId));
        } else {
          setError(result.error || 'Failed to delete symptom');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };
  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Administrator': return 'bg-red-100 text-red-800';
      case 'Doctor': return 'bg-blue-100 text-blue-800';
      case 'Nurse': return 'bg-green-100 text-green-800';
      case 'Pharmacist': return 'bg-purple-100 text-purple-800';
      case 'Receptionist': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  // Filter symptoms based on search term
  const filteredSymptoms = symptoms.filter(symptom =>
    symptom.symptom_name.toLowerCase().includes(symptomSearchTerm.toLowerCase()) ||
    symptom.symptom_id.toString().includes(symptomSearchTerm)
  );  // Generate one-time signup link
  const generateSignupLink = async () => {
    try {
      console.log(`Admin ${session?.user?.email} (ID: ${session?.user?.id}) generating signup link`);
      
      const csrfResponse = await fetch('/api/csrf');
      const { token } = await csrfResponse.json();
      
      const response = await fetch('/api/admin/signup-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate signup link');
      }

      const result = await response.json();
      if (result.success) {
        setGeneratedSignupLink(result.data.signupUrl);
        setShowSignupLinkDialog(true);
        toast.success('Signup link generated successfully!');
        console.log(`Signup link generated by admin ${session?.user?.email}`);
      } else {
        setError(result.error || 'Failed to generate signup link');
        toast.error(result.error || 'Failed to generate signup link');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(`Error generating signup link for admin ${session?.user?.email}:`, err);
    }
  };
  // Copy link to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for insecure context or unsupported browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed"; // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy link');
    }
  };

  // Show loading while session is being loaded
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not logged in or not admin
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to access the admin panel</p>
          <button
            onClick={() => router.push('/Login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check admin role
  const userRole = session.user?.role;
  if (userRole !== '1' && userRole !== 'admin' && userRole !== 'Administrator') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <Briefcase className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges to access this page</p>
          <button
            onClick={() => router.push('/Home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Manage system settings and configurations</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Logged in as Admin</div>
              <div className="font-medium text-gray-900">{session.user?.name || session.user?.email}</div>
              <div className="text-sm text-blue-600">Role: {session.user?.role}</div>
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team Management Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Team Management</h2>
                <p className="text-sm text-gray-500 mt-1">Manage team members and their roles</p>
              </div>              <div className="flex items-center gap-2">
                <button 
                  onClick={generateSignupLink}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
                <button 
                  onClick={fetchUsers}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            <ExpandableSettingsItem
              icon={<User className="w-5 h-5" />}
              title="Team Members"
              description={`Manage ${users.length} team members and their permissions`}
              defaultExpanded={true}
            >
              <div className="overflow-x-auto">                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Role</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                            <span className="text-gray-500">Loading team members...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No team members found.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (<tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-900">#{user.user_id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.phone}</td>
                        <td className="py-3 px-4">
                          {editingUser === user.user_id ? (
                            <CustomDropdown
                              options={roles.map(role => ({ value: role.role_id.toString(), label: role.role_name }))}
                              value={user.role_id.toString()}                              onChange={(newRoleId) => {
                                prepareRoleChange(user.user_id, parseInt(newRoleId));
                              }}
                              className="w-40"
                            />
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role_name)}`}>
                              {user.role_name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setEditingUser(editingUser === user.user_id ? null : user.user_id)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>))
                    )}
                  </tbody>
                </table>
              </div>
            </ExpandableSettingsItem>

        

            <ExpandableSettingsItem
              icon={<Award className="w-5 h-5" />}
              title="User Statistics"
              description="View team statistics and analytics"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                  <div className="text-sm text-blue-800">Total Users</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.role_name === 'Doctor').length}
                  </div>
                  <div className="text-sm text-green-800">Doctors</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.role_name === 'Nurse').length}
                  </div>
                  <div className="text-sm text-purple-800">Nurses</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.role_name === 'Administrator').length}
                  </div>
                  <div className="text-sm text-red-800">Admins</div>
                </div>
              </div>            </ExpandableSettingsItem>
          </div>
        </div>

        {/* System Management Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">System Management</h2>
                <p className="text-sm text-gray-500 mt-1">System settings and database operations</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            <ExpandableSettingsItem
              icon={<Share className="w-5 h-5" />}
              title="Medicine"
              description="Manage patient symptoms and related data"
              defaultExpanded={false}
            >              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Medicine Type</h3>
                  <p className="text-gray-600 text-sm mb-4">Manage medicine types</p>
                  <button 
                    onClick={() => setShowMedicineTypeDialog(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Manage Types
                  </button>
                </div>                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Medicine Unit</h3>
                  <p className="text-gray-600 text-sm mb-4">Manage medicine units</p>
                  <button 
                    onClick={() => setShowMedicineUnitDialog(true)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  >
                    Manage Units
                  </button>
                </div>
              </div>
            </ExpandableSettingsItem>
          </div>
          <div className="divide-y divide-gray-200">            <ExpandableSettingsItem
              icon={<Share className="w-5 h-5" />}
              title="Symptoms"
              description="Manage patient symptoms and related data"
              defaultExpanded={false}
            >
              <div className="space-y-4">
                {/* Search Bar and Add Button */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={symptomSearchTerm}
                      onChange={(e) => setSymptomSearchTerm(e.target.value)}
                      placeholder="Search symptoms by name or ID..."
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
                    </svg>                  </div>
                  <DialogAddSymptom onSave={handleSymptomAdded} />
                </div>

                {/* Symptoms Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Symptom Name</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center">
                            <div className="flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                              <span className="text-gray-500">Loading symptoms...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredSymptoms.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-gray-500">
                            {symptomSearchTerm ? 'No symptoms match your search.' : 'No symptoms found.'}
                          </td>
                        </tr>
                      ) : (
                        filteredSymptoms.map((symptom) => (
                          <tr key={symptom.symptom_id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm text-gray-900">#{symptom.symptom_id}</td>
                            <td className="py-3 px-4">
                              {editingSymptom === symptom.symptom_id ? (
                                <input
                                  type="text"
                                  defaultValue={symptom.symptom_name}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onBlur={(e) => {
                                    if (e.target.value.trim() !== symptom.symptom_name) {
                                      updateSymptom(symptom.symptom_id, e.target.value.trim());
                                    } else {
                                      setEditingSymptom(null);
                                    }
                                  }}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      const target = e.target as HTMLInputElement;
                                      if (target.value.trim() !== symptom.symptom_name) {
                                        updateSymptom(symptom.symptom_id, target.value.trim());
                                      } else {
                                        setEditingSymptom(null);
                                      }
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <span className="text-sm text-gray-900">{symptom.symptom_name}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => setEditingSymptom(editingSymptom === symptom.symptom_id ? null : symptom.symptom_id)}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteSymptom(symptom.symptom_id)}
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
                {symptomSearchTerm && (
                  <div className="text-sm text-gray-500 text-center">
                    Showing {filteredSymptoms.length} of {symptoms.length} symptoms
                  </div>
                )}
              </div>
            </ExpandableSettingsItem>
          </div>
          
          <div className="divide-y divide-gray-200">
            <ExpandableSettingsItem
              icon={<Share className="w-5 h-5" />}
              title="System"
              description="System settings and database operations"
              defaultExpanded={false}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Activity</h3>
                  <p className="text-gray-600 text-sm mb-4">View system logs and activity</p>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                    View
                  </button>
                </div>                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Database Backup</h3>
                  <p className="text-gray-600 text-sm mb-4">Backup and restore database</p>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                    Backup
                  </button>
                </div>
              </div>
            </ExpandableSettingsItem>          </div>        </div>      {/* Dialogs */}
      <MedicineTypeDialog open={showMedicineTypeDialog} onOpenChange={setShowMedicineTypeDialog} />
      <MedicineUnitDialog open={showMedicineUnitDialog} onOpenChange={setShowMedicineUnitDialog} />
      
      {/* Signup Link Dialog */}
      <Dialog open={showSignupLinkDialog} onOpenChange={setShowSignupLinkDialog}>
        <DialogContent className="max-w-2xl mx-auto">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-green-600" />
              </div>
              One-Time Signup Link Generated
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Share this link with the new user. The link expires in 24 hours and can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signup Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedSignupLink || ''}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => generatedSignupLink && copyToClipboard(generatedSignupLink)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important:</h4>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                    <li>This link expires in 24 hours</li>
                    <li>It can only be used once</li>
                    <li>Share it securely with the intended user</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowSignupLinkDialog(false);
                  setGeneratedSignupLink(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={showRoleChangeDialog} onOpenChange={setShowRoleChangeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Confirm Role Change
            </DialogTitle>            <DialogDescription>
              {pendingRoleChange?.isOwnRole 
                ? "⚠️ WARNING: You are about to change your own role. This action may affect your access to the admin panel and will refresh your session."
                : "You are about to change this user's role and permissions. This action will immediately update their access level."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {pendingRoleChange && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">User:</span> {pendingRoleChange.userName}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">New Role:</span> {pendingRoleChange.newRoleName}
                  </div>
                </div>
              </div>
            )}
            
            {pendingRoleChange?.isOwnRole && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Warning:</h4>                    <p className="text-sm text-yellow-700 mt-1">
                      {pendingRoleChange.newRoleName.toLowerCase() === 'administrator' || 
                       pendingRoleChange.newRoleName.toLowerCase() === 'admin'
                        ? "You will maintain admin access, but your session will be refreshed and the page will reload."
                        : "⚠️ CRITICAL: You will permanently lose admin access and be automatically signed out. Make sure this is what you want!"
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowRoleChangeDialog(false);
                  setPendingRoleChange(null);
                  setEditingUser(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      </div>
    </div>
  );
}
