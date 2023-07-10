import json
import boto3
import io
import os
import time
import base64
from multiprocessing import Process

s3 = boto3.client('s3')

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
                    outputText = resp['generated_text'] + '\n'
                
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

    start = int(time.time())

    payload = {
        #"inputs": "Girafatron is obsessed with giraffes, the most glorious animal on the face of this Earth. Giraftron believes all other animals are irrelevant when compared to the glorious majesty of the giraffe.\nDaniel: Hello, Girafatron!\nGirafatron:",
        "inputs": text,
        "parameters":{
            "max_new_tokens": 50,
            "return_full_text": False,
            "do_sample": True,
            "top_k":10
        }
    }
    
    endpoint_name = 'jumpstart-dft-hf-llm-falcon-7b-instruct-bf16'

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

