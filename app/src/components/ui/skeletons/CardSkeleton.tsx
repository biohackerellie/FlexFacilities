import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FacilityCardSkeleton() {
  return (
    <Card className="h-[380px] w-[400px] border-gray-100 bg-opacity-10">
      <CardHeader>
        <Skeleton className="h-[260px] w-[350px]" />
      </CardHeader>
      <CardContent className="mt-2 space-y-1 text-center">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[250px]" />
      </CardContent>
    </Card>
  );
}
