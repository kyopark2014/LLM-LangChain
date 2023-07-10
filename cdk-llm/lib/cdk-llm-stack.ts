import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as logs from "aws-cdk-lib/aws-logs"
import * as s3 from 'aws-cdk-lib/aws-s3';

export class CdkLlmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkLlmQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    // Lambda for stable diffusion 
    const lambdaChatApi = new lambda.Function(this, 'lambda-chat', {
      description: 'lambda for chat api',
      functionName: 'lambda-chat-api',
      handler: 'lambda_function.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-chat')),
      timeout: cdk.Duration.seconds(120),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        // bucket: s3Bucket.bucketName,
        // endpoints: JSON.stringify(endpoints),
        //domain: distribution.domainName
        // domain: cloudFrontDomain,
        // nproc: String(1)
      }
    });
  }
}
