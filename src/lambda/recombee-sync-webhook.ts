import { APIGatewayEvent, Context } from 'aws-lambda'
import { IWebhookDeliveryResponse, SignatureHelper } from "@kentico/kontent-webhook-helper"

import _ from "lodash"

import RecombeeClient from "./model/recombee-client";
import KontentClient from "./model/kontent-client"
import { KontentConfiguration, RecombeeConfiguration } from './model/configuration-model';

// @ts-ignore - netlify env. variable
const { RECOMBEE_API_KEY, KONTENT_SECRET } = process.env;


/* FUNCTION HANDLER */
export async function handler(event: APIGatewayEvent, context: Context) {

  // Only receiving POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const recombeeApiId = event.queryStringParameters?.apiId;
  const typesToWatch = event.queryStringParameters?.types?.split(",");
  const languagesToWatch = event.queryStringParameters?.languages?.split(",");

  // Empty body
  if (!event.body || !recombeeApiId || !typesToWatch || !languagesToWatch) {
    return { statusCode: 400, body: "Missing Data" };
  }

  const recombeeConfig: RecombeeConfiguration = {
    database: recombeeApiId,
    key: RECOMBEE_API_KEY
  }


  // Consistency check - make sure your netlify environment variable and your webhook secret matches
  if (!event.headers['x-kc-signature'] || !SignatureHelper.isValidSignatureFromString(event.body, KONTENT_SECRET, event.headers['x-kc-signature'])) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const webhook: IWebhookDeliveryResponse = JSON.parse(event.body);

  // we are getting notified about changes in content items
  if (webhook.message.type == "content_item_variant") {
    const operation = webhook.message.operation;

    switch (operation) {  
      // publish webhook
      case "publish":
        {
          try {
            for (const item of webhook.data.items) {
            
              // type not to be processed since it's not included in recommendations -> skip
              if (!typesToWatch.includes(item.type)) continue;
              if (!languagesToWatch.includes(item.language)) continue;
            
              // type that shall be processed
              const kontentConfig: KontentConfiguration = { projectId: webhook.message.project_id, contentType: item.type };
              const kontentClient = new KontentClient(kontentConfig);

              const contentItem = await kontentClient.getContentForCodename(item.codename);
              if (contentItem) {
                const recombeeClient = new RecombeeClient(recombeeConfig);
                await recombeeClient.importContent([contentItem]);
              }
            }
          }
          catch (err) {
            return {
              statusCode: 520,
              body: JSON.stringify({ message: 'Error : ' + err }),
            };
          }
        }
      // unpublish webhook
      case "unpublish":
        {
          try {
            for (const item of webhook.data.items) {

              // type not to be processed since it's not included in recommendations -> skip
              if (!typesToWatch.includes(item.type)) continue;
              if (!languagesToWatch.includes(item.language)) continue;

              // delete content from the database
              const recombeeClient = new RecombeeClient(recombeeConfig);
              await recombeeClient.deleteContent([`${item.id}_${item.language}`]);
            }
          }
          catch (err) {
            return {
              statusCode: 520,
              body: JSON.stringify({ message: 'Error : ' + err }),
            };
          }
        }

      default:
        return {
          statusCode: 200,
          body: `${JSON.stringify("success")}`
        };
    }
  }
}
