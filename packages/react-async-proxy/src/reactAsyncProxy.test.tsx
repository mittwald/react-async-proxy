import { cleanup, render } from "@testing-library/react";
import { describe, expect, test, vitest, beforeEach } from "vitest";
import {
  CustomerDetailed,
  CustomerProxy,
  Project,
  ProjectProxy,
  customerMocks,
  projectMocks,
} from "./testMocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

test("pre test", async () => {
  const project = new Project("P1");
  expect(projectMocks.getDetailed).toHaveBeenCalledTimes(0);
  expect(customerMocks.getDetailed).toHaveBeenCalledTimes(0);

  const detailedProject = await project.getDetailed();
  expect(projectMocks.getDetailed).toHaveBeenCalledTimes(1);
  expect(customerMocks.getDetailed).toHaveBeenCalledTimes(0);
  expect(detailedProject.name).toBe("Project P1");

  const customer = await detailedProject.customer.getDetailed();
  expect(customerMocks.getDetailed).toHaveBeenCalledTimes(1);
  expect(customer.id).toBe("C1");
});

describe("resolve()", () => {
  test("functions are called lazy", async () => {
    const transform = vitest.fn((name: string) => name);

    const customerNameProxy = ProjectProxy.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName()
      .transform(transform);

    expect(projectMocks.getDetailed).toHaveBeenCalledTimes(0);
    expect(customerMocks.getDetailed).toHaveBeenCalledTimes(0);
    expect(customerMocks.getName).toHaveBeenCalledTimes(0);
    expect(transform).toHaveBeenCalledTimes(0);

    await customerNameProxy.resolve();

    expect(projectMocks.getDetailed).toHaveBeenCalledTimes(1);
    expect(customerMocks.getDetailed).toHaveBeenCalledTimes(1);
    expect(customerMocks.getName).toHaveBeenCalledTimes(1);
    expect(transform).toHaveBeenCalledTimes(1);
  });

  test("simple usage", async () => {
    const customerName = await ProjectProxy.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName()
      .resolve();
    expect(customerName).toBe("Customer C1");
  });

  test("with transform", async () => {
    const customerName = await ProjectProxy.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName()
      .transform((name) => name.toUpperCase())
      .resolve();
    expect(customerName).toBe("CUSTOMER C1");
  });

  test("with undefined result in call stack", async () => {
    const customerName = await ProjectProxy.ofId("Project A")
      .findDetailed()
      .customer.getDetailed()
      .getName()
      .transform((name) => {
        expect(name).toBeUndefined();
        return name?.toUpperCase();
      })
      .resolve();
    expect(customerName).toBeUndefined();
  });
});

const queryClient = new QueryClient();

describe("useValue()", () => {
  beforeEach(() => {
    queryClient.clear();
    cleanup();
  });

  async function renderHookWithSuspense<T>(
    callback: () => T,
    options: { waitForSuspense?: boolean } = {},
  ) {
    const { waitForSuspense = true } = options;

    const result: { current: unknown } = {
      current: undefined,
    };

    const Component = () => {
      result.current = callback();
      return <span data-testid="hook-ready" />;
    };
    const ui = render(<Component />, {
      wrapper: (props) => (
        <QueryClientProvider client={queryClient}>
          {props.children}
        </QueryClientProvider>
      ),
    });

    if (waitForSuspense) {
      await ui.findByTestId("hook-ready");
    }

    return {
      ui,
      result,
      rerender: () => ui.rerender(<Component />),
    };
  }

  test("functions are called lazy", async () => {
    const transform = vitest.fn((name: string) => name);

    const customerNameProxy = ProjectProxy.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName()
      .transform(transform);

    expect(projectMocks.getDetailed).toHaveBeenCalledTimes(0);
    expect(customerMocks.getDetailed).toHaveBeenCalledTimes(0);
    expect(customerMocks.getName).toHaveBeenCalledTimes(0);
    expect(transform).toHaveBeenCalledTimes(0);

    await renderHookWithSuspense(() => customerNameProxy.useQuery());

    expect(projectMocks.getDetailed).toHaveBeenCalledTimes(1);
    expect(customerMocks.getDetailed).toHaveBeenCalledTimes(1);
    expect(customerMocks.getName).toHaveBeenCalledTimes(1);
    expect(transform).toHaveBeenCalledTimes(1);
  });

  test("simple usage", async () => {
    const { result } = await renderHookWithSuspense(() =>
      ProjectProxy.ofId("Project A")
        .getDetailed()
        .customer.getDetailed()
        .getName()
        .useValue(),
    );

    expect(result.current).toBe("Customer C1");
  });

  test("simple usage with static function call", async () => {
    const { result } = await renderHookWithSuspense(() =>
      CustomerProxy.get("Customer A").useValue(),
    );

    expect(result.current).toBeInstanceOf(CustomerDetailed);
  });

  test("with transform", async () => {
    const { result } = await renderHookWithSuspense(() =>
      ProjectProxy.ofId("Project A")
        .getDetailed()
        .customer.getDetailed()
        .getName()
        .transform((name) => name.toUpperCase())
        .useValue(),
    );
    expect(result.current).toBe("CUSTOMER C1");
  });

  test("with undefined result in call stack", async () => {
    const { result } = await renderHookWithSuspense(() =>
      ProjectProxy.ofId("Project A")
        .findDetailed()
        .customer.getDetailed()
        .getName()
        .transform((name) => {
          expect(name).toBeUndefined();
          return name?.toUpperCase();
        })
        .useValue(),
    );
    expect(result.current).toBeUndefined();
  });
});
