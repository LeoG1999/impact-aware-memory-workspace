import { CONDITIONS } from "./constants.js";

const PERMISSIONS_BY_CONDITION = Object.freeze({
  [CONDITIONS.HIDDEN]: {
    canViewMemory: false,
    canViewProposedUpdates: false,
    canViewConflictQueue: false,
    canEditMemory: false
  },
  [CONDITIONS.VISIBLE_READONLY]: {
    canViewMemory: true,
    canViewProposedUpdates: true,
    canViewConflictQueue: true,
    canEditMemory: false
  },
  [CONDITIONS.VISIBLE_EDITABLE]: {
    canViewMemory: true,
    canViewProposedUpdates: true,
    canViewConflictQueue: true,
    canEditMemory: true
  }
});

export function getPermissions(condition) {
  const permissions = PERMISSIONS_BY_CONDITION[condition];

  if (!permissions) {
    throw new Error(`Unknown condition: ${condition}`);
  }

  return permissions;
}
