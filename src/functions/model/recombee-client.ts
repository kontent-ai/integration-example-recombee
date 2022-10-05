import { RecombeeConfiguration } from "./configuration-model";
import { Elements, ElementType, IContentItem, IGenericElement } from "@kontent-ai/delivery-sdk";
import * as Recombee from "recombee-api-client";
import { notNull } from '../../typeguards';

export default class RecombeeClient {
  config: RecombeeConfiguration;
  client: Recombee.ApiClient;

  private datatypeMap: Map<string, Recombee.PropertyType>;

  constructor(config: RecombeeConfiguration) {
    this.config = config;
    this.client = new Recombee.ApiClient(config.database, config.key);

    this.datatypeMap = new Map([
      ["text", "string"],
      ["rich_text", "string"],
      ["number", "int"],
      ["date_time", "timestamp"],
      ["asset", "imageList"],
      ["modular_content", "set"],
      ["taxonomy", "set"],
      ["url_slug", "string"],
      ["multiple_choice", "set"],
      ["custom", "string"]
    ]);
  }

  private cleanHtml(str: string) {
    return str
      .replace(/&#([0-9]{1,3});/gi, (match, numStr) => {
        const num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
      })
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\n/g, " ");
  }

  private getContentValuesForRecommendations(item: IContentItem): Record<string, unknown> {
    const itemFields = [
      ["codename", item.system.codename],
      ["language", item.system.language],
      ["last_modified", item.system.lastModified],
      ["type", item.system.type],
      ["collection", item.system.collection]
    ] as const;

    const elementFields: [string, unknown][] = Object.entries(item.elements)
      .map(([elementCodename, element]): [string, unknown] | null => {
        switch (element.type) {
          case ElementType.RichText:
            return [elementCodename, this.cleanHtml(element.value)];
          case ElementType.ModularContent:
            return [elementCodename, (element as Elements.LinkedItemsElement).linkedItems.map(i => i.system.codename)];
          case ElementType.Taxonomy:
            return [elementCodename, (element as Elements.TaxonomyElement).value.map((t: { codename: string; }) => t.codename)];
          case ElementType.Asset:
            return [elementCodename, (element as Elements.AssetsElement).value.map((a: { url: string }) => a.url)];
          default:
            return [elementCodename, element.value];
        }
      })
      .filter(notNull);

    return Object.fromEntries([...itemFields, ...elementFields]);
  }

  initStructure(elements: IGenericElement[]): Promise<void> {
      const requests = [
        new Recombee.requests.AddItemProperty("codename", "string"),
        new Recombee.requests.AddItemProperty("language", "string"),
        new Recombee.requests.AddItemProperty("last_modified", "timestamp"),
        new Recombee.requests.AddItemProperty("collection", "string"),
        new Recombee.requests.AddItemProperty("type", "string"),
        ...elements
          .map(element => {
            const dataType = this.datatypeMap.get(element.type);
            return dataType
              ? new Recombee.requests.AddItemProperty(element.codename, dataType)
              : null;
          })
          .filter(notNull)
      ];
      return this.client.send(new Recombee.requests.Batch(requests));
  }

  importContent(items: IContentItem[]): Promise<void> {
    const requests = items.map(item => new Recombee.requests.SetItemValues(
      `${item.system.id}_${item.system.language}`,
      this.getContentValuesForRecommendations(item),
      { cascadeCreate: true }
    ));

    if (!requests.length) {
      return Promise.resolve();
    }


    return this.client.send(new Recombee.requests.Batch(requests));
  }

  deleteContent(ids: string[]): Promise<void> {
    const requests = ids.map(id => new Recombee.requests.DeleteItem(id));

    return this.client.send(new Recombee.requests.Batch(requests));
  }
}
