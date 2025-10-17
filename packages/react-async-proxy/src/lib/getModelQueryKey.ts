import is from "@sindresorhus/is";

export const getModelQueryKey = (model: unknown): unknown => {
  if (is.function(model)) {
    return model.name;
  }
  if (is.class(model) || is.object(model)) {
    return model.constructor.name;
  }
  return model;
};
