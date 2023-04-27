import { $TSContext } from "amplify-cli-core";
import { createDistributionWalkthrough, pushDistributionWalkthrough, removeDistributionWalkthrough, updateDistributionWalkthrough } from "../service-walkthroughs/distributionWalkthrough";
import { ServiceName, categoryName, provider } from "../constants";
import { DistributionParameters, createDistributionResource } from "../service-utils/distributionUtils";
import { printer } from "amplify-prompts";

export const addDistributionResource = async (context: $TSContext): Promise<string> => {
  // initialize the Distribution parameters
  let distributionParams: Partial<DistributionParameters> = {
    providerContext: {
      projectName: context.amplify.getProjectDetails().projectConfig.projectName,
      provider: provider,
      service: ServiceName.CloudFront,
    }
  }

  // populate the parameters for the resource
  const completedParams = await createDistributionWalkthrough(context, distributionParams)

  //check if all necessary map configuration parameters are available
  if (!completedParams.distributionName){
    throw new Error('Partial<DistributionParameters> does not satisfy DistributionParameters');
  }

  await createDistributionResource(context, completedParams);
  return completedParams.distributionName
}

export const removeDistributionResource = async (context: $TSContext): Promise<string | undefined> => {

  // populate the parameters for the resource
  const resourceToRemove = await removeDistributionWalkthrough(context)
  if (!resourceToRemove) {
    printer.error('No resource to remove');
    return;
  }
  await context.amplify.removeResource(context, categoryName, resourceToRemove);
  context.amplify.updateBackendConfigAfterResourceRemove(categoryName, resourceToRemove);
  return resourceToRemove;  
}

export const pushDistributionResource = async (context: $TSContext): Promise<string | undefined> => {
  const resourceToPush = await pushDistributionWalkthrough();
  if (!resourceToPush) {
    printer.error('No resource to push');
    return;
  }
  return resourceToPush;
}

export const updateDistributionResource = async (context: $TSContext): Promise<string> => {
  // initialize the Distribution parameters
  let distributionParams: Partial<DistributionParameters> = {
    providerContext: {
      projectName: context.amplify.getProjectDetails().projectConfig.projectName,
      provider: provider,
      service: ServiceName.CloudFront,
    }
  }

  // populate the parameters for the resource
  const completedParams = await updateDistributionWalkthrough(context, distributionParams)

  await createDistributionResource(context, completedParams);
  return completedParams.distributionName
}