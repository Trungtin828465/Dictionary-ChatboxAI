import { api } from "@/services/api-client";
import { Workspace, WorkspaceInput } from "../types";

// const BASE_URL = '/api/v1/Workspace';
const BASE_URL = import.meta.env.VITE_BE_API_URL;
// http://localhost:5299/api/v1/Workspace

/**
 * Service for workspace-related API operations
 */
export const workspaceService = {
  /**
   * Create a new workspace
   */
  createWorkspace: (workspace: WorkspaceInput) => {
    return api.post<Workspace>(`${BASE_URL}Workspace`, workspace);
  },
  /**
   * Get all workspaces for the current user
   */
  getWorkspacesByUserId: (userId: string) => {
    return api.get<Workspace[]>(`${BASE_URL}api/v1/Workspace/${userId}`);
  },

  /**
   * Get a specific workspace by ID
   */
  getWorkspace: (workspaceId: string) => {
    return api.get<Workspace>(`${BASE_URL}api/v1/Workspace/${workspaceId}`);
  },

  /**
   * Update an existing workspace
   */
  updateWorkspace: (workspaceId: string, workspace: WorkspaceInput) => {
    return api.put<Workspace>(
      `${BASE_URL}api/v1/Workspace/${workspaceId}`,
      workspace,
    );
  },

  /**
   * Delete a workspace
   */
  deleteWorkspace: (workspaceId: string) => {
    return api.delete<void>(`${BASE_URL}/api/v1/Workspace/${workspaceId}`);
  },
};
