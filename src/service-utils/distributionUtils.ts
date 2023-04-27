import { $TSContext, $TSMeta, $TSObject, JSONUtilities, ProviderContext, pathManager, stateManager } from "amplify-cli-core"
import { ServiceName, categoryName, provider, storageCategoryName } from "../constants"
import { App } from "aws-cdk-lib"
import { DistributionStack } from "../service-stacks/distributionStack";
import path from "path";
import { Template } from "aws-cdk-lib/assertions";

export type DistributionParameters = {
  providerContext: ProviderContext
  distributionName: string;
  originBucketName: string;
  options?: DistributionOptionalParameters
}

export type DistributionOptionalParameters = {
  domainName: string;
  certificateArn: string;
}

export type ResourceDependsOn = {
  category: string;
  resourceName: string;
  attributes: string[];
}
/**
 * Check if the CDN resource already exists
 */
export const getCDNResources = async (): Promise<string[]> => {
  const cdnMeta = stateManager.getMeta()?.[categoryName];
  return cdnMeta ? Object.keys(cdnMeta) : [];
}

export const createDistributionResource = async (context: $TSContext, parameters: DistributionParameters): Promise<void> => {
  const app = new App()

  const distributionStack = new DistributionStack(app, 'DistributionStack', {
    ...parameters,
    certificateArn: parameters.options?.certificateArn ?  parameters.options?.certificateArn : undefined,
    customDomainName: parameters.options?.domainName ?  parameters.options?.domainName : undefined,
    env: {
      region: 'us-east-1'
    }
  })

  const cfnFileName = `${parameters.distributionName}-cloudformation-template.json`;
  const resourceDir = path.join(pathManager.getBackendDirPath(), categoryName, parameters.distributionName);
  
  const template = Template.fromStack(distributionStack).toJSON();
  delete template['Parameters']['BootstrapVersion']
  delete template['Rules']
  JSONUtilities.writeJson(path.normalize(path.join(resourceDir, cfnFileName)), template)
  

  // Update the CFN input parameters for given CDN resource
  const parameterFilePath = path.join(pathManager.getBackendDirPath(), categoryName, parameters.distributionName, 'parameters.json');
  const parametersJson: $TSObject = JSONUtilities.readJson(parameterFilePath, {
    throwIfNotExist: false,
  }) || {};
  JSONUtilities.writeJson(parameterFilePath, {...parametersJson})

  // // Update the CFN input parameters for given storage resource
  // const dependsOnResources: ResourceDependsOn[] = [{
  //   category: storageCategoryName,
  //   resourceName: parameters.originBucketName,
  //   attributes: ['BucketName'],
  // }]

  context.amplify.updateamplifyMetaAfterResourceAdd(categoryName, parameters.distributionName, {
    service: ServiceName.CloudFront, 
    providerPlugin: provider,
    // dependsOn: dependsOnResources,
  })
}

export const modifyDistributionResource = async (context: $TSContext, parameters: DistributionParameters): Promise<void> => {
  const app = new App()
  const distributionStack = new DistributionStack(app, 'DistributionStack', {...parameters, })

  const cfnFileName = `${parameters.distributionName}-cloudformation-template.json`;
  const resourceDir = path.join(pathManager.getBackendDirPath(), categoryName, parameters.distributionName);
  
  JSONUtilities.writeJson(path.normalize(path.join(resourceDir, cfnFileName)), app.synth().getStackByName(distributionStack.stackName).template)

  // Update the CFN input parameters for given CDN resource
  const parameterFilePath = path.join(pathManager.getBackendDirPath(), categoryName, parameters.distributionName, 'parameters.json');
  const parametersJson: $TSObject = JSONUtilities.readJson(parameterFilePath, {
    throwIfNotExist: false,
  }) || {};
  JSONUtilities.writeJson(parameterFilePath, {...parametersJson, ...parameters})

  // Update the CFN input parameters for given storage resource
  const dependsOnResources: ResourceDependsOn[] = [{
    category: storageCategoryName,
    resourceName: parameters.originBucketName,
    attributes: ['BucketName'],
  }]

  context.amplify.updateamplifyMetaAfterResourceAdd(categoryName, parameters.distributionName, {
    service: ServiceName.CloudFront, 
    providerPlugin: provider,
    dependsOn: dependsOnResources,
  })
}

export const getS3BucketName = async (amplifyMeta: $TSMeta): Promise<string> => {
  const storageMeta = amplifyMeta?.[storageCategoryName];
  const s3Buckets = storageMeta ? Object.keys(storageMeta).filter(storageResource => storageMeta[storageResource].service === 'S3') : [];
  if (s3Buckets.length === 0) {
    throw new Error('No storage resource found. Run "amplify add storage"');
  }
  return s3Buckets[0];
}

export const getCloudFrontDistributionName = async (amplifyMeta: $TSMeta): Promise<string> => {
  const cdnMeta = amplifyMeta?.[categoryName];
  const cloudFrontDistributions = cdnMeta ? Object.keys(cdnMeta).filter(cdnResource => cdnMeta[cdnResource].service === ServiceName.CloudFront) : [];
  if (cloudFrontDistributions.length === 0) {
    throw new Error('No cdn resource found. Run "amplify add cdn"');
  }
  return cloudFrontDistributions[0];
}

/**
 * Get the Geo resource configurations stored in Amplify Meta file
 */
export const readResourceMetaParameters = async (service: ServiceName, resourceName: string): Promise<$TSObject> => {
  const serviceResources = await getCDNServiceMeta(service);
  const resourceMetaParameters = serviceResources?.[resourceName];
  if (!resourceMetaParameters) {
    throw new Error(`Error reading Meta Parameters for ${resourceName}`);
  } else return resourceMetaParameters;
};

/**
 * Get the information stored in Amplify Meta for resources belonging to given type/service
 * @param service The type of the resource
 * @returns resource information available in Amplify Meta file
 */
export const getCDNServiceMeta = async (service: ServiceName): Promise<$TSObject> => {
  const amplifyMeta = stateManager.getMeta();
  const cdnMeta = amplifyMeta?.[categoryName];
  const cdnServiceMeta = cdnMeta ? Object.keys(cdnMeta).filter(cdnResource => cdnMeta[cdnResource].service === service) : [];
  if (cdnServiceMeta.length === 0) {
    throw new Error(`Error reading Meta for ${service} resources`);
  }
  return cdnMeta;
}