import { useCalendar } from '@/calendar/contexts/calendar-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function BuildingSelect() {
  const { buildings, selectedBuildingId, setSelectedBuildingId } =
    useCalendar();
  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
  };

  return (
    <Select
      value={String(selectedBuildingId)}
      onValueChange={handleSelectBuilding}
    >
      <SelectTrigger className='flex-1 md:w-48'>
        <SelectValue />
      </SelectTrigger>

      <SelectContent align='end'>
        <SelectItem value='all'>
          <div className='flex items-center gap-1'>
            <AvatarGroup max={2}>
              {buildings.map((building) => {
                const name =
                  building.name.split(' ').length > 1
                    ? `${building.name.split(' ')[0]?.[0] ?? ''}${building.name.split(' ')[1]?.[0] ?? ''}${building.name.split(' ')[2]?.[0]}}`
                    : building.name.substring(0, 1);
                return (
                  <Avatar key={building.id} className='size-6 text-xxs'>
                    <AvatarFallback className='text-xxs'>{name}</AvatarFallback>
                  </Avatar>
                );
              })}
            </AvatarGroup>
            All
          </div>
        </SelectItem>

        {buildings.map((building) => {
          const name =
            building.name.split(' ').length > 1
              ? `${building.name.split(' ')[0]?.[0] ?? ''}${building.name.split(' ')[1]?.[0] ?? ''}${building.name.split(' ')[2]?.[0]}}`
              : building.name.substring(0, 1);
          return (
            <SelectItem
              key={building.id}
              value={String(building.id)}
              className='flex-1'
            >
              <div className='flex items-center gap-2'>
                <Avatar key={building.id} className='size-6'>
                  <AvatarFallback className='text-xxs'>{name}</AvatarFallback>
                </Avatar>

                <p className='truncate'>{building.name}</p>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
