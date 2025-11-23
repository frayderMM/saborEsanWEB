import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Calendar, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { apiClient } from '../services/api';

interface MealItem {
  id: number;
  meal_name?: string;
  plato?: string;
  image_url?: string;
  image?: string;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
  created_at?: string;
  confidence?: number;
}

export default function History() {
  const [selectedItem, setSelectedItem] = useState<MealItem | null>(null);
  const [historyItems, setHistoryItems] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setError(null);
    setLoading(true);
    try {
      const usuarioId = Number(localStorage.getItem('usuario_id')) || null;
      if (!usuarioId) {
        setHistoryItems([]);
        setError('No profile found. Please create your profile to see history.');
        return;
      }

      const data = await apiClient.getMealHistory(usuarioId);
      // Expecting an array from the backend; if object with results, adapt
      if (Array.isArray(data)) {
        setHistoryItems(data as MealItem[]);
      } else if (data && Array.isArray((data as any).results)) {
        setHistoryItems((data as any).results as MealItem[]);
      } else {
        // Try to handle object keyed by id
        const arr = Object.values(data || {}) as any[];
        setHistoryItems(arr as MealItem[]);
      }
    } catch (err: any) {
      console.error('Error fetching history', err);
      setError(err?.message || 'Error fetching history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Scan History</h1>
          <p className="text-gray-600">View all your previously analyzed meals</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div />
            <div className="flex gap-2">
              <Button onClick={fetchHistory} variant="ghost" className="rounded-xl">Refresh</Button>
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">Loading history...</div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">{error}</div>
          )}

          {!loading && !error && historyItems.length === 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">No history items yet.</div>
          )}

          {!loading && !error && historyItems.map((item) => {
            const name = item.meal_name || item.plato || 'Unknown Meal';
            const img = item.image_url || item.image || '';
            const date = item.created_at || '';
            const calories = item.calories ?? item.calorias ?? null;
            const proteins = item.proteins ?? item.proteina ?? null;
            const carbs = item.carbs ?? item.carbohidratos ?? null;
            const fats = item.fats ?? item.grasas ?? null;
            const confidence = item.confidence ?? null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={img || '/placeholder-food.jpg'}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3">
                      <div>
                        <h3 className="text-gray-900 mb-1">{name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {date}
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedItem(item)}
                        variant="outline"
                        className="rounded-xl mt-2 sm:mt-0"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-orange-50 rounded-lg p-2 text-center">
                        <div className="text-[#FF5733]">{calories ?? '-'}</div>
                        <div className="text-xs text-gray-500">kcal</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="text-blue-600">{proteins ?? '-'}g</div>
                        <div className="text-xs text-gray-500">protein</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-2 text-center">
                        <div className="text-[#FFC300]">{carbs ?? '-'}g</div>
                        <div className="text-xs text-gray-500">carbs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meal Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (() => {
            const name = selectedItem.meal_name || selectedItem.plato || 'Unknown Meal';
            const img = selectedItem.image_url || selectedItem.image || '/placeholder-food.jpg';
            const date = selectedItem.created_at || '';
            const calories = selectedItem.calories ?? (selectedItem as any).calorias ?? '-';
            const proteins = selectedItem.proteins ?? (selectedItem as any).proteina ?? '-';
            const carbs = selectedItem.carbs ?? (selectedItem as any).carbohidratos ?? '-';
            const fats = selectedItem.fats ?? (selectedItem as any).grasas ?? '-';
            const confidence = selectedItem.confidence ?? '-';

            return (
              <div className="space-y-6">
                <div className="aspect-video rounded-xl overflow-hidden">
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-gray-900 mb-2">{name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    {date}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">AI Confidence</span>
                      <span className="text-sm text-gray-900">{confidence}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${typeof confidence === 'number' ? confidence : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Calories</div>
                      <div className="text-[#FF5733]">{calories} kcal</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Protein</div>
                      <div className="text-blue-600">{proteins}g</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Carbohydrates</div>
                      <div className="text-[#FFC300]">{carbs}g</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Fat</div>
                      <div className="text-green-600">{fats}g</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
