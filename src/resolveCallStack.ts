import is, { assert } from "@sindresorhus/is";
import {
  isReactAsyncProxy,
  transformFnProp,
  type AnyFunction,
  type CallStack,
  type CallStackItem,
  type CallStackModelType,
  type ExplicitAny,
} from "@/types";

const resolveCallStackItem = async (target: unknown, item: CallStackItem) => {
  const { propName, args } = item;

  const model = target as CallStackModelType;

  if (propName === transformFnProp) {
    assert.array(args);
    const transformFn = args[0];
    assert.function(transformFn, "transform requires a mapping function");

    const transformed = transformFn(target);

    if (isReactAsyncProxy(transformed)) {
      return transformed.resolve();
    }

    return transformed;
  }

  if (is.nullOrUndefined(model)) {
    return undefined;
  }

  const property = model[propName as keyof typeof model];

  if (args === undefined) {
    return property;
  }

  assert.function(property);

  const asyncFn = property.bind(target) as AnyFunction;

  return await asyncFn(...args);
};

export const resolveCallStack = async (
  initialModel: ExplicitAny,
  stack: CallStack,
) => {
  let result = initialModel;

  for (const item of stack) {
    result = await resolveCallStackItem(result, item);
  }

  return result;
};
