import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { apiClient, setAuthToken } from '../services/api';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username || !password) {
        setError('Username and password are required');
        setLoading(false);
        return;
      }

      const response = await apiClient.login(username, password);
      
      // Store the token
      setAuthToken(response.access_token);
      
      // Store user info if needed
      localStorage.setItem('user_id', response.user_id);
      localStorage.setItem('username', response.username);
      
      // Call the onLogin callback
      onLogin();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

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
                      <img
                        src="src/images/logo.png"
                        alt="SaborEsan Logo"
                        className="w-12 h-12 rounded-full object-cover shadow-xl border-2 border-white ring-2 ring-orange-200 transform transition-transform duration-200 hover:scale-105"
                      />
                  </div>
                  <span className="text-gray-900">SaborEsan</span>
                </div>
                <p className="text-gray-600 max-w-md">
                  AI-powered food recognition and nutrition analysis platform
                </p>
              </div>
              <div className="w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1642339800099-921df1a0a958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMGJvd2x8ZW58MXx8fHwxNzYzODE0MTc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Healthy food"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-8">
                    <h1 className="text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to continue to NutriScan</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="username" className="text-gray-700 mb-2 block">
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-12 rounded-xl border-gray-200"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-gray-700 mb-2 block">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl border-gray-200"
                        required
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-[#FF5733] hover:underline">
                        Create account
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
