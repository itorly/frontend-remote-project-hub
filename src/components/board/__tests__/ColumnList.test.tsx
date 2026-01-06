import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ColumnList } from "../ColumnList";
import type { Column } from "../../../api/types";

const columns: Column[] = [
  { id: 1, name: "To Do", position: 1, tasks: [] },
  {
    id: 2,
    name: "In Progress",
    position: 2,
    tasks: [{ id: 1, columnId: 2, title: "Design header", description: "Create hero section" }],
  },
];

describe("ColumnList", () => {
  it("renders provided columns and tasks", () => {
    render(
      <ColumnList columns={columns} onTaskMove={vi.fn()} onCreateTask={vi.fn()} />,
    );

    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Design header")).toBeInTheDocument();
  });
});
