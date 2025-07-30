import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { DataTable } from "./data-table";

describe("DataTable", () => {
  const columns = [
    { header: "Name", cell: (data: any) => data.name },
    { header: "Age", cell: (data: any) => data.age },
  ];

  const data = [
    { name: "John Doe", age: 25 },
    { name: "Jane Smith", age: 30 },
  ];

  test("renders table headers correctly", () => {
    render(<DataTable columns={columns} data={data} />);

    const nameHeader = screen.getByText("Name");
    const ageHeader = screen.getByText("Age");

    expect(nameHeader).toBeDefined();
    expect(ageHeader).toBeDefined();
  });

  // test("renders table rows correctly", () => {
  //   render(<DataTable columns={columns} data={data} />);

  //   const johnDoeRow = screen.getByText("John Doe", { exact: false });
  //   const janeSmithRow = screen.getByText("Jane Smith", { exact: false });

  //   expect(johnDoeRow).toBeDefined();
  //   expect(janeSmithRow).toBeDefined();
  // });

  test("renders 'No results' message when data is empty", () => {
    render(<DataTable columns={columns} data={[]} />);

    const noResultsMessage = screen.getByText("No results.");

    expect(noResultsMessage).toBeDefined();
  });
});
