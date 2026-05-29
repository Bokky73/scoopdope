import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Package, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';

interface Course {
  id: string;
  title: string;
}

interface Bundle {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  courses: Course[];
  thumbnailUrl?: string;
}

interface BundleCardProps {
  bundle: Bundle;
  onViewDetails: (bundle: Bundle) => void;
  onPurchase: (bundle: Bundle) => void;
  isPurchased?: boolean;
}

export const BundleCard: React.FC<BundleCardProps> = ({
  bundle,
  onViewDetails,
  onPurchase,
  isPurchased = false,
}) => {
  const savings = bundle.discountPrice 
    ? Math.round(((bundle.price - bundle.discountPrice) / bundle.price) * 100)
    : 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden border-blue-100 dark:border-blue-900/30 hover:shadow-xl transition-all group">
      <div className="relative h-48 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        {bundle.thumbnailUrl ? (
          <img src={bundle.thumbnailUrl} alt={bundle.title} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-16 h-16 text-blue-200 dark:text-blue-800" />
        )}
        {savings > 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            SAVE {savings}%
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            {bundle.courses.length} Courses
          </Badge>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
          {bundle.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {bundle.description}
        </p>

        <div className="space-y-2 mb-6 flex-1">
          {bundle.courses.slice(0, 3).map((course) => (
            <div key={course.id} className="flex items-center text-xs text-gray-500 dark:text-gray-500">
              <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
              <span className="truncate">{course.title}</span>
            </div>
          ))}
          {bundle.courses.length > 3 && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium pl-5">
              + {bundle.courses.length - 3} more courses
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t dark:border-gray-800">
          <div>
            {bundle.discountPrice ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 line-through">{bundle.price} BST</span>
                <span className="text-2xl font-black text-green-600 dark:text-green-400">
                  {bundle.discountPrice} <span className="text-sm font-bold">BST</span>
                </span>
              </div>
            ) : (
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {bundle.price} <span className="text-sm font-bold">BST</span>
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onViewDetails(bundle)}>
              Details
            </Button>
            {isPurchased ? (
              <Button size="sm" disabled className="bg-green-100 text-green-700 border-green-200">
                Enrolled
              </Button>
            ) : (
              <Button size="sm" onClick={() => onPurchase(bundle)}>
                Buy Bundle
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
