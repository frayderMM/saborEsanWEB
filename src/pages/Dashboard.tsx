import { Navbar } from '../components/Navbar';
import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { FoodCard } from '../components/FoodCard';
import { StatCard } from '../components/StatCard';
import { Flame, Activity, Apple, Upload, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const recentDishes = [
    {
      id: 1,
      name: 'Grilled Chicken Salad',
      image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHklMjBlYXRpbmd8ZW58MXx8fHwxNzYzODY1MjcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      calories: 350,
      protein: 35,
      carbs: 25,
    },
    {
      id: 2,
      name: 'Pasta Primavera',
      image: 'https://images.unsplash.com/photo-1676300184847-4ee4030409c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2glMjBmb29kfGVufDF8fHx8MTc2Mzg0MDAxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      calories: 480,
      protein: 18,
      carbs: 62,
    },
    {
      id: 3,
      name: 'Sushi Platter',
      image: 'https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzYzNzY5OTY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      calories: 420,
      protein: 24,
      carbs: 58,
    },
  ];

  const [latestMeal, setLatestMeal] = useState<any | null>(null);
  const [latestLoading, setLatestLoading] = useState(false);
  const [latestError, setLatestError] = useState<string | null>(null);

  const fetchLatest = async () => {
    setLatestError(null);
    setLatestLoading(true);
    try {
      // Prefer the auth user id stored at login ('user_id'), fallback to profile 'usuario_id'
      const usuarioId = Number(localStorage.getItem('user_id')) || Number(localStorage.getItem('usuario_id')) || null;
      if (!usuarioId) {
        setLatestMeal(null);
        setLatestError('No profile found. Create your profile to save meals.');
        return;
      }

      const data = await apiClient.getLatestMeal(usuarioId);
      setLatestMeal(data);
    } catch (err: any) {
      console.error('Error fetching latest meal', err);
      setLatestError(err?.message || 'Error fetching latest meal');
    } finally {
      setLatestLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Welcome back, Sarah! 👋</h1>
          <p className="text-gray-600">Here's your nutrition summary for today</p>
        </div>

        {/* Today's Summary */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-4">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Calories"
              value="1,250 kcal"
              subtitle="of 2,000 kcal daily goal"
              icon={Flame}
              color="#FF5733"
            />
            <StatCard
              title="Protein"
              value="77g"
              subtitle="of 100g daily goal"
              icon={Activity}
              color="#3B82F6"
            />
            <StatCard
              title="Carbs"
              value="145g"
              subtitle="of 200g daily goal"
              icon={Apple}
              color="#FFC300"
            />
          </div>
        </div>

        {/* Last Saved Meal */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-4">Last Saved Meal</h2>
          {latestLoading && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">Loading latest meal...</div>
          )}

          {!latestLoading && latestError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">{latestError}</div>
          )}

          {!latestLoading && !latestError && latestMeal && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FoodCard
                image={latestMeal.image_url || latestMeal.image || '/placeholder-food.jpg'}
                name={latestMeal.meal_name || latestMeal.plato || 'Unknown Meal'}
                calories={Number(latestMeal.calories ?? latestMeal.calorias ?? 0)}
                protein={Number(latestMeal.proteins ?? latestMeal.proteina ?? 0)}
                carbs={Number(latestMeal.carbs ?? latestMeal.carbohidratos ?? 0)}
              />
            </div>
          )}

          {!latestLoading && !latestError && !latestMeal && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">No saved meals yet.</div>
          )}
        </div>

        {/* Latest Recognized Dishes */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-4">Latest Recognized Dishes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentDishes.map((dish) => (
              <FoodCard
                key={dish.id}
                image={dish.image}
                name={dish.name}
                calories={dish.calories}
                protein={dish.protein}
                carbs={dish.carbs}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/upload" className="block">
            <div className="bg-gradient-to-br from-[#FF5733] to-[#e64d2d] rounded-2xl p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
              <Upload className="w-10 h-10 mb-4" />
              <h3 className="mb-2">Upload & Analyze</h3>
              <p className="text-white/80 text-sm">
                Upload a food image to get instant nutrition analysis
              </p>
            </div>
          </Link>

          <Link to="/statistics" className="block">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-2">View Statistics</h3>
              <p className="text-gray-600 text-sm">
                Track your nutrition trends and progress over time
              </p>
            </div>
          </Link>

          <Link to="/recommendations" className="block">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-[#FFC300]" />
              </div>
              <h3 className="text-gray-900 mb-2">Meal Recommendations</h3>
              <p className="text-gray-600 text-sm">
                Get personalized meal suggestions for the week
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
