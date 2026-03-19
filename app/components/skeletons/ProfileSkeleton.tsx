import { Card, Col, Row, Skeleton } from 'antd';

interface ProfileSkeletonProps {
  className?: string;
}

export default function ProfileSkeleton({ className = '' }: ProfileSkeletonProps) {
  return (
    <Card className={`rounded-[20px] border border-slate-100 overflow-hidden ${className}`} classNames={{ body: 'p-0' }}>
      <div className="h-32 bg-slate-200/70 animate-pulse" />
      <div className="px-6 pb-6 sm:px-8 sm:pb-7">
        <div className="-mt-10 mb-5 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Skeleton.Avatar active size={80} shape="circle" />
            <div>
              <Skeleton.Input active size="small" style={{ height: 20, width: 160 }} />
              <div className="mt-2"><Skeleton.Input active size="small" style={{ height: 16, width: 96 }} /></div>
            </div>
          </div>
          <Skeleton.Button active style={{ height: 36, width: 112 }} />
        </div>

        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <Skeleton active title={false} paragraph={{ rows: 2, width: ['100%', '70%'] }} />
        </div>

        <Row gutter={[24, 12]}>
          <Col xs={24} md={12}>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton.Input key={i} active size="small" className="w-full" style={{ height: 36 }} />
              ))}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton.Input key={i} active size="small" className="w-full" style={{ height: 36 }} />
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
}
