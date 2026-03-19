import { Card, Skeleton } from 'antd';

interface ListSkeletonProps {
  count?: number;
  withAvatar?: boolean;
  className?: string;
}

export default function ListSkeleton({
  count = 6,
  withAvatar = true,
  className = '',
}: ListSkeletonProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="rounded-2xl border border-slate-200" classNames={{ body: 'px-4 py-4 sm:px-5' }}>
          <div className="flex items-center gap-3">
            {withAvatar && <Skeleton.Avatar active size={48} shape="circle" />}
            <div className="min-w-0 flex-1">
              <Skeleton.Input active size="small" className="!h-4 !w-40 !max-w-full" />
              <div className="mt-2"><Skeleton.Input active size="small" className="!h-3.5 !w-56 !max-w-full" /></div>
            </div>
            <Skeleton.Button active size="small" className="!h-7 !w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}
