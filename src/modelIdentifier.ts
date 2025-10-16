import is from "@sindresorhus/is";

export type ModelIdentifier = (something: unknown) => string | undefined;

const modelIdentifiers: ModelIdentifier[] = [];

export function registerModelIdentifier(modelIdentifier: ModelIdentifier) {
  modelIdentifiers.push(modelIdentifier);
}

const registerDefaultModelIdentifiers = () => {
  // Default model identifier that works for classes, class instances and static function calls
  registerModelIdentifier((something) => {
    if (is.function(something)) {
      return something.name;
    }
    if (is.class(something)) {
      return something.constructor.name;
    }
    if (is.object(something)) {
      return something.constructor.name;
    }
  });
};

registerDefaultModelIdentifiers();

export const getModelIdentifiers = (something: unknown) => {
  return modelIdentifiers
    .map((identifierFn) => identifierFn(something))
    .filter((id) => id !== undefined);
};
