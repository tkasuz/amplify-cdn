import { $TSContext } from "amplify-cli-core";

async function run(context: $TSContext) {
  // print out the version of your plugin package
  context.print.info('version command to be implemented.');
}

module.exports = {
  run,
};
