import { describe, expectTypeOf, test } from "vitest";
import { type MaybeReactAsyncProxy } from "../maybeProxy/types";
import type { ReactAsyncProxy } from "../types";
import { fixupMaybeReactAsyncProxyProps } from "../maybeProxy/fixup";

interface ModelA {
  a: string;
}

interface ModelB {
  b: number;
}

type ProxyA = ReactAsyncProxy<ModelA>;
type ProxyB = ReactAsyncProxy<ModelB>;

describe("fixupMaybeReactAsyncProxyProps()", () => {
  test("works for one prop", () => {
    interface Props {
      a: MaybeReactAsyncProxy<ProxyA>;
    }

    expectTypeOf(fixupMaybeReactAsyncProxyProps({} as Props)).toEqualTypeOf<{
      aProxy: ReactAsyncProxy<ModelA>;
    }>();
  });

  test("works for one optional prop", () => {
    interface Props {
      a?: MaybeReactAsyncProxy<ProxyA>;
    }

    expectTypeOf(fixupMaybeReactAsyncProxyProps({} as Props)).toEqualTypeOf<{
      aProxy?: ReactAsyncProxy<ModelA>;
    }>();
  });

  test("works for two prop", () => {
    interface Props {
      a: MaybeReactAsyncProxy<ProxyA>;
      b: MaybeReactAsyncProxy<ProxyB>;
    }

    expectTypeOf(fixupMaybeReactAsyncProxyProps({} as Props)).toEqualTypeOf<{
      aProxy: ReactAsyncProxy<ModelA>;
      bProxy: ReactAsyncProxy<ModelB>;
    }>();
  });

  test("works for two selected props", () => {
    interface Props {
      a: MaybeReactAsyncProxy<ProxyA>;
      b: MaybeReactAsyncProxy<ProxyB>;
      c: string;
    }

    expectTypeOf(
      fixupMaybeReactAsyncProxyProps({} as Props, ["a", "b"]),
    ).toEqualTypeOf<{
      aProxy: ReactAsyncProxy<ModelA>;
      bProxy: ReactAsyncProxy<ModelB>;
      c: string;
    }>();
  });
});
