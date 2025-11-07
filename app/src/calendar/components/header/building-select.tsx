import { useCalendar } from '@/calendar/contexts/calendar-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
            {buildings.map((building) => {
              if (building.name === undefined) return null;
              const words = building.name.split(' ');
              if (words.length < 3) words.slice(0, 2);
              let name = '';
              switch (words.length) {
                case 3:
                  name = `${building.name.split(' ')[0]?.[0] ?? ''}${building.name.split(' ')[1]?.[0] ?? ''}${building.name.split(' ')[2]?.[0]}`;
                  break;
                case 2:
                  name = `${building.name.split(' ')[0]?.[0] ?? ''}${building.name.split(' ')[1]?.[0] ?? ''}`;
                  break;
                case 1:
                  name = `${building.name.split(' ')[0]?.[0] ?? ''}`;
                  break;
              }
              return (
                <Avatar key={building.id} className='size-8 text-xs'>
                  <AvatarFallback className='text-xs'>{name}</AvatarFallback>
                </Avatar>
              );
            })}
            All
          </div>
        </SelectItem>

        {buildings.map((building) => {
          const words = building.name.split(' ');
          if (words.length < 3) words.slice(0, 2);
          let name = '';
          switch (words.length) {
            case 3:
              name = `${building.name.split(' ')[0]?.[0] ?? ''}${building.name.split(' ')[1]?.[0] ?? ''}${building.name.split(' ')[2]?.[0]}`;
              break;
            case 2:
              name = `${building.name.split(' ')[0]?.[0] ?? ''}${building.name.split(' ')[1]?.[0] ?? ''}`;
              break;
            case 1:
              name = `${building.name.split(' ')[0]?.[0] ?? ''}`;
              break;
          }
          return (
            <SelectItem
              key={building.id}
              value={String(building.id)}
              className='flex-1'
            >
              <div className='flex items-center gap-2'>
                <Avatar key={building.id} className='size-8'>
                  <AvatarFallback className='text-xs'>{name}</AvatarFallback>
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
