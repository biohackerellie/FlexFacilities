'use client';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { getAllBuildingNames } from '@/lib/actions/facilities';
import { getUserNotifications, newNotification } from '@/lib/actions/users';

type Props = {
  getNotificationsPromise: Promise<
    Awaited<ReturnType<typeof getUserNotifications>>
  >;
  getBuildingsPromise: Promise<Awaited<ReturnType<typeof getAllBuildingNames>>>;
  userId: string;
};

export default function NotificationList({
  getNotificationsPromise,
  getBuildingsPromise,
  userId,
}: Props) {
  const notifications = React.use(getNotificationsPromise);
  const buildings = React.use(getBuildingsPromise);
  const [selectedBuilding, setSelectedBuilding] = React.useState<
    { name: string; id: string } | undefined
  >(undefined);
  const onChange = (value: string) => {
    setSelectedBuilding(buildings?.find((building) => building.name === value));
  };
  const onSubmit = () => {
    if (!selectedBuilding) return;
    toast.promise(newNotification({ userId, buildingId: selectedBuilding.id }));
  };

  return (
    <div className="space-y-7 max-w-2xl">
      <ScrollArea className="h-72 w-lg rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm leading-none font-medium">
            Enabled Notifications
          </h4>
          {notifications.map((n) => (
            <React.Fragment key={n.id}>
              <div className="text-sm">{n.buildingName}</div>
              <Separator className="my-2" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
      <div>
        <h4 className="mb-4 text-sm leading-none font-medium">
          Add New Notification
        </h4>
        <Select onValueChange={onChange}>
          <SelectTrigger className="w-full">
            {selectedBuilding ? selectedBuilding.name : 'Select Building'}
          </SelectTrigger>
          <SelectContent>
            {buildings?.map((building) => (
              <SelectItem key={building.id} value={building.name}>
                {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSubmit}>Add Notification</Button>
    </div>
  );
}
