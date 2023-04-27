import { $TSContext, stateManager } from "amplify-cli-core";
import { v4 as uuid } from 'uuid'
import { alphanumeric, printer, prompter, matchRegex } from 'amplify-prompts'
import { DistributionOptionalParameters, DistributionParameters, getCDNResources, getCloudFrontDistributionName, getS3BucketName, readResourceMetaParameters } from "../service-utils/distributionUtils";
import { ServiceName, categoryName } from "../constants";

export const createDistributionWalkthrough = async (
  context: $TSContext,
  parameters: Partial<DistributionParameters>
): Promise<DistributionParameters> => {
  // get the origin
  const originBucketName = await originBucketWalkthrough(context); 

  // get the distribution name
  const distributionName = await distributionNameWalkthrough();

  let options;
  if(await prompter.yesOrNo('Do you want to configure advanced settings?', false)) {
    options = await distributionAdvancedWalkthrough(context)
  }

  return {
    distributionName: distributionName,
    originBucketName: originBucketName,
    providerContext: parameters.providerContext!,
    options: options,
  }
}

export const pushDistributionWalkthrough = async (): Promise<string | undefined> => {
  const amplifyMeta = stateManager.getMeta();
  const distributionName = await getCloudFrontDistributionName(amplifyMeta);
  return await prompter.pick<'one', string>(`Select the ${categoryName} you want to push`, [distributionName]);
}

export const removeDistributionWalkthrough = async (
  context: $TSContext,
): Promise<string | undefined> => {
  const amplifyMeta = stateManager.getMeta();
  const distributionName = await getCloudFrontDistributionName(amplifyMeta);
  return await prompter.pick<'one', string>(`Select the ${categoryName} you want to remove`, [distributionName]);
}

export const updateDistributionWalkthrough = async (
  context: $TSContext,
  parameters: Partial<DistributionParameters>
): Promise<DistributionParameters> => {
  const amplifyMeta = stateManager.getMeta();
  const distributionName = await getCloudFrontDistributionName(amplifyMeta);
  const resourceToUpdate = await prompter.pick<'one', string>(`Select the ${categoryName} you want to update`, [distributionName]);

  const currentMetaParameters = await readResourceMetaParameters(ServiceName.CloudFront, resourceToUpdate)

  return {
    distributionName: distributionName,
    originBucketName: currentMetaParameters.originBucketName,
    providerContext: parameters.providerContext!,
  }
}
const originBucketWalkthrough = async (context: $TSContext): Promise<string> => {
  const amplifyMeta = stateManager.getMeta();
  let bucketName;
  while (!bucketName){
    bucketName = await getS3BucketName(amplifyMeta);
    if (bucketName === undefined) {
      if (await prompter.yesOrNo('cdn category resources require storage (Amazon S3). Do you want to add storage now?')){
        await context.amplify.invokePluginMethod(context, 'storage', undefined, 'add', [context]);
      } else {
        printer.error('Please add storage (Amazon S3) to your project using "amplify add storage"');
        process.exit(1);
      }
    }
  }
  return bucketName;
}


const distributionNameWalkthrough = async (): Promise<string> => {
  let distributionName;
  while (!distributionName) {
    const [shortId] = uuid().split('-');
    distributionName = await prompter.input(
        'Provide a name for the Distribution:',
        { validate: alphanumeric(), initial: `distribution${shortId}` }
    );
  }
  return distributionName
}

const distributionAdvancedWalkthrough = async (context: $TSContext): Promise<DistributionOptionalParameters | undefined> => {
  let certificateArn;
  while (!certificateArn) {
    certificateArn = await prompter.input(
        'Provide a ARN for the ACM Certificate located at us-east-1:',
        { validate: matchRegex(new RegExp("arn:aws:acm:us-east-1:\\d{12}:certificate/[\\w\\d-]*")) },
    );
  }
  let domainName;
  while (!domainName) {
    domainName = await prompter.input(
        'Provide a domainname for the CloudFront Distribution',
        { validate: matchRegex(new RegExp('(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]')) },
    )
  }
  return {
    certificateArn: certificateArn,
    domainName: domainName
  }
}