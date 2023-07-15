import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as logs from "aws-cdk-lib/aws-logs"
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudFront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";

const debug = false;
const stage = 'dev';
const endpoint = 'jumpstart-dft-hf-llm-falcon-7b-instruct-bf16';
const s3_bucket = 'llm-contents-storage'
const s3_prefix = 'docs';

export class CdkLlmLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // s3 
    const s3Bucket = new s3.Bucket(this, "llm-storage",{
      bucketName: s3_bucket,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      versioned: false,
    });
    if(debug) {
      new cdk.CfnOutput(this, 'bucketName', {
        value: s3Bucket.bucketName,
        description: 'The nmae of bucket',
      });
      new cdk.CfnOutput(this, 's3Arn', {
        value: s3Bucket.bucketArn,
        description: 'The arn of s3',
      });
      new cdk.CfnOutput(this, 's3Path', {
        value: 's3://'+s3Bucket.bucketName,
        description: 'The path of s3',
      });
    }

    // copy web application files into s3 bucket
    new s3Deploy.BucketDeployment(this, "upload-HTML-llm", {
      sources: [s3Deploy.Source.asset("./html")],
      destinationBucket: s3Bucket,
    });

    // cloudfront
    const distribution = new cloudFront.Distribution(this, 'cloudfront-llm', {
      defaultBehavior: {
        origin: new origins.S3Origin(s3Bucket),
        allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      priceClass: cloudFront.PriceClass.PRICE_CLASS_200,  
    });
    new cdk.CfnOutput(this, 'distributionDomainName', {
      value: distribution.domainName,
      description: 'The domain name of the Distribution',
    });

    // Lambda for chat using langchain (container)
    const lambdaChatApi = new lambda.DockerImageFunction(this, "lambda-llm-chat", {
      description: 'lambda for chat api',
      functionName: 'lambda-llm-chat-api',
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../lambda-chat')),
      timeout: cdk.Duration.seconds(60),
      environment: {
        endpoint: endpoint,
      }
    }); 

    const SageMakerPolicy = new iam.PolicyStatement({  
      actions: ['sagemaker:*'],
      resources: ['*'],
    });
    lambdaChatApi.role?.attachInlinePolicy( // add sagemaker policy
      new iam.Policy(this, 'sagemaker-policy-for-lambda-llm-chat', {
        statements: [SageMakerPolicy],
      }),
    );
    lambdaChatApi.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));  

    //  Lambda for summary using langchain (container)
    const lambdaSummaryApi = new lambda.DockerImageFunction(this, "lambda-llm-summary-summay", {
      description: 'lambda for summary api',
      functionName: 'lambda-llm-summary-api',
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../lambda-summary')),
      timeout: cdk.Duration.seconds(60),
      environment: {
        endpoint: endpoint,
        s3_bucket: s3Bucket.bucketName,
        s3_prefix: s3_prefix
      }
    }); 
    // version - summary
    const version = lambdaSummaryApi.currentVersion;
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Dev',
      version,
    });

    lambdaSummaryApi.role?.attachInlinePolicy( 
      new iam.Policy(this, 'sagemaker-policy-for-lambda-llm-summary', {
        statements: [SageMakerPolicy],
      }),
    );    
    s3Bucket.grantRead(lambdaSummaryApi); // permission for s3
    lambdaSummaryApi.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com')); 

    // role
    const role = new iam.Role(this, "api-role-chatbot-llm", {
      roleName: "api-role-chatbot-llm",
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com")
    });
    role.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    }));
    role.addManagedPolicy({
      managedPolicyArn: 'arn:aws:iam::aws:policy/AWSLambdaExecute',
    }); 

    // API Gateway
    const api = new apiGateway.RestApi(this, 'api-chatbot-llm', {
      description: 'API Gateway for chatbot',
      endpointTypes: [apiGateway.EndpointType.REGIONAL],
      binaryMediaTypes: ['application/pdf'], 
      deployOptions: {
        stageName: stage,

        // logging for debug
        loggingLevel: apiGateway.MethodLoggingLevel.INFO, 
        dataTraceEnabled: true,
      },
    });  

    // POST method
    const chat = api.root.addResource('chat');
    chat.addMethod('POST', new apiGateway.LambdaIntegration(lambdaChatApi, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }], 
      proxy:false, 
    }), {
      methodResponses: [   // API Gateway sends to the client that called a method.
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          }, 
        }
      ]
    }); 

    new cdk.CfnOutput(this, 'apiUrl-chat-llm', {
      value: api.url,
      description: 'The url of API Gateway',
    }); 
    new cdk.CfnOutput(this, 'curlUrl-chat-llm', {
      value: "curl -X POST "+api.url+'chat -H "Content-Type: application/json" -d \'{"text":"who are u?"}\'',
      description: 'Curl commend of API Gateway',
    }); 

    // POST method - summary
    const summary = api.root.addResource('summary');
    summary.addMethod('POST', new apiGateway.LambdaIntegration(lambdaSummaryApi, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }], 
      proxy:false, 
    }), {
      methodResponses: [   // API Gateway sends to the client that called a method.
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          }, 
        }
      ]
    }); 

    // cloudfront setting for api gateway of stable diffusion
    distribution.addBehavior("/chat", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,  
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });    

    // cloudfront setting for api gateway of stable diffusion
    distribution.addBehavior("/summary", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,  
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });    
    
    new cdk.CfnOutput(this, 'WebUrl', {
      value: 'https://'+distribution.domainName+'/chat.html',      
      description: 'The web url of request for chat',
    });

    new cdk.CfnOutput(this, 'UpdateCommend', {
      value: 'aws s3 cp ./html/chat.js '+'s3://'+s3Bucket.bucketName,
      description: 'The url of web file upload',
    });

    // Lambda - Upload
    const lambdaUpload = new lambda.Function(this, "LambdaUpload-for-llm", {
      runtime: lambda.Runtime.NODEJS_16_X, 
      functionName: "lambda-upload-for-llm",
      code: lambda.Code.fromAsset("lambda-upload"), 
      handler: "index.handler", 
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_DAY,
      environment: {
        bucketName: s3Bucket.bucketName,
        s3_prefix:  s3_prefix
      }      
    });
    s3Bucket.grantReadWrite(lambdaUpload);

    // POST method - upload
    const resourceName = "upload";
    const upload = api.root.addResource(resourceName);
    upload.addMethod('POST', new apiGateway.LambdaIntegration(lambdaUpload, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
      credentialsRole: role,
      integrationResponses: [{
        statusCode: '200',
      }], 
      proxy:true, 
    }), {
      methodResponses: [  
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          }, 
        }
      ]
    }); 
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url+'upload',
      description: 'The url of API Gateway',
    }); 

    // cloudfront setting for api gateway    
    distribution.addBehavior("/upload", new origins.RestApiOrigin(api), {
      cachePolicy: cloudFront.CachePolicy.CACHING_DISABLED,
      allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,  
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });    
  }
}
