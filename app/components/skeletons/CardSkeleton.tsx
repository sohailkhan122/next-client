import { Card, Skeleton } from 'antd';

interface CardSkeletonProps {
  count?: number;
  showHeader?: boolean;
  showActions?: boolean;
  className?: string;
}

export default function CardSkeleton({
  count = 1,
  showHeader = true,
  showActions = true,
  className = '',
}: CardSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:gap-5 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="rounded-2xl border border-slate-200"
          classNames={{ body: 'p-5 sm:p-6' }}
        >
          <div className="space-y-4">
            {showHeader && (
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton.Avatar active size={46} shape="circle" />
                  <div className="min-w-0">
                    <Skeleton.Input active size="small" className="!h-4 !w-44 !max-w-full" />
                    <div className="mt-2">
                      <Skeleton.Input active size="small" className="!h-3.5 !w-28" />
                    </div>
                  </div>
                </div>
                <Skeleton.Button active size="small" className="!h-7 !w-20" />
              </div>
            )}

            <Skeleton active paragraph={{ rows: 3, width: ['100%', '88%', '72%'] }} title={false} />

            {showActions && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <Skeleton.Input active size="small" className="!h-4 !w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton.Button active size="small" className="!h-8 !w-20" />
                  <Skeleton.Button active size="small" className="!h-8 !w-24" />
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
