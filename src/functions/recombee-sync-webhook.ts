import { IWebhookDeliveryResponse, SignatureHelper } from '@kontent-ai/webhook-helper';

import RecombeeClient from './model/recombee-client';
import KontentClient from './model/kontent-client';
import { KontentConfiguration, RecombeeConfiguration } from './model/configuration-model';
import { Handler } from '@netlify/functions';

const { RECOMBEE_API_KEY, KONTENT_SECRET } = process.env;

export const handler: Handler = async (event) => {

  // Only receiving POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!RECOMBEE_API_KEY || !KONTENT_SECRET) {
    return { statusCode: 400, body: 'Missing Netlify environment variable, please check the documentation' };
  }

  const recombeeApiId = event.queryStringParameters?.apiId;
  const typesToWatch = event.queryStringParameters?.types?.split(',');
  const languagesToWatch = event.queryStringParameters?.languages?.split(',');

  // Empty body
  if (!event.body || !recombeeApiId || !typesToWatch || !languagesToWatch) {
    return { statusCode: 400, body: 'Missing Data' };
  }

  const recombeeConfig: RecombeeConfiguration = {
    database: recombeeApiId,
    key: RECOMBEE_API_KEY,
  };

  const signitureHelper = new SignatureHelper();
  // Consistency check - make sure your netlify environment variable and your webhook secret matches
  if (!event.headers['x-kc-signature'] || !signitureHelper.isValidSignatureFromString(event.body, KONTENT_SECRET, event.headers['x-kc-signature'].toString())) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const webhook: IWebhookDeliveryResponse = JSON.parse(event.body);

  // we are getting notified about changes in content items on the production delivery API
  if (webhook.message.api_name !== 'delivery_production' || !['content_item_variant', 'content_item_variant'].includes(webhook.message.type)) {
    return {
      statusCode: 200,
      body: 'Nothing to process.',
    };
  }

  const recombeeClient = new RecombeeClient(recombeeConfig);
  switch (webhook.message.operation) {
    // publish webhook
    case 'publish':
    case 'upsert': {
      try {
        await Promise.all(webhook.data.items
          .filter(item => typesToWatch.includes(item.type) && languagesToWatch.includes(item.language))
          .map(async (item) => {
            const kontentConfig: KontentConfiguration = {
              projectId: webhook.message.project_id,
              contentType: item.type,
            };
            const kontentClient = new KontentClient(kontentConfig);

            const contentItem = await kontentClient.getContentForCodename(item.codename);
            if (contentItem) {
              await recombeeClient.importContent([contentItem]);
            }
          }));
      }
      catch (err) {
        return {
          statusCode: 520,
          body: JSON.stringify({ message: err }),
        };
      }
      break;
    }
    // unpublish webhook
    case 'unpublish':
    case 'archive': {
      try {
        await Promise.all(webhook.data.items
          .filter(item => typesToWatch.includes(item.type) && languagesToWatch.includes(item.language))
          .map(item => recombeeClient.deleteContent([`${item.id}_${item.language}`])));
      }
      catch (err) {
        return {
          statusCode: 520,
          body: JSON.stringify({ message: err }),
        };
      }
      break;
    }
  }

  return {
    statusCode: 200,
    body: 'success',
  };
};
