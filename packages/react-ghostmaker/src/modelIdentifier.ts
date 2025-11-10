import type { ModelIdentifier } from "./types";

export const modelIdentifiers: ModelIdentifier[] = [];

/** @deprecated Use GhostMakerModel (decorator) instead */
export const registerModelIdentifier = (identifier: ModelIdentifier): void => {
  modelIdentifiers.push(identifier);
};
