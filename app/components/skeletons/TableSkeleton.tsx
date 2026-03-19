import { Card, Skeleton } from 'antd';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export default function TableSkeleton({
  rows = 6,
  columns = 5,
  className = '',
}: TableSkeletonProps) {
  return (
    <Card className={`rounded-2xl border border-slate-200 ${className}`} classNames={{ body: 'p-0' }}>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-5 gap-4 border-b border-slate-100 px-4 py-3 sm:px-6">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton.Input key={index} active size="small" className="!h-4 !w-[70%]" />
            ))}
          </div>
          <div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-4 border-b border-slate-50 px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-2">
                  <Skeleton.Avatar active size={30} shape="circle" />
                  <Skeleton.Input active size="small" className="!h-4 !w-28" />
                </div>
                <Skeleton.Input active size="small" className="!h-4 !w-20" />
                <Skeleton.Input active size="small" className="!h-4 !w-24" />
                <Skeleton.Input active size="small" className="!h-4 !w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton.Button active size="small" className="!h-7 !w-16" />
                  <Skeleton.Button active size="small" className="!h-7 !w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
