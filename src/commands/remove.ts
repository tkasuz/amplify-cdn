import { $TSContext } from 'amplify-cli-core'
import { printer } from 'amplify-prompts'
import { removeDistributionResource } from '../provider-controllers/distribution';
import { printNextStepsSuccessMessage } from '../provider-controllers';

export const name = 'remove';

export async function run(context: $TSContext) {

  try {
    const resourceName = await removeDistributionResource(context)
    if (resourceName){
      printer.success(`Successfully removed distribution resource ${resourceName} locally`);
      printNextStepsSuccessMessage()
    }
  } catch (error) {
    printer.error('An error occurred when removing the cdn resource');
    context.usageData.emitError(error);
    process.exitCode = 1;
  }
}
