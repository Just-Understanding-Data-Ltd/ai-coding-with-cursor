import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkspaceGrid } from "./WorkspaceGrid";
import {
  mockTeam,
  mockAdminMember,
  mockMemberRole,
} from "@/__tests__/unit-test-mocks";
import { clearCommonMocks } from "@/__tests__/mocks";
import { renderWithProviders } from "@/__tests__/test-utils";

// Mock the hooks
const mockCreateTeam = vi.fn();

vi.mock("@repo/supabase", () => ({
  useCreateTeam: () => ({
    mutate: mockCreateTeam,
  }),
}));

// Mock the WorkspaceCard component
vi.mock("../WorkspaceCard/WorkspaceCard", () => ({
  WorkspaceCard: ({ team }: { team: typeof mockTeam }) => (
    <div data-testid="workspace-card">{team.name}</div>
  ),
}));

const mockTeams = [
  mockTeam,
  {
    ...mockTeam,
    id: "2",
    name: "Team 2",
  },
];

describe("WorkspaceGrid", () => {
  beforeEach(() => {
    clearCommonMocks();
    mockCreateTeam.mockClear();
  });

  describe("Admin View", () => {
    it("should render create workspace button for admin", () => {
      renderWithProviders(
        <WorkspaceGrid teams={mockTeams} currentMember={mockAdminMember} />
      );

      expect(screen.getByText(/create workspace/i)).toBeInTheDocument();
      expect(screen.getAllByTestId("workspace-card")).toHaveLength(2);
    });

    it("should open create workspace modal when button is clicked", () => {
      renderWithProviders(
        <WorkspaceGrid teams={mockTeams} currentMember={mockAdminMember} />
      );

      fireEvent.click(screen.getByText(/create workspace/i));
      expect(screen.getByText("Create New Workspace")).toBeInTheDocument();
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Website")).toBeInTheDocument();
    });

    it("should call createTeam when form is submitted", async () => {
      renderWithProviders(
        <WorkspaceGrid teams={mockTeams} currentMember={mockAdminMember} />
      );

      // Open modal
      const createButton = screen.getByText(/create workspace/i);
      fireEvent.click(createButton, { stopPropagation: true });

      // Fill form
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: "New Team" },
      });
      fireEvent.change(screen.getByLabelText("Website"), {
        target: { value: "https://example.com" },
      });

      // Submit form
      const form = screen.getByRole("form");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockCreateTeam).toHaveBeenCalledWith(
          {
            team: {
              name: "New Team",
              website: "https://example.com",
              organization_id: "org-1",
            },
          },
          expect.any(Object)
        );
      });
    });

    it("should render all workspace cards", () => {
      renderWithProviders(
        <WorkspaceGrid teams={mockTeams} currentMember={mockAdminMember} />
      );

      const cards = screen.getAllByTestId("workspace-card");
      expect(cards).toHaveLength(2);
      expect(cards[0]).toHaveTextContent("Test Team");
      expect(cards[1]).toHaveTextContent("Team 2");
    });
  });

  describe("Member View", () => {
    it("should not render create workspace button for member", () => {
      renderWithProviders(
        <WorkspaceGrid teams={mockTeams} currentMember={mockMemberRole} />
      );

      expect(screen.queryByText(/create workspace/i)).not.toBeInTheDocument();
      expect(screen.getAllByTestId("workspace-card")).toHaveLength(2);
    });

    it("should still render workspace cards", () => {
      renderWithProviders(
        <WorkspaceGrid teams={mockTeams} currentMember={mockMemberRole} />
      );

      const cards = screen.getAllByTestId("workspace-card");
      expect(cards).toHaveLength(2);
      expect(cards[0]).toHaveTextContent("Test Team");
      expect(cards[1]).toHaveTextContent("Team 2");
    });
  });

  describe("Empty State", () => {
    it("should render empty state message when no teams", () => {
      renderWithProviders(
        <WorkspaceGrid teams={[]} currentMember={mockMemberRole} />
      );

      expect(screen.getByText(/no workspaces found/i)).toBeInTheDocument();
      expect(
        screen.getByText(/get started by creating a new workspace/i)
      ).toBeInTheDocument();
    });

    it("should still show create button in empty state for admin", () => {
      renderWithProviders(
        <WorkspaceGrid teams={[]} currentMember={mockAdminMember} />
      );

      expect(screen.getByText(/create workspace/i)).toBeInTheDocument();
    });

    it("should not show create button in empty state for member", () => {
      renderWithProviders(
        <WorkspaceGrid teams={[]} currentMember={mockMemberRole} />
      );

      expect(screen.queryByText(/create workspace/i)).not.toBeInTheDocument();
    });
  });
});
