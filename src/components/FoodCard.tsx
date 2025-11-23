interface FoodCardProps {
  image: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  onClick?: () => void;
}

export function FoodCard({ image, name, calories, protein, carbs, onClick }: FoodCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-100"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-gray-900 mb-3">{name}</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-orange-50 rounded-lg p-2 text-center">
            <div className="text-[#FF5733]">{calories}</div>
            <div className="text-xs text-gray-500">kcal</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="text-blue-600">{protein}g</div>
            <div className="text-xs text-gray-500">protein</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2 text-center">
            <div className="text-[#FFC300]">{carbs}g</div>
            <div className="text-xs text-gray-500">carbs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
