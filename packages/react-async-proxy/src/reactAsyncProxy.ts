import { createElement } from "react";
import { resolveCallStack } from "./resolveCallStack";
import {
  transformFnProp,
  useProxyMarker,
  type CallStack,
  type ReactAsyncProxy,
  type ReactAsyncProxyMethods,
} from "./types";
import { useCallStack } from "./useCallStack";
import { Render } from "./lib/Render";

function buildProxyDeep<T>(model: T, callStack: CallStack): ReactAsyncProxy<T> {
  const target = (() => {
    // Dummy function to allow proxying function calls
  }) as never;

  const useQuery: ReactAsyncProxyMethods<T>["useQuery"] = (options) =>
    useCallStack<T>(model, callStack, options);

  const useProxyMethods: ReactAsyncProxyMethods<T> = {
    resolve: () => resolveCallStack(model, callStack),

    use: (options) => useQuery(options).value,
    useQuery,

    render: (transform) => {
      const render = () => {
        const usedValue = useProxyMethods.use();
        return transform ? transform(usedValue) : usedValue;
      };
      return createElement(Render, { render });
    },

    transform: (fn, dependencies) => {
      callStack.push({
        propName: transformFnProp,
        args: [fn, dependencies],
      });
      return proxy;
    },
  };

  const proxy = new Proxy(target, {
    get: ($, prop) => {
      if (prop === useProxyMarker) {
        return true;
      }

      if (prop in useProxyMethods) {
        return useProxyMethods[prop as keyof ReactAsyncProxyMethods<T>];
      }

      if (prop === Symbol.toPrimitive) {
        return (hint: string) => {
          if (hint === "string") {
            return "ReactAsyncProxyFunction";
          }
          return null;
        };
      }

      return buildProxyDeep(model, [
        ...callStack,
        {
          propName: String(prop),
        },
      ]);
    },

    apply: ($, $$, args) => {
      const prevCallStackEntry = callStack[callStack.length - 1];

      if (prevCallStackEntry) {
        prevCallStackEntry.args = args;
      }

      return buildProxyDeep(model, callStack);
    },
  });

  return proxy;
}

export function reactAsyncProxy<T>(model: T): ReactAsyncProxy<T> {
  return buildProxyDeep(model, []);
}
