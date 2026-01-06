import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { LoginPage } from "../LoginPage";
import { AuthProvider } from "../../providers/AuthProvider";

// Mock login API to avoid network calls in unit tests
vi.mock("../../api", () => ({
  login: vi.fn().mockResolvedValue({
    token: "token",
    userId: 1,
    email: "user@example.com",
    displayName: "User",
  }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </AuthProvider>
  );
}

describe("LoginPage", () => {
  it("renders login form fields", () => {
    render(
      <Wrapper>
        <LoginPage />
      </Wrapper>,
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/remote project hub/i)).toBeInTheDocument();
  });
});
