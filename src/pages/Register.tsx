import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { apiClient } from '../services/api';

interface RegisterProps {
  onRegister: () => void;
}

export default function Register({ onRegister }: RegisterProps) {
  const navigate = useNavigate();
  
  // Estado del formulario - Paso 1
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estado del formulario - Paso 2
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'femenino' | 'otro'>('masculino');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  
  // Estado del flujo
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validaciones
  const validateStep1 = (): string | null => {
    if (!username) return 'El nombre de usuario es obligatorio';
    if (username.length < 4) return 'El nombre de usuario debe tener al menos 4 caracteres';
    if (!password) return 'La contraseña es obligatoria';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!nombre.trim()) return 'El nombre es obligatorio';
    if (!apellido.trim()) return 'El apellido es obligatorio';
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El email es obligatorio';
    if (!emailRegex.test(email)) return 'El email no es válido';
    
    // Validar género
    if (!['masculino', 'femenino', 'otro'].includes(genero)) {
      return 'El género debe ser masculino, femenino u otro';
    }
    
    // Validar fecha de nacimiento (formato YYYY-MM-DD)
    if (!fechaNacimiento) return 'La fecha de nacimiento es obligatoria';
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fechaNacimiento)) {
      return 'La fecha debe estar en formato YYYY-MM-DD';
    }
    
    // Validar teléfono (solo dígitos, mínimo 6)
    if (!telefono) return 'El teléfono es obligatorio';
    const phoneRegex = /^\d{6,}$/;
    if (!phoneRegex.test(telefono)) {
      return 'El teléfono debe contener solo dígitos y tener al menos 6 caracteres';
    }
    
    return null;
  };

  // Paso 1: Solo validar y avanzar (no crear nada aún)
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Solo avanzar al siguiente paso
    setCurrentStep(2);
  };

  // Paso 2: Crear usuario Y perfil en secuencia
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateStep2();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      // 1️⃣ Primero crear el usuario base
      const registerResponse = await apiClient.register(username, password);
      
      // Verificar que tenemos el user_id
      if (!registerResponse || typeof registerResponse !== 'object' || !('user_id' in registerResponse)) {
        throw new Error('Error: No se recibió el ID de usuario del servidor');
      }
      
      const newUserId = (registerResponse as any).user_id;
      
      // 2️⃣ Luego crear el perfil del usuario
      await apiClient.createProfile({
        user_id: newUserId,
        nombre,
        apellido,
        email,
        foto_perfil: null,
        genero,
        fecha_nacimiento: fechaNacimiento,
        telefono,
        estado: 'activo',
      });
      
      // ✅ Registro completo exitoso - solo redirigir a login
      navigate('/login', { state: { registrationSuccess: true } });
    } catch (err: any) {
      setError(err.message || 'Error al completar el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = currentStep === 1 ? handleStep1Submit : handleStep2Submit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
            {/* Left side - Illustration */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF5733] to-[#FFC300] flex items-center justify-center text-3xl">
                    🍽️
                  </div>
                  <span className="text-gray-900">NutriScan</span>
                </div>
                <p className="text-gray-600 max-w-md">
                  Start your journey to healthier eating habits today
                </p>
              </div>
              <div className="w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1757332334664-83bff99e7a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjM3ODQ5NDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Fresh vegetables"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right side - Register Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-8">
                    <h1 className="text-gray-900 mb-2">
                      {currentStep === 1 ? 'Crear Cuenta' : 'Completa tu Perfil'}
                    </h1>
                    <p className="text-gray-600">
                      {currentStep === 1 
                        ? 'Paso 1 de 2: Credenciales de acceso'
                        : 'Paso 2 de 2: Información personal'
                      }
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {currentStep === 1 ? (
                      <>
                        <div>
                          <Label htmlFor="username" className="text-gray-700 mb-2 block">
                            Nombre de Usuario *
                          </Label>
                          <Input
                            id="username"
                            type="text"
                            placeholder="usuario123"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="h-12 rounded-xl border-gray-200"
                            disabled={loading}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Mínimo 4 caracteres</p>
                        </div>

                        <div>
                          <Label htmlFor="password" className="text-gray-700 mb-2 block">
                            Contraseña *
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 rounded-xl border-gray-200"
                            disabled={loading}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword" className="text-gray-700 mb-2 block">
                            Confirmar Contraseña *
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-12 rounded-xl border-gray-200"
                            disabled={loading}
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nombre" className="text-gray-700 mb-2 block">
                              Nombre *
                            </Label>
                            <Input
                              id="nombre"
                              type="text"
                              placeholder="Juan"
                              value={nombre}
                              onChange={(e) => setNombre(e.target.value)}
                              className="h-12 rounded-xl border-gray-200"
                              disabled={loading}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="apellido" className="text-gray-700 mb-2 block">
                              Apellido *
                            </Label>
                            <Input
                              id="apellido"
                              type="text"
                              placeholder="Pérez"
                              value={apellido}
                              onChange={(e) => setApellido(e.target.value)}
                              className="h-12 rounded-xl border-gray-200"
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-gray-700 mb-2 block">
                            Correo Electrónico *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 rounded-xl border-gray-200"
                            disabled={loading}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="telefono" className="text-gray-700 mb-2 block">
                            Teléfono *
                          </Label>
                          <Input
                            id="telefono"
                            type="tel"
                            placeholder="987654321"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="h-12 rounded-xl border-gray-200"
                            disabled={loading}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Solo dígitos, mínimo 6</p>
                        </div>

                        <div>
                          <Label htmlFor="genero" className="text-gray-700 mb-2 block">
                            Género *
                          </Label>
                          <select
                            id="genero"
                            value={genero}
                            onChange={(e) => setGenero(e.target.value as 'masculino' | 'femenino' | 'otro')}
                            className="h-12 w-full rounded-xl border border-gray-200 px-3 bg-white disabled:opacity-50"
                            disabled={loading}
                            required
                          >
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="fechaNacimiento" className="text-gray-700 mb-2 block">
                            Fecha de Nacimiento *
                          </Label>
                          <Input
                            id="fechaNacimiento"
                            type="date"
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                            className="h-12 rounded-xl border-gray-200"
                            disabled={loading}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Formato: YYYY-MM-DD</p>
                        </div>
                      </>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        currentStep === 1 ? 'Continuar' : 'Completar Registro'
                      )}
                    </Button>

                    {currentStep === 2 && (
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="w-full h-12 rounded-xl"
                        disabled={loading}
                      >
                        Volver
                      </Button>
                    )}
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <Link to="/login" className="text-[#FF5733] hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
