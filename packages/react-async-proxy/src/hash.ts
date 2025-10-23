import { hash } from "object-code";

const hashCache = new WeakMap<object, number>();

export const hashObject = (model: object): number => {
  const hashed = hashCache.get(model) ?? hash(model);
  hashCache.set(model, hashed);
  return hashed;
};
