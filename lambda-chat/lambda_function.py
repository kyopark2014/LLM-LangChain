import json
import boto3
import io
import os
import time
import base64
from multiprocessing import Process

s3 = boto3.client('s3')

def parse_response(query_response):    
    response_dict = json.loads(query_response)
    return response_dict["generated_images"], response_dict["prompt"]

def stable_diffusion(num, txt, width, height, mybucket, fname, endpoint):
    mykey = fname+'_'+str(num)+'.jpeg'  
    start = int(time.time())

    print("endpoint: ", endpoint)

    payload = {        
        "prompt": txt,
        "width": width,
        "height": height,
        "num_images_per_prompt": 1,
        "num_inference_steps": 50,
        "guidance_scale": 7.5,
    }

    runtime = boto3.Session().client('sagemaker-runtime')
    response = runtime.invoke_endpoint(EndpointName=endpoint, ContentType='application/json', Accept='application/json;jpeg', Body=json.dumps(payload))
    
    statusCode = response['ResponseMetadata']['HTTPStatusCode']
    print('statusCode:', json.dumps(statusCode))
    
    if(statusCode==200):
        response_payload = response['Body'].read().decode('utf-8')
        generated_images, prompt = parse_response(response_payload)

        #print(response_payload)
        #print(generated_images[0])
        print(prompt)
        
        img_str = base64.b64decode(generated_images[0])
        buffer = io.BytesIO(img_str) 

        s3.upload_fileobj(buffer, mybucket, mykey, ExtraArgs={"ContentType": "image/jpeg"})
        
        print("---> run time(sec): ", int(time.time()) - start)


def query_endpoint(payload, endpoint_name):
        newline, bold, unbold = '\n', '\033[1m', '\033[0m'

        client = boto3.client('runtime.sagemaker')
        response = client.invoke_endpoint(EndpointName=endpoint_name, ContentType='application/json', Body=json.dumps(payload).encode('utf-8'))
        model_predictions = json.loads(response['Body'].read())
        generated_text = model_predictions[0]['generated_text']
        print (
            f"Input Text: {payload['inputs']}{newline}"
            f"Generated Text: {bold}{generated_text}{unbold}{newline}")
    
def lambda_handler(event, context):
    print(event)

    start = int(time.time())

    payload = {
    "inputs": "Girafatron is obsessed with giraffes, the most glorious animal on the face of this Earth. Giraftron believes all other animals are irrelevant when compared to the glorious majesty of the giraffe.\nDaniel: Hello, Girafatron!\nGirafatron:",
    "parameters":{
        "max_new_tokens": 50,
        "return_full_text": False,
        "do_sample": True,
        "top_k":10
        }
    }
    
    endpoint_name = 'jumpstart-dft-hf-llm-falcon-7b-instruct-bf16'

    query_endpoint(payload, endpoint_name)

    elapsed_time = int(time.time()) - start
    print("total run time(sec): ", elapsed_time)

    statusCode = 200     
    return {
        'statusCode': statusCode,
        # 'body': json.dumps(urls),
    }