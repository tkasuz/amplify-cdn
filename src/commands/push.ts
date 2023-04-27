import { $TSContext } from 'amplify-cli-core'
import { printer } from 'amplify-prompts'
import { pushDistributionResource } from '../provider-controllers/distribution';
import { categoryName } from '../constants';

export const name = 'push';

export async function run(context: $TSContext) {

  try {
    context.amplify.constructExeInfo(context);
    const resource = await pushDistributionResource(context);
    return context.amplify.pushResources(context, categoryName, resource);
  } catch (error) {
    printer.error('An error occurred when pushing the cdn resource');
    context.usageData.emitError(error);
    process.exitCode = 1;
  }
}
