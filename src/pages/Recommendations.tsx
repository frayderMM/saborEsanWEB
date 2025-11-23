import { Navbar } from '../components/Navbar';
import { FoodCard } from '../components/FoodCard';
import { Button } from '../components/ui/button';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Recommendations() {
  const [currentWeek, setCurrentWeek] = useState(0);

  const weeklyRecommendations = [
    {
      day: 'Monday',
      date: 'Nov 25',
      meals: [
        {
          id: 1,
          name: 'Avocado Toast with Eggs',
          type: 'Breakfast',
          image: 'https://images.unsplash.com/photo-1708725741805-390cb4f3319f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBhdm9jYWRvJTIwdG9hc3R8ZW58MXx8fHwxNzYzNzk5NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          calories: 320,
          protein: 12,
          carbs: 35,
        },
        {
          id: 2,
          name: 'Grilled Chicken Salad',
          type: 'Lunch',
          image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHklMjBlYXRpbmd8ZW58MXx8fHwxNzYzODY1MjcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          calories: 350,
          protein: 35,
          carbs: 25,
        },
        {
          id: 3,
          name: 'Grilled Chicken with Rice',
          type: 'Dinner',
          image: 'https://images.unsplash.com/photo-1682423187670-4817da9a1b23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMG1lYWx8ZW58MXx8fHwxNzYzODMzNTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          calories: 520,
          protein: 42,
          carbs: 48,
        },
      ],
    },
    {
      day: 'Tuesday',
      date: 'Nov 26',
      meals: [
        {
          id: 4,
          name: 'Healthy Bowl',
          type: 'Breakfast',
          image: 'https://images.unsplash.com/photo-1642339800099-921df1a0a958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMGJvd2x8ZW58MXx8fHwxNzYzODE0MTc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          calories: 380,
          protein: 15,
          carbs: 45,
        },
        {
          id: 5,
          name: 'Sushi Platter',
          type: 'Lunch',
          image: 'https://images.unsplash.com/photo-1625937751876-4515cd8e78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzYzNzY5OTY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          calories: 420,
          protein: 24,
          carbs: 58,
        },
        {
          id: 6,
          name: 'Pasta Primavera',
          type: 'Dinner',
          image: 'https://images.unsplash.com/photo-1676300184847-4ee4030409c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2glMjBmb29kfGVufDF8fHx8MTc2Mzg0MDAxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          calories: 480,
          protein: 18,
          carbs: 62,
        },
      ],
    },
    {
      day: 'Wednesday',
      date: 'Nov 27',
      meals: [
        {
          id: 7,
          name: 'Avocado Toast',
          type: 'Breakfast',
          image: 'https://images.unsplash.com/photo-1708725741805-390cb4f3319f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBhdm9jYWRvJTIwdG9hc3R8ZW58MXx8fHwxNzYzNzk5NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          calories: 320,
          protein: 12,
          carbs: 35,
        },
        {
          id: 8,
          name: 'Buddha Bowl',
          type: 'Lunch',
          image: 'https://images.unsplash.com/photo-1642339800099-921df1a0a958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMGJvd2x8ZW58MXx8fHwxNzYzODE0MTc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          calories: 410,
          protein: 22,
          carbs: 52,
        },
        {
          id: 9,
          name: 'Grilled Chicken',
          type: 'Dinner',
          image: 'https://images.unsplash.com/photo-1682423187670-4817da9a1b23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMG1lYWx8ZW58MXx8fHwxNzYzODMzNTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          calories: 490,
          protein: 40,
          carbs: 42,
        },
      ],
    },
  ];

  const handleRegenerate = () => {
    alert('Generating new recommendations based on your preferences and goals...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">Weekly Meal Recommendations</h1>
            <p className="text-gray-600">Personalized meal suggestions based on your nutrition goals</p>
          </div>
          <Button
            onClick={handleRegenerate}
            className="bg-[#FF5733] hover:bg-[#e64d2d] text-white rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate Recommendations
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Daily Average</div>
            <div className="text-gray-900">1,920 kcal</div>
            <div className="text-xs text-green-600 mt-1">Within your goal</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Protein Target</div>
            <div className="text-gray-900">95g / day</div>
            <div className="text-xs text-blue-600 mt-1">Optimized</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Variety Score</div>
            <div className="text-gray-900">8.5 / 10</div>
            <div className="text-xs text-[#FFC300] mt-1">Excellent diversity</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Meal Prep Time</div>
            <div className="text-gray-900">~35 min</div>
            <div className="text-xs text-gray-500 mt-1">Avg per meal</div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
              className="rounded-lg"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous Week
            </Button>
            <div className="text-gray-900">
              Week of November 25 - December 1, 2024
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="rounded-lg"
            >
              Next Week
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Daily Recommendations */}
        <div className="space-y-8">
          {weeklyRecommendations.map((day) => (
            <div key={day.day} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-gray-900">{day.day}</h2>
                  <p className="text-sm text-gray-500">{day.date}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Calories</div>
                  <div className="text-gray-900">
                    {day.meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {day.meals.map((meal) => (
                  <div key={meal.id}>
                    <div className="mb-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs inline-block">
                      {meal.type}
                    </div>
                    <FoodCard
                      image={meal.image}
                      name={meal.name}
                      calories={meal.calories}
                      protein={meal.protein}
                      carbs={meal.carbs}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
          <h3 className="text-gray-900 mb-2">💡 How Recommendations Work</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Our AI analyzes your nutrition goals, dietary preferences, and past meal history to create 
            personalized weekly meal plans. Each recommendation is optimized for nutritional balance, 
            variety, and your specific calorie and macronutrient targets. You can regenerate 
            recommendations at any time to explore different meal options.
          </p>
        </div>
      </main>
    </div>
  );
}
