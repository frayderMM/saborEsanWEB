import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface RegisterProps {
  onRegister: () => void;
}

export default function Register({ onRegister }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onRegister();
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
                    <h1 className="text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join NutriScan and start tracking your nutrition</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 rounded-xl border-gray-200"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-700 mb-2 block">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 rounded-xl border-gray-200"
                        required
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
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword" className="text-gray-700 mb-2 block">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 rounded-xl border-gray-200"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl"
                    >
                      Create Account
                    </Button>
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
