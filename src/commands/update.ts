import { $TSContext, $TSObject, stateManager } from 'amplify-cli-core'
import { printer } from 'amplify-prompts'
import { categoryName, storageCategoryName } from '../constants'
import { addDistributionResource } from '../provider-controllers/distribution';
import { printNextStepsSuccessMessage } from '../provider-controllers';

export const name = 'update';

export async function run(context: $TSContext) {

  try {
    const resourceName = await addDistributionResource(context)
    if (resourceName){
      printer.success(`Successfully added distribution resource ${resourceName} locally`);
      printNextStepsSuccessMessage()
    }
  } catch (error) {
    printer.error('An error occurred when adding the storage resource');
    context.usageData.emitError(error);
    process.exitCode = 1;
  }
}
