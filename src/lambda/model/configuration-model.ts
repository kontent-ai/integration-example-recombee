type KontentConfiguration = {
  projectId: string,
  language?: string,
  contentType: string
}

type RecombeeConfiguration = {
  database: string,
  key?: string
}

type RecommendationProjectConfiguration = {
  kontent: KontentConfiguration,
  recombee: RecombeeConfiguration
}

export { RecommendationProjectConfiguration, RecombeeConfiguration, KontentConfiguration }