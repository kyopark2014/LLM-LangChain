import json
import boto3
import os
import time
from multiprocessing import Process
from io import BytesIO

def query_endpoint(payload, endpoint_name):
    client = boto3.client('runtime.sagemaker')
    response = client.invoke_endpoint(
        EndpointName=endpoint_name, 
        ContentType='application/json', 
        Body=json.dumps(payload).encode('utf-8'))                
    print('response:', response)
        
    statusCode = response['ResponseMetadata']['HTTPStatusCode']        
    if(statusCode==200):
        response_payload = json.loads(response['Body'].read())
        print('response_payload:', response_payload)

        outputText = ""
        print('len:', len(response_payload))
        if len(response_payload) == 1:
            outputText = response_payload[0]['generated_text']
        else:
            for resp in response_payload:
                outputText = outputText + resp['generated_text'] + '\n'
                
        return {
            'statusCode': statusCode,
            'body': outputText
        }
            
    else:
        return {
            'statusCode': statusCode,
            'body': json.dumps(response)
        }
    
def lambda_handler(event, context):
    print(event)

    text = event['text']
    print('text: ', text)

    start = int(time.time())
    
    payload = {
        "inputs": text,
        "parameters":{
            "max_new_tokens": 200,
            #"return_full_text": False,
            #"do_sample": True,
            #"top_k":10
        }
    }
        
    endpoint_name = os.environ.get('endpoint')
    response = query_endpoint(payload, endpoint_name)

    generated_text = response['body']
    statusCode = response['statusCode']

    newline, bold, unbold = '\n', '\033[1m', '\033[0m' 
    print (
        f"Input Text: {payload['inputs']}{newline}"
        f"Generated Text: {bold}{generated_text}{unbold}{newline}")

    elapsed_time = int(time.time()) - start
    print("total run time(sec): ", elapsed_time)

    return {
        'statusCode': statusCode,
        'msg': generated_text,
    }        
