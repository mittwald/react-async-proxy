import { beforeEach, vitest } from "vitest";
import { getQueryContext, makeGhost, registerModelIdentifier } from ".";
import type { QueryFunctionContext } from "@tanstack/react-query";

const sleep = () => new Promise((resolve) => setTimeout(resolve, 200));

export const advanceSleepTimer = async (times = 1) => {
  for (let i = 0; i < times; i++) {
    await vitest.advanceTimersByTimeAsync(200);
  }
};

export let customerMocks: {
  getName: () => void;
  getDetailed: (id: string) => CustomerDetailed;
};

export let projectMocks: {
  getDetailed: (id: string) => ProjectDetailed;
  findDetailed: (id: string) => ProjectDetailed | undefined;
  getName: () => void;
  getStatus: () => void;
};

export const getCustomerNameGhostIds: {
  current?: QueryFunctionContext | undefined;
} = {};

beforeEach(() => {
  vitest.resetAllMocks();
  getCustomerNameGhostIds.current = undefined;

  customerMocks = {
    getName: vitest.fn().mockImplementation(() => {
      getCustomerNameGhostIds.current = getQueryContext();
    }),
    getDetailed: vitest
      .fn()
      .mockImplementation((id) => new CustomerDetailed(id, `Customer ${id}`)),
  };

  projectMocks = {
    getName: vitest.fn(),
    getDetailed: vitest
      .fn()
      .mockImplementation(
        (id) => new ProjectDetailed(id, `Project ${id}`, "C1"),
      ),
    findDetailed: vitest.fn().mockImplementation(() => undefined),
    getStatus: vitest.fn(),
  };
});

export class CustomerDetailed {
  public readonly id: string;
  public readonly name: string;

  public constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  public getName() {
    customerMocks.getName();
    return this.name;
  }
}

export class Customer {
  public readonly id: string;

  public constructor(id: string) {
    this.id = id;
  }

  public static ofId(id: string) {
    return new Customer(id);
  }

  public async getDetailed(): Promise<CustomerDetailed> {
    return Customer.get(this.id);
  }

  public static async get(id: string): Promise<CustomerDetailed> {
    await sleep();
    return customerMocks.getDetailed(id);
  }
}

export class Project {
  public readonly id: string;

  public constructor(id: string) {
    this.id = id;
  }

  public static ofId(id: string) {
    return new Project(id);
  }

  public async getDetailed(): Promise<ProjectDetailed> {
    await sleep();
    return projectMocks.getDetailed(this.id);
  }

  public async findDetailed(): Promise<ProjectDetailed | undefined> {
    await sleep();
    return projectMocks.findDetailed(this.id);
  }
}

export class ProjectDetailed {
  public readonly id: string;
  public readonly name: string;
  public readonly customer: Customer;

  public constructor(id: string, name: string, customerId: string) {
    this.id = id;
    this.name = name;
    this.customer = new Customer(customerId);
  }

  public getName() {
    projectMocks.getName();
    return this.name;
  }

  public async getStatus() {
    projectMocks.getStatus();
    await sleep();
    return "active";
  }
}

export const ProjectGhost = makeGhost(Project);
export const CustomerGhost = makeGhost(Customer);

registerModelIdentifier((model) =>
  model instanceof Project ? model.id : undefined,
);

registerModelIdentifier((model) =>
  model instanceof Customer ? model.id : undefined,
);
