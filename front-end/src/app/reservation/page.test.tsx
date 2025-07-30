import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import ReservationPage from "./page";

test("renders reservation page", () => {
  render(<ReservationPage />);
  expect(screen.findByRole("button"));
});
