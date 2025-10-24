import { HelpCircle } from 'lucide-react';
import Image from 'next/image';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

const CalendarInfo = () => (
  <HoverCard>
    <HoverCardTrigger>
      <HelpCircle strokeWidth={1.5} />
    </HoverCardTrigger>
    <HoverCardContent>
      <div className='flex flex-col gap-[7px]'>
        <div className='flex flex-col gap-[15px]'>
          <div className='m-0 text-[15px] leading-normal'>
            Click the{' '}
            <Image
              src='/addToCal.png'
              className='inline border drop-shadow-xs'
              width={100}
              height={20}
              alt='Add to Calendar'
            />{' '}
            button in the bottom right corner of the google calendar page to add
            it to your own google calendar.
          </div>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
);

export default CalendarInfo;
