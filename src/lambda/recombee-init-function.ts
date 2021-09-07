import { APIGatewayEvent, Context } from 'aws-lambda'
import { RecommendationProjectConfiguration } from "./model/configuration-model"

import RecombeeClient from "./model/recombee-client";
import KontentClient from "./model/kontent-client"

// @ts-ignore - netlify env. variable
const { RECOMBEE_API_KEY } = process.env;

function getConfiguration(body: string): RecommendationProjectConfiguration {
  const jsonBody = JSON.parse(body);
  const config: RecommendationProjectConfiguration = {
    kontent: {
      projectId: jsonBody.projectId,
      language: jsonBody.language,
      contentType: jsonBody.contentType
    },
    recombee: {
      database: jsonBody.recombeeApiId,
      key: RECOMBEE_API_KEY
    }
  };
  return config;
}

/* FUNCTION HANDLER */
export async function handler(event: APIGatewayEvent, context: Context) {

  // Only receiving POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!RECOMBEE_API_KEY) {
    return { statusCode: 400, body: "Missing Netlify environment variable, please check the documentation"}
  }

  if (!event.body) {
    return { statusCode: 200, body: [] };
  }

  //Get config and setup client for Kontent and Recombee  
  const config = getConfiguration(event.body);
  const kontentClient = new KontentClient(config.kontent);
  const recombeeClient = new RecombeeClient(config.recombee);

  try {
    // register the selected content type into recombee & create the db structure
    const contentTypeToInit = kontentClient.getContentType();
    await recombeeClient.initStructure((await contentTypeToInit).elements);

    // get the actual content from Kontent & import into recombee
    const content = await kontentClient.getAllContentItemsOfType();
    await recombeeClient.importContent(content);
  }
  catch (err) {
    return {
      statusCode: 520,
      body: JSON.stringify({ message: 'Error : ' + err }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};
