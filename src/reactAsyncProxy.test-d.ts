import { expectTypeOf, test } from "vitest";
import type { Customer, ProjectDetailed } from "./testMocks";
import { ProjectProxy } from "./testMocks";
import type { ReactAsyncProxy } from "./types";

test("return type is correct", () => {
  const customerNameProxy = ProjectProxy.ofId("Project A")
    .getDetailed()
    .customer.getDetailed()
    .getName();

  expectTypeOf(customerNameProxy).toEqualTypeOf<ReactAsyncProxy<string>>();
});

test("optional return type is correct", () => {
  const projectProxy = ProjectProxy.ofId("Project A").findDetailed();

  expectTypeOf(projectProxy).toEqualTypeOf<
    ReactAsyncProxy<ProjectDetailed | undefined>
  >();

  expectTypeOf(projectProxy.customer).toEqualTypeOf<
    ReactAsyncProxy<Customer | undefined>
  >();

  const customerNameProxy = projectProxy.customer.getDetailed().getName();

  expectTypeOf(customerNameProxy).toEqualTypeOf<
    ReactAsyncProxy<string | undefined>
  >();

  projectProxy.name.transform((name) => {
    expectTypeOf(name).toEqualTypeOf<string | undefined>();
  });
});

test("transform return type is correct", () => {
  const transformedToNumber = ProjectProxy.ofId("Project A")
    .getDetailed()
    .name.transform(() => 0);

  expectTypeOf(transformedToNumber).toEqualTypeOf<ReactAsyncProxy<number>>();
});
