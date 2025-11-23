import { Navbar } from '../components/Navbar';
import { Lightbulb, Heart, Zap, Shield, Apple, Beef, Droplet } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function Nutrition() {
  const tips = [
    {
      icon: Lightbulb,
      title: 'Balanced Diet',
      description: 'Include a variety of foods from all food groups to ensure you get essential nutrients.',
      color: '#FFC300',
    },
    {
      icon: Heart,
      title: 'Heart Health',
      description: 'Choose whole grains, lean proteins, and healthy fats to support cardiovascular health.',
      color: '#FF5733',
    },
    {
      icon: Zap,
      title: 'Energy Boost',
      description: 'Complex carbohydrates provide sustained energy throughout the day.',
      color: '#3B82F6',
    },
    {
      icon: Shield,
      title: 'Strong Immunity',
      description: 'Vitamins and minerals from fruits and vegetables boost your immune system.',
      color: '#10B981',
    },
  ];

  const macronutrients = [
    {
      icon: Beef,
      name: 'Proteins',
      color: '#3B82F6',
      description: 'Essential for building and repairing tissues, enzymes, and hormones.',
      sources: ['Chicken', 'Fish', 'Eggs', 'Legumes', 'Tofu'],
      recommended: '0.8g per kg of body weight',
    },
    {
      icon: Apple,
      name: 'Carbohydrates',
      color: '#FFC300',
      description: 'Primary source of energy for your body and brain.',
      sources: ['Whole grains', 'Fruits', 'Vegetables', 'Legumes'],
      recommended: '45-65% of daily calories',
    },
    {
      icon: Droplet,
      name: 'Fats',
      color: '#FF5733',
      description: 'Important for hormone production, nutrient absorption, and cell health.',
      sources: ['Avocado', 'Nuts', 'Olive oil', 'Fatty fish'],
      recommended: '20-35% of daily calories',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-gray-900 mb-4">Nutrition Knowledge Center</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn about nutrition fundamentals and make informed choices for a healthier lifestyle
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-12 rounded-3xl overflow-hidden shadow-xl max-w-4xl mx-auto">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1606858274001-dd10efc5ce7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwbnV0cml0aW9uJTIwbWVhbHxlbnwxfHx8fDE3NjM4NjUyNjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Nutrition"
            className="w-full aspect-[21/9] object-cover"
          />
        </div>

        {/* Tips Section */}
        <div className="mb-12">
          <h2 className="text-gray-900 mb-6 text-center">Healthy Eating Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${tip.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: tip.color }} />
                  </div>
                  <h3 className="text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Macronutrients Deep Dive */}
        <div className="mb-12">
          <h2 className="text-gray-900 mb-2 text-center">Understanding Macronutrients</h2>
          <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            The three main macronutrients your body needs in large amounts
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {macronutrients.map((macro) => {
              const Icon = macro.icon;
              return (
                <div
                  key={macro.name}
                  className="bg-white rounded-2xl p-6 border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${macro.color}20` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: macro.color }} />
                    </div>
                    <h3 className="text-gray-900">{macro.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{macro.description}</p>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-700 mb-2">Good Sources:</div>
                    <div className="flex flex-wrap gap-2">
                      {macro.sources.map((source) => (
                        <span
                          key={source}
                          className="px-3 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: `${macro.color}20`,
                            color: macro.color,
                          }}
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${macro.color}10` }}
                  >
                    <div className="text-xs text-gray-600 mb-1">Daily Recommended</div>
                    <div className="text-sm text-gray-900">{macro.recommended}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Healthy Habits */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-gray-900 mb-6 text-center">Healthy Eating Habits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <span className="text-xl">✓</span>
              </div>
              <h3 className="text-gray-900 mb-2">Eat Regular Meals</h3>
              <p className="text-sm text-gray-600">
                Maintain consistent meal times to regulate metabolism and energy levels throughout the day.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <span className="text-xl">💧</span>
              </div>
              <h3 className="text-gray-900 mb-2">Stay Hydrated</h3>
              <p className="text-sm text-gray-600">
                Drink at least 8 glasses of water daily to support digestion and overall health.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                <span className="text-xl">🥗</span>
              </div>
              <h3 className="text-gray-900 mb-2">Portion Control</h3>
              <p className="text-sm text-gray-600">
                Be mindful of serving sizes to maintain a healthy weight and avoid overeating.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <span className="text-xl">🌈</span>
              </div>
              <h3 className="text-gray-900 mb-2">Eat the Rainbow</h3>
              <p className="text-sm text-gray-600">
                Include a variety of colorful fruits and vegetables for diverse nutrients and antioxidants.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
