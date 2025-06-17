
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingSkeletonProps {
  role?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ role = 'default' }) => {
  const getSkeletonLayout = () => {
    switch (role) {
      case 'partner':
        return (
          <div className="space-y-6">
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Chart and Actions Skeleton */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
              
              <Card className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Table Skeleton */}
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'staff':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tasks and Actions */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="h-12 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Default 4-card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main content area */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
              
              <Card className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return getSkeletonLayout();
};

export default LoadingSkeleton;
