import type { ModelIdentifier } from "./types";

export const modelIdentifiers: ModelIdentifier[] = [];

export const registerModelIdentifier = (identifier: ModelIdentifier): void => {
  modelIdentifiers.push(identifier);
};
