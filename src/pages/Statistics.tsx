import { Navbar } from '../components/Navbar';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import apiClient from '../services/api';

export default function Statistics() {
  // Helper: try several keys on an object and return the first finite number
  const pickNumber = (obj: any, ...keys: string[]) => {
    if (!obj) return undefined;
    for (const k of keys) {
      const v = obj[k];
      const n = typeof v === 'string' ? Number(v) : v;
      if (typeof n === 'number' && !Number.isNaN(n)) return n;
    }
    return undefined;
  };

  const formatTwo = (v: number | undefined | null) => (typeof v === 'number' && !Number.isNaN(v) ? Number(v.toFixed(2)) : undefined);

  const [macroData, setMacroData] = useState([
    { name: 'Proteínas', value: 30, color: '#3B82F6' },
    { name: 'Carbohidratos', value: 45, color: '#FFC300' },
    { name: 'Grasas', value: 25, color: '#FF5733' },
  ]);

  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', protein: 85, calories: 1850, score: 82 },
    { day: 'Tue', protein: 92, calories: 2100, score: 88 },
    { day: 'Wed', protein: 78, calories: 1950, score: 75 },
    { day: 'Thu', protein: 95, calories: 2200, score: 90 },
    { day: 'Fri', protein: 88, calories: 2050, score: 85 },
    { day: 'Sat', protein: 70, calories: 1800, score: 72 },
    { day: 'Sun', protein: 82, calories: 1900, score: 80 },
  ]);

  const [trendData, setTrendData] = useState([
    { week: 'Week 1', calories: 1950, weight: 75.5 },
    { week: 'Week 2', calories: 2000, weight: 75.2 },
    { week: 'Week 3', calories: 1900, weight: 74.8 },
    { week: 'Week 4', calories: 1850, weight: 74.5 },
  ]);

  // New: weekly scans data (day, count) and top meals data (name, count)
  const [weeklyScanData, setWeeklyScanData] = useState<Array<any>>([]);
  const [topMealsData, setTopMealsData] = useState<Array<any>>([]);
  const [weeklyCaloriesData, setWeeklyCaloriesData] = useState<Array<any>>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Top cards state
  const [weeklyAvgCalories, setWeeklyAvgCalories] = useState<number | null>(null);
  const [proteinAvg, setProteinAvg] = useState<number | null>(null);
  const [weeklyAvgCarbs, setWeeklyAvgCarbs] = useState<number | null>(null);
  const [nutritionScore, setNutritionScore] = useState<number | null>(null);
  const [mealsTracked, setMealsTracked] = useState<number | null>(null);
  const [rawResults, setRawResults] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);

      try {
        const userIdStr = localStorage.getItem('user_id') || localStorage.getItem('usuario_id');
        const userId = userIdStr ? Number(userIdStr) : null;

        // Fetch all endpoints in parallel where possible
        const promises: Promise<any>[] = [];
        if (userId) {
          promises.push(apiClient.getAverageNutrients(userId)); // 0
          promises.push(apiClient.getMealCount(userId)); // 1
          promises.push(apiClient.getTopMeals(userId)); // 2
          promises.push(apiClient.getNutrientRatio(userId)); // 3
          promises.push(apiClient.getWeeklyCalories(userId)); // 4
        }
        // global stats
        promises.push(apiClient.getGlobalStats()); // last

        const results = await Promise.allSettled(promises);

        // Map results based on presence of userId
        let idx = 0;
        // local flag to avoid overwriting weeklyScanData when we've already built it from meal-count
        let builtScanFromMealCount = false;
        if (userId) {
          const avgRes = results[idx++] as PromiseSettledResult<any>;
          const mealCountRes = results[idx++] as PromiseSettledResult<any>;
          const topMealsRes = results[idx++] as PromiseSettledResult<any>;
          const ratioRes = results[idx++] as PromiseSettledResult<any>;
          const weeklyCalRes = results[idx++] as PromiseSettledResult<any>;

          if (avgRes.status === 'fulfilled' && avgRes.value) {
            const body = avgRes.value;
            const cal = formatTwo(pickNumber(body, 'calories', 'avg_calories', 'calorias', 'average_calories', 'cal'));
            const prot = formatTwo(pickNumber(body, 'proteins', 'protein', 'proteina', 'avg_proteins', 'proteinas'));
            const fats = formatTwo(pickNumber(body, 'fats', 'fat', 'grasas', 'avg_fats', 'average_fats'));
            const carbs = formatTwo(pickNumber(body, 'carbs', 'carbohydrates', 'carbohidratos', 'avg_carbs', 'average_carbs'));
            if (typeof cal === 'number') setWeeklyAvgCalories(cal);
            if (typeof prot === 'number') setProteinAvg(prot);
            if (typeof carbs === 'number') setWeeklyAvgCarbs(carbs);
            if (typeof fats === 'number' || typeof carbs === 'number') {
              setMacroData((prev) => [
                { name: 'Protein', value: prev[0]?.value ?? 0, color: '#3B82F6' },
                { name: 'Carbs', value: typeof carbs === 'number' ? carbs : prev[1]?.value ?? 0, color: '#FFC300' },
                { name: 'Fats', value: typeof fats === 'number' ? fats : prev[2]?.value ?? 0, color: '#FF5733' },
              ]);
            }
          }

          if (mealCountRes.status === 'fulfilled' && mealCountRes.value) {
            const body = mealCountRes.value;
            // If response is an array, count its length, else try numeric fields
            let countVal: number | undefined = undefined;
            if (Array.isArray(body)) countVal = body.length;
            else countVal = pickNumber(body, 'weekly_count', 'count', 'meals_count', 'meals_tracked', 'total');
            if (typeof countVal === 'number') setMealsTracked(countVal);

            // If body is array of daily counts, build a 7-day window ending on the latest date
            if (Array.isArray(body) && body.length > 0) {
              // Build map date(YYYY-MM-DD) -> count
              const dateMap = new Map<string, number>();
              let maxTs = 0;
              for (const d of body) {
                const rawDate = d.day || d.date || d.fecha || '';
                // normalize to YYYY-MM-DD if possible
                let iso = rawDate;
                try {
                  const dt = new Date(rawDate);
                  if (!isNaN(dt.getTime())) iso = dt.toISOString().slice(0, 10);
                } catch (e) {
                  // leave iso as raw
                }
                const val = Math.round(
                  pickNumber(
                    d,
                    'count',
                    'cantidad',
                    'scans',
                    'scan_count',
                    'total',
                    'value',
                    'meals',
                    'meals_count',
                    'visits',
                    'visitas'
                  ) ?? 0
                );
                dateMap.set(iso, (dateMap.get(iso) ?? 0) + val);
                const ts = new Date(iso).getTime();
                if (!isNaN(ts) && ts > maxTs) maxTs = ts;
              }

              // Determine window end: latest date from data or today
              const endDate = maxTs > 0 ? new Date(maxTs) : new Date();
              // Build 7-day array ending on endDate (from oldest to newest)
              const scans: Array<any> = [];
              for (let i = 6; i >= 0; i--) {
                const dt = new Date(endDate);
                dt.setDate(endDate.getDate() - i);
                const iso = dt.toISOString().slice(0, 10);
                const label = dt.toLocaleDateString(undefined, { weekday: 'short' });
                scans.push({ week: label, count: dateMap.get(iso) ?? 0 });
              }
              setWeeklyScanData(scans);
              builtScanFromMealCount = true;
            }
          }

          if (ratioRes.status === 'fulfilled' && ratioRes.value) {
            const body = ratioRes.value;
            if (body) {
              // Prefer the explicit percentage keys if present (already rounded on server)
              const protein = pickNumber(body, 'proteins_pct', 'proteins_percentage', 'protein_percentage', 'protein', 'proteins') ?? 30;
              const fats = pickNumber(body, 'fats_pct', 'fats_percentage', 'fat_percentage', 'fats', 'fat') ?? 25;
              const carbs = pickNumber(body, 'carbs_pct', 'carbs_percentage', 'carbs', 'carbohidratos') ?? 45;
              setMacroData([
                { name: 'Proteínas', value: protein, color: '#3B82F6' },
                { name: 'Carbohidratos', value: carbs, color: '#FFC300' },
                { name: 'Grasas', value: fats, color: '#FF5733' },
              ]);
            }
          }

          if (weeklyCalRes.status === 'fulfilled' && weeklyCalRes.value && Array.isArray(weeklyCalRes.value)) {
            // Expected array of daily calories/protein/score
            const days = weeklyCalRes.value.map((d: any) => {
              // prefer english keys, fallback to spanish
              const dateStr = d.date || d.day || d.fecha || '';
              let dayLabel = dateStr;
              let isoDate = dateStr;
              try {
                const dt = new Date(dateStr);
                const opts: Intl.DateTimeFormatOptions = { weekday: 'short' };
                dayLabel = isNaN(dt.getTime()) ? dateStr : dt.toLocaleDateString(undefined, opts);
                isoDate = isNaN(dt.getTime()) ? dateStr : dt.toISOString().slice(0, 10);
              } catch (e) {
                // leave as-is
              }

              return {
                day: dayLabel,
                iso: isoDate,
                protein: formatTwo(pickNumber(d, 'protein', 'proteins', 'proteina')) ?? 0,
                calories: formatTwo(pickNumber(d, 'calories', 'calorias', 'avg_calories', 'average_calories')) ?? 0,
                score: formatTwo(pickNumber(d, 'score', 'nutrition_score')) ?? 0,
                // count / scans for weekly chart
                count: Math.round(pickNumber(d, 'count', 'cantidad', 'scans', 'scan_count') ?? pickNumber(d, 'visits', 'visitas') ?? 0),
              };
            });
            if (days.length > 0) setWeeklyData(days);

            // Build weeklyCaloriesData from avg_calories (or calories) for the Weekly Scans chart
            const caloriesScans = days.map((d: any) => ({ week: d.day, date: d.iso, count: Math.round(Number(d.calories ?? 0)) }));
            if (caloriesScans.length > 0) setWeeklyCaloriesData(caloriesScans);

            // For trend (weekly scans) keep existing behavior: use meal-count if available
            const scans = days.map((d: any) => ({ week: d.day, date: d.iso, count: d.count }));
            if (scans.length > 0 && !builtScanFromMealCount) setWeeklyScanData(scans);
          }

          // top meals mapping is optional -- we don't change layout for it currently
          if (topMealsRes.status === 'fulfilled' && topMealsRes.value && Array.isArray(topMealsRes.value)) {
            // Map top meals response to name/count
            const mapped = topMealsRes.value.map((m: any) => ({
              name: m.meal_name ?? m.name ?? m.meal ?? m.MealName ?? 'Unknown',
              count: Math.round(pickNumber(m, 'count', 'cantidad', 'scans', 'scan_count') ?? pickNumber(m, 'total', 'count_total') ?? 0),
            }));
            setTopMealsData(mapped);
          }
          // store raw per-endpoint results for debugging / raw view
          try {
            const raw: Record<string, any> = {};
            raw.averageNutrients = avgRes.status === 'fulfilled' ? avgRes.value : { error: String((avgRes as any).reason ?? 'Rejected') };
            raw.mealCount = mealCountRes.status === 'fulfilled' ? mealCountRes.value : { error: String((mealCountRes as any).reason ?? 'Rejected') };
            raw.topMeals = topMealsRes.status === 'fulfilled' ? topMealsRes.value : { error: String((topMealsRes as any).reason ?? 'Rejected') };
            raw.nutrientRatio = ratioRes.status === 'fulfilled' ? ratioRes.value : { error: String((ratioRes as any).reason ?? 'Rejected') };
            raw.weeklyCalories = weeklyCalRes.status === 'fulfilled' ? weeklyCalRes.value : { error: String((weeklyCalRes as any).reason ?? 'Rejected') };
            setRawResults(raw);
          } catch (e) {
            // ignore
          }
        }

        // global stats (last promise)
        const globalRes = results[results.length - 1];
        if (globalRes && globalRes.status === 'fulfilled' && globalRes.value) {
          const g = globalRes.value;
          const ns = pickNumber(g, 'avg_nutrition_score', 'nutrition_score', 'score');
          if (typeof ns === 'number') setNutritionScore(ns);
          const gac = pickNumber(g, 'avg_calories', 'average_calories', 'calories');
          if (typeof gac === 'number' && !userId) setWeeklyAvgCalories(gac);
          // include global stats into rawResults as well
          setRawResults((prev) => ({ ...(prev || {}), globalStats: globalRes.status === 'fulfilled' ? globalRes.value : { error: String((globalRes as any).reason ?? 'Rejected') } }));
        }
      } catch (err: any) {
        console.error('Error fetching statistics', err);
        setError(err?.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Statistics & Analytics</h1>
          <p className="text-gray-600">Track your nutrition progress and trends</p>
        </div>

        {/* Top Stats Cards (single-row flex, equal widths) */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 flex-1 min-w-[240px]">
            <div className="text-sm text-gray-600 mb-2">Average Calories</div>
            <div className="text-gray-900">{loading ? 'Loading...' : (typeof weeklyAvgCalories === 'number' ? `${weeklyAvgCalories.toFixed(2)} kcal` : '—')}</div>
            <div className="text-sm text-green-600 mt-1">↑ 5% from last week</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 flex-1 min-w-[240px]">
            <div className="text-sm text-gray-600 mb-2">Average Proteins</div>
            <div className="text-gray-900">{loading ? 'Loading...' : (typeof proteinAvg === 'number' ? `${proteinAvg.toFixed(2)} g / day` : '—')}</div>
            <div className="text-sm text-green-600 mt-1">↑ 8% from last week</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 flex-1 min-w-[240px]">
            <div className="text-sm text-gray-600 mb-2">Average Carbs</div>
            <div className="text-gray-900">{loading ? 'Loading...' : (typeof weeklyAvgCarbs === 'number' ? `${weeklyAvgCarbs.toFixed(2)} g / day` : '—')}</div>
            <div className="text-sm text-green-600 mt-1">Daily average carbs</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 flex-1 min-w-[240px]">
            <div className="text-sm text-gray-600 mb-2">Average Fats</div>
            <div className="text-gray-900">{loading ? 'Loading...' : (macroData[2] && typeof macroData[2].value === 'number' ? `${Number(macroData[2].value).toFixed(2)} g` : (nutritionScore ? `${nutritionScore}` : '—'))}</div>
            <div className="text-sm text-gray-500 mt-1">Average daily fats</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 flex-1 min-w-[240px]">
            <div className="text-sm text-gray-600 mb-2">MealTricate</div>
            <div className="text-gray-900">{loading ? 'Loading...' : `${mealsTracked ?? '—'}`}</div>
            <div className="text-sm text-gray-500 mt-1">Count of tracked meals</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Macronutrients Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-gray-900 mb-6">NutrientRatio</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                    data={macroData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {macroData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Comparison */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-gray-900 mb-6">Weekly Scans</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyCaloriesData.length ? weeklyCaloriesData : (weeklyScanData.length ? weeklyScanData : weeklyData)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name="Scans" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
          </div>
        </div>

        {/* Weekly Trend (line) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-gray-900 mb-6">Weekly Trend</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={weeklyScanData.length ? weeklyScanData : trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FF5733"
                strokeWidth={3}
                name="Scans"
                dot={{ fill: '#FF5733', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Meals Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mt-6">
          <h2 className="text-gray-900 mb-6">Top Meals</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={topMealsData} margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#999" />
              <YAxis type="category" dataKey="name" stroke="#999" width={150} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" name="Scans" radius={[8, 8, 8, 8]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
      </main>
    </div>
  );
}
