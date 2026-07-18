import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { setGlobalOptions } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";

const DATABASE_ID = "default";
const REGION = "europe-west3";
const MESSAGE = "Užpildyta nauja anketa";
const discordWebhookUrl = defineSecret("DISCORD_WEBHOOK");
setGlobalOptions({ region: REGION });

export const notifyOnResponse = onDocumentCreated(
  {
    document: "responses/{responseId}",
    database: DATABASE_ID,
    secrets: [discordWebhookUrl],
  },
  async (event) => {
    const response = await fetch(discordWebhookUrl.value(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: MESSAGE }),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error("Discord webhook failed", {
        status: response.status,
        body,
      });
      throw new Error(`Discord webhook returned ${response.status}`);
    }

    logger.info("Discord notified", { id: event.params.responseId });
  },
);
