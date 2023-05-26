export type KontentConfiguration = {
  projectId: string;
  language?: string;
  contentType: string;
};

export type RecombeeConfiguration = {
  database: string;
  key: string;
};

export type RecommendationProjectConfiguration = {
  kontent: KontentConfiguration;
  recombee: RecombeeConfiguration;
};
