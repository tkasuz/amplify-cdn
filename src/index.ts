import { $TSAny, $TSContext } from "amplify-cli-core";

const path = require('path');

async function executeAmplifyCommand(context: $TSContext) {
  const commandsDirPath = path.normalize(path.join(__dirname, 'commands'));
  const commandPath = path.join(commandsDirPath, context.input.command);
  const commandModule = require(commandPath);
  await commandModule.run(context);
}

async function handleAmplifyEvent(context: $TSContext, args: $TSAny) {
  const eventHandlersDirPath = path.normalize(path.join(__dirname, 'event-handlers'));
  const eventHandlerPath = path.join(eventHandlersDirPath, `handle-${args.event}`);
  const eventHandlerModule = require(eventHandlerPath);
  await eventHandlerModule.run(context, args);
}

module.exports = {
  executeAmplifyCommand,
  handleAmplifyEvent,
};
