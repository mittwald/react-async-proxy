import { hash } from "object-code";

const hashCache = new WeakMap<object, number>();

export const hashObject = (obj: object): number => {
  const hashed = hashCache.get(obj) ?? hash(obj);
  hashCache.set(obj, hashed);
  return hashed;
};
