import { ReservationDateType } from '@local/db/schema';
import { describe, expect, it } from 'vitest';

import { generateMockReservationDate } from '@/utils/mockData';
import range from './dateRange';

describe('range', () => {
  it('should return the date range when ReservationDate has more than one element', () => {
    const ReservationDate = [
      generateMockReservationDate({
        startDate: '2022-01-01',
        endDate: '2022-01-05',
      }),
      generateMockReservationDate({
        startDate: '2022-01-10',
        endDate: '2022-01-15',
      }),
    ];
    const result = range(ReservationDate);
    expect(result).toBe('2022-01-01 - 2022-01-15');
  });

  it('should return the start date when ReservationDate has only one element', () => {
    const ReservationDate = [
      generateMockReservationDate({
        startDate: '2022-01-01',
        endDate: '2022-01-05',
      }),
    ];
    const result = range(ReservationDate);
    expect(result).toBe('2022-01-01');
  });

  it("should return 'No Upcoming Dates' when ReservationDate is empty", () => {
    const ReservationDate: ReservationDateType[] = [];
    const result = range(ReservationDate);
    expect(result).toBe('No Upcoming Dates');
  });
});
