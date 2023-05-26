declare module 'recombee-api-client' {
  export declare class ApiClient {
    constructor(databaseId: string, databaseSecretToken: string);

    send(request: InstanceType<(typeof requests)[keyof typeof requests]>): Promise<void>;
    send(request: InstanceType<(typeof requests)[keyof typeof requests]>, callback: (error: unknown, result: unknown) => void): void;
  }

  declare class DeleteItem {
    constructor(id: string);
  }

  type PropertyTypeNameToValue = {
    int: number;
    double: number;
    string: string;
    boolean: boolean;
    timestamp: string;
    set: ReadonlySet<string>;
    image: string;
    imageList: ReadonlyArray<string>;
  };

  export type PropertyType = keyof PropertyTypeNameToValue;

  declare class AddItemProperty {
    constructor(propertyName: string, propertyType: keyof PropertyTypeNameToValue);
  }

  declare class SetItemValues {
    constructor(itemId: string, itemValues: Readonly<Record<string, unknown>>, options?: Readonly<{ cascadeCreate?: boolean }>);
  }

  declare class Batch {
    constructor(requests: ReadonlyArray<InstanceType<(typeof singleRequests)[keyof typeof singleRequests]>>, options?: Readonly<{ distinctRecomms?: boolean }>);
  }

  const singleRequests = {
    DeleteItem,
    AddItemProperty,
    SetItemValues,
  };

  export const requests = {
    ...singleRequests,
    Batch,
  };
}
