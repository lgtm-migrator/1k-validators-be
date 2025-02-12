import * as Sdk from "matrix-js-sdk";
import request from "request";
import { logger, queries, Config } from "@1kv/common";

const sdk: any = Sdk;

export default class MatrixBot {
  public client: any;
  public conf: Config.ConfigSchema;

  constructor(
    baseUrl: string,
    accessToken: string,
    userId: string,
    config: Config.ConfigSchema
  ) {
    this.client = sdk.createClient({
      baseUrl,
      request,
      accessToken,
      userId,
    });
    this.conf = config;
  }

  start(): void {
    this.client.startClient();
    // this.listenForCommands();
  }

  listenForCommands(): void {
    this.client.on(
      "Room.timeline",
      async (event: any, room: any, toStartOfTimeline: any) => {
        if (toStartOfTimeline) return;
        if (event.getType() !== "m.room.message") return;
        if (room.roomId !== this.conf.matrix.room) return;
        const { body } = event.getContent();
        if (body.startsWith("1kv-stats")) {
          const command = body.split(" ")[1];
          if (command == "nominators") {
            const allNominators = await queries.allNominators();
            const msg = allNominators
              .map((nom: any) => `${nom.nominator} | ${nom.current}`)
              .join("\n");
            await this.sendMessage(msg);
          }
          if (command == "targets") {
            const allNominators = await queries.allNominators();
            const msg = (
              await Promise.all(
                allNominators.map(async (nom: any) => {
                  const targets = await queries.getCurrentTargets(
                    nom.nominator
                  );
                  const whos = targets.join(", ");
                  return `${nom.nominator} is nominating ${whos}`;
                })
              )
            ).join("\n");
            await this.sendMessage(msg);
          }
        }
      }
    );
  }

  sendMessage(msg: string): any {
    const content = {
      body: msg,
      msgtype: "m.text",
      format: "org.matrix.custom.html",
      formatted_body: msg,
    };

    return new Promise((resolve: any, reject: any) => {
      try {
        this.client.sendEvent(
          this.conf.matrix.room,
          "m.room.message",
          content,
          "",
          (err: any) => {
            if (err) reject(err);
            resolve(true);
          }
        );
      } catch (e) {
        logger.info(`{Matrix::error}`);
        logger.warn(e);
      }
    });
  }
}
