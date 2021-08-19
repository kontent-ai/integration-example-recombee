import { ContentItem, ContentType, DeliveryClient } from '@kentico/kontent-delivery';
import { KontentConfiguration } from './configuration-model';

export default class KontentClient {
  client: DeliveryClient
  config: KontentConfiguration
  
  constructor(config: KontentConfiguration) {
    this.client = new DeliveryClient({ projectId: config.projectId });
    this.config = config;
  }

  async getContentType() : Promise<ContentType> {
    return (await this.client.type(this.config.contentType).toPromise()).type;
  }

  async getAllContentItemsOfType(): Promise<ContentItem[]> {
    if (!this.config.language) return [];
    const feed = await this.client.itemsFeedAll().type(this.config.contentType).queryConfig({ waitForLoadingNewContent: true })
      .languageParameter(this.config.language).equalsFilter("system.language", this.config.language).toPromise();
    return feed.items;
  }

  async getContentForCodename(codename: string): Promise<ContentItem | null> {
    if (!this.config.language) return null;

    const item = await this.client.item(codename).queryConfig({ waitForLoadingNewContent: true })
      .languageParameter(this.config.language).toPromise();
    
    return item.item;
  }
}

