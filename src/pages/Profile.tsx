import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Camera, LogOut, Mail, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient, removeAuthToken } from '../services/api';

interface ProfileData {
  id?: number;
  user_id: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  foto_perfil?: string;
  genero?: "M" | "F" | "O";
  fecha_nacimiento?: string;
  telefono?: string;
  estado?: string;
}

interface ProfileProps {
  onLogout: () => void;
}

export default function Profile({ onLogout }: ProfileProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const userId = localStorage.getItem('user_id');
  const username = localStorage.getItem('username');
  
  const [profile, setProfile] = useState<ProfileData>({
    user_id: userId ? parseInt(userId) : 0,
    nombre: '',
    apellido: '',
    email: '',
    foto_perfil: '',
    genero: 'otro',
    fecha_nacimiento: '',
    telefono: '',
    estado: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Cargar perfil
  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    loadProfile();
  }, [userId, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.getProfile(parseInt(userId!));
      setProfile(data);
      // store perfil id (Usuario.id) for other endpoints (meal history)
      if (data && (data as any).id) {
        localStorage.setItem('usuario_id', String((data as any).id));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('No profile found. Creating a new one...');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Mostrar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Subir imagen a S3
      const uploadResponse = await apiClient.uploadProfileImage(file);
      
      // Actualizar perfil con nueva URL de imagen
      setProfile(prev => ({
        ...prev,
        foto_perfil: uploadResponse.url
      }));

      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading image');
      setPreviewImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      // Build payload removing empty strings / nulls to avoid validation errors (422)
      const payload: Record<string, any> = {};
      const allowed = ['nombre','apellido','email','foto_perfil','genero','fecha_nacimiento','telefono','estado'];
      allowed.forEach((key) => {
        const val = (profile as any)[key];
        if (val !== undefined && val !== null && val !== '') {
          payload[key] = val;
        }
      });

      // Ensure user_id is included (backend expects it)
      payload.user_id = profile.user_id;

      // Normalize genero to API-expected Spanish values: 'masculino' | 'femenino' | 'otro'
      if (payload.genero) {
        const g = String(payload.genero).toLowerCase();
        if (g === 'm' || g === 'masculino' || g === 'male' || g.startsWith('m')) {
          payload.genero = 'masculino';
        } else if (g === 'f' || g === 'femenino' || g === 'female' || g.startsWith('f')) {
          payload.genero = 'femenino';
        } else {
          payload.genero = 'otro';
        }
      }

      if (profile.id) {
        // Actualizar perfil existente
        await apiClient.updateProfile(parseInt(userId!), payload);
        setSuccess('Profile updated successfully!');
      } else {
        // Crear nuevo perfil
        await apiClient.createProfile(payload as any);
        setSuccess('Profile created successfully!');
        await loadProfile();
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Try to show more detailed error info
      console.error('Save profile error detail:', err);
      setError(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await apiClient.deleteProfile(parseInt(userId!));
      setSuccess('Profile deleted successfully');
      setTimeout(() => {
        handleLogout();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    onLogout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  const fullName = profile.nombre && profile.apellido 
    ? `${profile.nombre} ${profile.apellido}`
    : profile.nombre || username || 'User';
  
  const initials = (profile.nombre?.[0] || 'U') + (profile.apellido?.[0] || 'S');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{success}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={previewImage || profile.foto_perfil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <label htmlFor="image-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-[#FF5733] rounded-full flex items-center justify-center text-white hover:bg-[#e64d2d] transition-colors cursor-pointer">
                      <Camera className="w-4 h-4" />
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </div>
                  <h3 className="text-gray-900 mb-1">{fullName}</h3>
                  <p className="text-sm text-gray-600">{profile.email || 'No email'}</p>
                  {uploadingImage && <p className="text-xs text-blue-600 mt-2">Uploading image...</p>}
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">User ID</div>
                    <div className="text-gray-900">{userId}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <div className="text-gray-900">{profile.estado || 'Active'}</div>
                  </div>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full mt-6 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Right Column - Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Information */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-gray-900 mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre" className="mb-2 flex items-center gap-2 text-gray-700">
                        <UserIcon className="w-4 h-4" />
                        First Name
                      </Label>
                      <Input
                        id="nombre"
                        value={profile.nombre || ''}
                        onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                        placeholder="First name"
                        className="h-11 rounded-xl border-gray-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido" className="mb-2 text-gray-700">
                        Last Name
                      </Label>
                      <Input
                        id="apellido"
                        value={profile.apellido || ''}
                        onChange={(e) => setProfile({ ...profile, apellido: e.target.value })}
                        placeholder="Last name"
                        className="h-11 rounded-xl border-gray-200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="mb-2 flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="email@example.com"
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="genero" className="mb-2 text-gray-700">
                        Gender
                      </Label>
                      <select
                        id="genero"
                        value={profile.genero || 'O'}
                        onChange={(e) => setProfile({ ...profile, genero: e.target.value as "M" | "F" | "O" })}
                        className="h-11 w-full px-3 rounded-xl border border-gray-200"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="telefono" className="mb-2 text-gray-700">
                        Phone
                      </Label>
                      <Input
                        id="telefono"
                        value={profile.telefono || ''}
                        onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                        placeholder="+1 234 567 8900"
                        className="h-11 rounded-xl border-gray-200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fecha_nacimiento" className="mb-2 text-gray-700">
                      Birth Date
                    </Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={profile.fecha_nacimiento || ''}
                      onChange={(e) => setProfile({ ...profile, fecha_nacimiento: e.target.value })}
                      className="h-11 rounded-xl border-gray-200"
                    />
                  </div>

                  <Button 
                    onClick={handleSaveProfile}
                    disabled={saving || uploadingImage}
                    className="bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl p-6 border border-red-200">
                <h2 className="text-gray-900 mb-4 text-red-600">Danger Zone</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Once you delete your profile, there is no going back. Please be certain.
                </p>
                <Button 
                  onClick={handleDeleteProfile}
                  disabled={saving}
                  variant="outline"
                  className="rounded-xl text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
