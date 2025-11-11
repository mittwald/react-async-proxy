import is from "@sindresorhus/is";
import type { AbstractClass, Class } from "type-fest";

type DecoratorTarget = Class<unknown> | AbstractClass<unknown>;

interface GhostMakerModelMeta<T extends DecoratorTarget> {
  getId?: (instance: InstanceType<T>) => string;
  name?: string;
}

const store = new Map<unknown, GhostMakerModelMeta<DecoratorTarget>>();

export function GhostMakerModel<T extends DecoratorTarget>(
  options: GhostMakerModelMeta<T>,
) {
  return function (target: T) {
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

export const getMetaData = (
  something: unknown,
): GhostMakerModelMeta<DecoratorTarget> | undefined => {
  return (
    getMetaDataRecursive(
      something,
      undefined,
      is.object(something) ? something.constructor : undefined,
    ) ?? getMetaDataFromIdentifiers(something)
  );
};

const getMetaDataRecursive = (
  something: unknown,
  collectedOptions?: Partial<GhostMakerModelMeta<DecoratorTarget>>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  klass?: Function,
): GhostMakerModelMeta<DecoratorTarget> | undefined => {
  const currentClass = is.object(something) ? something.constructor : undefined;

  const meta = store.get(klass ?? currentClass);
  const mergedMeta =
    meta || collectedOptions ? { ...meta, ...collectedOptions } : undefined;

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
