import { cleanup, render, waitFor } from "@testing-library/react";
import { describe, expect, test, vitest, beforeEach } from "vitest";
import {
  CustomerDetailed,
  CustomerGhost,
  Project,
  ProjectGhost,
  customerMocks,
  getCustomerNameGhostIds,
  projectMocks,
} from "./testMocks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { invalidateGhostsById } from "./invalidate";

test("Pre Test", async () => {
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

describe("Await", () => {
  test("functions are called lazy", async () => {
    const transform = vitest.fn((name: string) => name);

    const customerNameGhost = ProjectGhost.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName()
      .transform(transform);

    expect(projectMocks.getDetailed).toHaveBeenCalledTimes(0);
    expect(customerMocks.getDetailed).toHaveBeenCalledTimes(0);
    expect(customerMocks.getName).toHaveBeenCalledTimes(0);
    expect(transform).toHaveBeenCalledTimes(0);

    await customerNameGhost;

    expect(projectMocks.getDetailed).toHaveBeenCalledTimes(1);
    expect(customerMocks.getDetailed).toHaveBeenCalledTimes(1);
    expect(customerMocks.getName).toHaveBeenCalledTimes(1);
    expect(transform).toHaveBeenCalledTimes(1);
  });

  test("simple usage", async () => {
    const customerName = await ProjectGhost.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName();
    expect(customerName).toBe("Customer C1");
  });

  test("with transform", async () => {
    const customerName = await ProjectGhost.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName()
      .transform((name) => name.toUpperCase());
    expect(customerName).toBe("CUSTOMER C1");
  });

  test("with undefined result in call stack", async () => {
    const customerName = await ProjectGhost.ofId("Project A")
      .findDetailed()
      .customer.getDetailed()
      .getName()
      .transform((name) => {
        expect(name).toBeUndefined();
        return name?.toUpperCase();
      });
    expect(customerName).toBeUndefined();
  });

  test("simple usage", async () => {
    const customerName = await ProjectGhost.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName();
    expect(customerName).toBe("Customer C1");
  });

  test("with transform", async () => {
    const customerName = await ProjectGhost.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName()
      .transform((name) => name.toUpperCase());
    expect(customerName).toBe("CUSTOMER C1");
  });

  test("with undefined result in call stack", async () => {
    const customerName = await ProjectGhost.ofId("Project A")
      .findDetailed()
      .customer.getDetailed()
      .getName()
      .transform((name) => {
        expect(name).toBeUndefined();
        return name?.toUpperCase();
      });
    expect(customerName).toBeUndefined();
  });
});

describe("Hooks", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    cleanup();
    queryClient.clear();
  });

  async function renderHookWithSuspense<T>(
    callback: () => T,
    options: { waitForSuspense?: boolean } = {},
  ) {
    const { waitForSuspense = true } = options;

    const result: { current: T | undefined } = {
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

    const customerNameGhost = ProjectGhost.ofId("Project A")
      .getDetailed()
      .customer.getDetailed()
      .getName()
      .transform(transform);

    expect(projectMocks.getDetailed).toHaveBeenCalledTimes(0);
    expect(customerMocks.getDetailed).toHaveBeenCalledTimes(0);
    expect(customerMocks.getName).toHaveBeenCalledTimes(0);
    expect(transform).toHaveBeenCalledTimes(0);

    await renderHookWithSuspense(() => customerNameGhost.useGhost());

    expect(projectMocks.getDetailed).toHaveBeenCalledTimes(1);
    expect(customerMocks.getDetailed).toHaveBeenCalledTimes(1);
    expect(customerMocks.getName).toHaveBeenCalledTimes(1);
    expect(transform).toHaveBeenCalledTimes(1);
  });

  test("simple usage", async () => {
    const { result } = await renderHookWithSuspense(() =>
      ProjectGhost.ofId("Project A")
        .getDetailed()
        .customer.getDetailed()
        .getName()
        .use(),
    );

    expect(result.current).toBe("Customer C1");
    expect(customerMocks.getName).toHaveBeenCalledTimes(1);
  });

  test("simple usage with static function call", async () => {
    const { result } = await renderHookWithSuspense(() =>
      CustomerGhost.get("Customer A").use(),
    );

    expect(result.current).toBeInstanceOf(CustomerDetailed);
  });

  test("with transform", async () => {
    const { result } = await renderHookWithSuspense(() =>
      ProjectGhost.ofId("Project A")
        .getDetailed()
        .customer.getDetailed()
        .getName()
        .transform((name) => name.toUpperCase())
        .use(),
    );
    expect(result.current).toBe("CUSTOMER C1");
  });

  test("with undefined result in call stack", async () => {
    const transform = vitest.fn((name?: string) => name);

    const { result } = await renderHookWithSuspense(() =>
      ProjectGhost.ofId("Project A")
        .findDetailed()
        .customer.getDetailed()
        .getName()
        .transform(transform)
        .use(),
    );

    expect(result.current).toBeUndefined();
    expect(projectMocks.findDetailed).toHaveBeenCalledTimes(1);
    expect(customerMocks.getDetailed).toHaveBeenCalledTimes(0);
    expect(customerMocks.getName).toHaveBeenCalledTimes(0);
    expect(transform).toHaveBeenCalledTimes(1);
    expect(transform).toHaveBeenCalledWith(undefined);
  });

  describe("Invalidation", () => {
    test("useGhost.invalidate() triggers re-execution of all async methods", async () => {
      const { result } = await renderHookWithSuspense(() =>
        ProjectGhost.ofId("Project A")
          .getDetailed()
          .customer.getDetailed()
          .getName()
          .useGhost(),
      );

      result.current?.invalidate();
      await waitFor(() =>
        expect(projectMocks.getDetailed).toHaveBeenCalledTimes(2),
      );
      await waitFor(() =>
        expect(customerMocks.getDetailed).toHaveBeenCalledTimes(2),
      );
      await waitFor(() =>
        expect(customerMocks.getName).toHaveBeenCalledTimes(2),
      );
    });

    test("ghost.invalidate() triggers re-execution of all async methods", async () => {
      const ghost = ProjectGhost.ofId("Project A")
        .getDetailed()
        .customer.getDetailed()
        .getName();

      await renderHookWithSuspense(() => ghost.use());
      await waitFor(() =>
        expect(projectMocks.getDetailed).toHaveBeenCalledTimes(1),
      );

      ghost.invalidate(queryClient);
      await waitFor(() =>
        expect(customerMocks.getDetailed).toHaveBeenCalledTimes(2),
      );
      await waitFor(() =>
        expect(customerMocks.getName).toHaveBeenCalledTimes(2),
      );
    });

    test("invalidateGhostsById() triggers re-execution of all async methods", async () => {
      const ghost = ProjectGhost.ofId("Project A")
        .getDetailed()
        .customer.getDetailed()
        .getName();

      await renderHookWithSuspense(() => ghost.use());
      await waitFor(() =>
        expect(projectMocks.getDetailed).toHaveBeenCalledTimes(1),
      );

      expect(getCustomerNameGhostIds.current).toBeDefined();
      invalidateGhostsById(queryClient, getCustomerNameGhostIds.current!);
      await waitFor(() =>
        expect(customerMocks.getDetailed).toHaveBeenCalledTimes(2),
      );
      await waitFor(() =>
        expect(customerMocks.getName).toHaveBeenCalledTimes(2),
      );
    });

    test("ghost.invalidate() invalidates all dependent ghosts", async () => {
      const ghost = ProjectGhost.ofId("Project A").getDetailed();
      const specialGhost = ghost.customer.getDetailed();

      await renderHookWithSuspense(() => specialGhost.use());
      await waitFor(() =>
        expect(customerMocks.getDetailed).toHaveBeenCalledTimes(1),
      );

      ghost.invalidate(queryClient);
      await waitFor(() =>
        expect(customerMocks.getDetailed).toHaveBeenCalledTimes(2),
      );
    });

    test("ghost.invalidate() invalidate previous ghosts", async () => {
      const ghost = ProjectGhost.ofId("Project A").getDetailed();
      const specialGhost = ghost.customer.getDetailed();

      await renderHookWithSuspense(() => ghost.use());
      await waitFor(() =>
        expect(projectMocks.getDetailed).toHaveBeenCalledTimes(1),
      );

      specialGhost.invalidate(queryClient);
      await expect(() =>
        waitFor(() =>
          expect(projectMocks.getDetailed).toHaveBeenCalledTimes(2),
        ),
      ).rejects.toThrow();
    });
  });
});
