import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';

import Home from './page';

test('Home Page', () => {
  render(<Home />);
  const main = within(screen.getByRole('main'));
  expect(
    main.getByRole('heading', {
      level: 1,
      name: /Laurel Public Schools Facility Rentals/i,
    }),
  ).toBeDefined();
});
