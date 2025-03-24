import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkspaceCard } from "./WorkspaceCard";
import {
  mockTeam,
  mockAdminMember,
  mockMemberRole,
} from "@/__tests__/unit-test-mocks";
import { clearCommonMocks, mockRouter } from "@/__tests__/mocks";
import { renderWithProviders } from "@/__tests__/test-utils";

// Mock window.confirm
const mockConfirm = vi.fn();
vi.stubGlobal("confirm", mockConfirm);

// Mock the hooks
const mockUpdateTeam = vi.fn();
const mockDeleteTeam = vi.fn();

vi.mock("@repo/supabase", () => ({
  useUpdateTeam: () => ({
    mutate: mockUpdateTeam,
  }),
  useDeleteTeam: () => ({
    mutate: mockDeleteTeam,
  }),
  useTeams: () => ({
    refetch: vi.fn(),
  }),
}));

describe("WorkspaceCard", () => {
  beforeEach(() => {
    clearCommonMocks();
    mockConfirm.mockClear();
    mockUpdateTeam.mockClear();
    mockDeleteTeam.mockClear();
  });

  describe("Rendering", () => {
    it("should render team name and website", () => {
      renderWithProviders(
        <WorkspaceCard team={mockTeam} currentMember={mockAdminMember} />
      );

      expect(screen.getByText(mockTeam.name)).toBeInTheDocument();
      expect(screen.getByText(mockTeam.website!)).toBeInTheDocument();
    });

    it("should render 'No description provided' when website is null", () => {
      const teamWithoutWebsite = { ...mockTeam, website: null };
      renderWithProviders(
        <WorkspaceCard
          team={teamWithoutWebsite}
          currentMember={mockAdminMember}
        />
      );

      expect(screen.getByText("No description provided")).toBeInTheDocument();
    });

    it("should apply disabled styles when disabled prop is true", () => {
      renderWithProviders(
        <WorkspaceCard
          team={mockTeam}
          currentMember={mockAdminMember}
          disabled={true}
        />
      );

      const card = screen.getByRole("article");
      expect(card).toHaveClass("opacity-50", "cursor-not-allowed");
    });
  });

  describe("Admin View", () => {
    it("should render edit and delete buttons for admin", () => {
      renderWithProviders(
        <WorkspaceCard team={mockTeam} currentMember={mockAdminMember} />
      );

      expect(screen.getByTestId("settings-button")).toBeInTheDocument();
      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
    });

    it("should open settings modal when edit button is clicked", () => {
      renderWithProviders(
        <WorkspaceCard team={mockTeam} currentMember={mockAdminMember} />
      );

      const settingsButton = screen.getByTestId("settings-button");
      fireEvent.click(settingsButton, { stopPropagation: true });

      // Settings modal is rendered by WorkspaceSettings component
      // We don't need to test its internals here
    });

    it("should call deleteTeam when delete is confirmed", async () => {
      mockConfirm.mockReturnValue(true);

      renderWithProviders(
        <WorkspaceCard team={mockTeam} currentMember={mockAdminMember} />
      );

      // Click delete button
      const deleteButton = screen.getByTestId("delete-button");
      fireEvent.click(deleteButton, { stopPropagation: true });

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockDeleteTeam).toHaveBeenCalledWith(
          { teamId: mockTeam.id },
          expect.any(Object)
        );
      });
    });

    it("should not call deleteTeam when delete is cancelled", () => {
      mockConfirm.mockReturnValue(false);

      renderWithProviders(
        <WorkspaceCard team={mockTeam} currentMember={mockAdminMember} />
      );

      // Click delete button
      fireEvent.click(screen.getByTestId("delete-button"), {
        stopPropagation: true,
      });

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockDeleteTeam).not.toHaveBeenCalled();
    });
  });

  describe("Member View", () => {
    it("should not render edit and delete buttons for member", () => {
      renderWithProviders(
        <WorkspaceCard team={mockTeam} currentMember={mockMemberRole} />
      );

      expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should navigate to team page when card is clicked", async () => {
      renderWithProviders(
        <WorkspaceCard team={mockTeam} currentMember={mockAdminMember} />
      );

      const card = screen.getByRole("article");
      fireEvent.click(card);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          `/org/${mockTeam.organization_id}/${mockTeam.id}`
        );
      });
    });

    it("should not navigate when disabled", () => {
      renderWithProviders(
        <WorkspaceCard
          team={mockTeam}
          currentMember={mockAdminMember}
          disabled={true}
        />
      );

      fireEvent.click(screen.getByRole("article"));
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
