'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, ArrowLeft, Package, Clock, BarChart } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function BundleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [bundle, setBundle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    api.get(`/bundles/${params.id}`)
      .then((res) => {
        setBundle(res.data);
      })
      .catch(() => {
        toast.error('Failed to load bundle details');
        router.push('/courses');
      })
      .finally(() => setIsLoading(false));
  }, [params.id, router]);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await api.post(`/bundles/${params.id}/purchase`);
      toast.success(`Successfully purchased ${bundle.title}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to purchase bundle');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalCourses = bundle.courses.length;
  const savings = bundle.discountPrice 
    ? Math.round(((bundle.price - bundle.discountPrice) / bundle.price) * 100)
    : 0;

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto p-8 space-y-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Bundle</Badge>
                {savings > 0 && <Badge className="bg-red-500 text-white">Save {savings}%</Badge>}
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white">{bundle.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                {bundle.description}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Included Courses</h2>
              <div className="grid grid-cols-1 gap-4">
                {bundle.courses.map((course: any) => (
                  <Card key={course.id} className="p-4 flex items-center justify-between hover:border-blue-300 transition-colors cursor-pointer" onClick={() => router.push(`/courses/${course.id}`)}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{course.title}</h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center"><BarChart className="w-3 h-3 mr-1" /> {course.level}</span>
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {course.durationHours}h</span>
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-8 border-blue-200 dark:border-blue-900/50 shadow-xl">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Bundle Price</p>
                  {bundle.discountPrice ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">{bundle.discountPrice}</span>
                        <span className="text-lg font-bold text-gray-500">BST</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-400 line-through">{bundle.price} BST</span>
                        <span className="text-green-600 font-bold">You save {bundle.price - bundle.discountPrice} BST</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl font-black text-gray-900 dark:text-white">{bundle.price}</span>
                      <span className="text-lg font-bold text-gray-500">BST</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Button 
                    className="w-full h-12 text-lg font-bold" 
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? 'Processing...' : 'Buy Bundle Now'}
                  </Button>
                  <p className="text-center text-xs text-gray-500">
                    One-time payment. Lifetime access to all {totalCourses} courses.
                  </p>
                </div>

                <div className="pt-6 border-t dark:border-gray-800 space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Official bundle completion certificate</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">All course materials included</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
