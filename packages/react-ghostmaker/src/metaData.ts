import type { Class } from "type-fest";

interface GhostMakerModelOptions<T extends Class<unknown>> {
  getId?: (instance: InstanceType<T>) => string;
  name?: string;
}

const store = new Map<unknown, GhostMakerModelOptions<Class<unknown>>>();

export const getMetaData = (something: unknown) => {
  return store.get(something);
};

export function GhostMakerModel<T extends Class<unknown>>(
  options: GhostMakerModelOptions<T>,
) {
  return function (target: T) {
    store.set(target, options);
  };
}
