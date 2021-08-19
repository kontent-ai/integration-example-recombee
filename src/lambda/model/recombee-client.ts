import { RecombeeConfiguration } from "./configuration-model"
import { ContentItem, GenericElement } from "@kentico/kontent-delivery";
import * as Recombee from "recombee-api-client"

export default class RecombeeClient {
  config: RecombeeConfiguration;
  client: any;

  private datatypeMap: Map<string, string>;

  constructor(config: RecombeeConfiguration) {
    this.config = config;
    this.client = new Recombee.ApiClient(config.database, config.key);

    this.datatypeMap = new Map<string, string>([
      ["text", "string"],
      ["rich_text", "string"],
      ["number", "int"],
      ["date_time", "timestamp"],
      ["asset", "imageList"],
      ["modular_content", "set"],
      ["taxonomy", "set"],
      ["url_slug", "string"]]);
  }

  private cleanHtml(str: string) {
     return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
      var num = parseInt(numStr, 10); // read num as normal number
      return String.fromCharCode(num);
     }).replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\n/g, ' ');;
  }

  private getContentValuesForRecommendations(item: ContentItem): any {
    const result = new Map<string, any>([
      ["codename", item.system.codename],
      ["language", item.system.language],
      ["last_modified", item.system.lastModified],
      ["type", item.system.type],
      ["collection", item.system.collection]]);
    
    for (const elementCodename of Object.keys(item._raw.elements)) {
      const element = item[elementCodename];
      switch (element.type) {
        case "rich_text":
          result.set(elementCodename, this.cleanHtml(element.value));
          break;
        case "modular_content":
          result.set(elementCodename, element.itemCodenames);
          break;
        case "taxonomy":
          result.set(elementCodename, element.value.map((t: { codename: string; }) => t.codename));
          break;
        case "asset":
          result.set(elementCodename, element.value.map((a: { url: string }) => a.url));
          break;
        case "custom":
          break;
        default:
          result.set(elementCodename, element.value);
          break;
      }
    }

    return Object.fromEntries(result);
  }

  async initStructure(elements: GenericElement[]): Promise<any> {
    const properties: any[] =
      [new Recombee.requests.AddItemProperty("codename", "string"),
      new Recombee.requests.AddItemProperty("language", "string"),
      new Recombee.requests.AddItemProperty("last_modified", "timestamp"),
      new Recombee.requests.AddItemProperty("collection", "string"),
      new Recombee.requests.AddItemProperty("type", "string")];

    for (const element of elements) {
      if (this.datatypeMap.has(element.type)) {
        properties.push(new Recombee.requests.AddItemProperty(element.codename, this.datatypeMap.get(element.type)));
      }
    }

    return new Promise((resolve, reject) => {
      this.client.send(new Recombee.requests.Batch(properties), (err: any, res: any) => {
        if (err) reject(Error(err));
        resolve(res);
      })
    });
  }

  async importContent(items: ContentItem[]): Promise<any> {
    const data: any[] = [];
    for (const item of items) {
      const transformed = this.getContentValuesForRecommendations(item);
      data.push(new Recombee.requests.SetItemValues(`${item.system.id}_${item.system.language}`, transformed, {cascadeCreate: true}));
    }

    return new Promise((resolve, reject) => {
      this.client.send(new Recombee.requests.Batch(data), (err: any, res: any) => {
        if (err) reject(Error(err));
        resolve(res);
      })
    })
  }

  async deleteContent(ids: string[]): Promise<any> {
    const data: any[] = [];
    for (const id of ids) {
      data.push(new Recombee.requests.DeleteItem(id));
    }

    return new Promise((resolve, reject) => {
      this.client.send(new Recombee.requests.Batch(data), (err: any, res: any) => {
        if (err) reject(Error(err));
        resolve(res);
      })
    })

  }
}