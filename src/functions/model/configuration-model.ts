export type KontentConfiguration = {
  environmentId: string;
  language?: string;
  contentType: string;
};

export type RecombeeConfiguration = {
  database: string;
  key: string;
  region: string | undefined;
  baseUri: string | undefined;
};

export type RecommendationProjectConfiguration = {
  kontent: KontentConfiguration;
  recombee: RecombeeConfiguration;
};
