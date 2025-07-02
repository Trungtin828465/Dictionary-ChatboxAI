/**
 * Represents a workspace
 */
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * For creating or updating a workspace
 */
export interface WorkspaceInput {
  name: string;
  description?: string;
  userId: string;
}

/**
 * Operation states for workspace actions
 */
export interface WorkspaceOperationState {
  fetchingWorkspaces: boolean;
  creatingWorkspace: boolean;
  updatingWorkspace: boolean;
  deletingWorkspace: boolean;
}

/**
 * Props for the workspace item component
 */
export interface WorkspaceItemProps {
  workspace: Workspace;
  onSelect: (id: string, title: string) => void;
  onDelete: (id: string) => Promise<boolean>;
  onEdit: (id: string, data: WorkspaceInput) => Promise<boolean>;
}
