import is from "@sindresorhus/is";
import type { AbstractClass, Class } from "type-fest";

type DecoratorTarget = Class<unknown> | AbstractClass<unknown>;

interface GhostMakerModelMeta<T extends DecoratorTarget> {
  getId?: (instance: InstanceType<T>) => string;
  name?: string;
}

const store = new Map<unknown, GhostMakerModelMeta<DecoratorTarget>>();

const testNameConflict = (name: string) => {
  if (Array.from(store.values()).some((meta) => meta.name === name)) {
    throw new Error(
      `GhostMakerModel name conflict: A model with the name "${name}" is already registered.`,
    );
  }
};

export function GhostMakerModel<T extends DecoratorTarget>(
  options: GhostMakerModelMeta<T>,
) {
  return function (target: T) {
    if (options.name) {
      testNameConflict(options.name);
    }
    store.set(target, options);
  };
}

type IdentifyModel = (
  something: unknown,
) => GhostMakerModelMeta<DecoratorTarget> | undefined;

const modelIdentifiers: IdentifyModel[] = [];

export function ghostMakerModel(modelIdentifier: IdentifyModel): void {
  modelIdentifiers.push(modelIdentifier);
}

const getMetaDataFromIdentifiers = (
  something: unknown,
): GhostMakerModelMeta<DecoratorTarget> | undefined => {
  for (const identifyModel of modelIdentifiers) {
    const meta = identifyModel(something);
    if (meta) {
      return meta;
    }
  }
};

function isClass(value: unknown): value is Class<unknown> {
  return typeof value === "function" && /class[\s{]/.test(value.toString());
}

const getClass = (
  something: unknown,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
): Function | Class<unknown> | undefined => {
  return isClass(something)
    ? something
    : is.object(something)
      ? something.constructor
      : undefined;
};

export const getMetaData = (
  something: unknown,
): GhostMakerModelMeta<DecoratorTarget> | undefined => {
  return (
    getMetaDataRecursive(something, undefined, getClass(something)) ??
    getMetaDataFromIdentifiers(something)
  );
};

const getMetaDataRecursive = (
  something: unknown,
  collectedMeta?: Partial<GhostMakerModelMeta<DecoratorTarget>>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  klass?: Function,
): GhostMakerModelMeta<DecoratorTarget> | undefined => {
  const currentClass = getClass(something);

  const meta = store.get(klass ?? currentClass);

  const mergedMeta =
    meta || collectedMeta ? { ...meta, ...collectedMeta } : undefined;

  if (mergedMeta && "getId" in mergedMeta && "name" in mergedMeta) {
    return mergedMeta;
  }

  if (!klass) {
    return mergedMeta;
  }

  return getMetaDataRecursive(
    something,
    mergedMeta,
    Object.getPrototypeOf(klass),
  );
};
