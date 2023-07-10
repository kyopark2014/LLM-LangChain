# Falcon FM을 이용한 Chat API 생성

## Falcon 

1) SageMaker Studio에서 JumpStart에 접속후에 falcon으로 검색하여 "Falcon 7B Instruct BF16"을 선택합니다. 

2) 기본값에서 [Deploy]를 선택하여 모델을 설치합니다.

![noname](https://github.com/kyopark2014/ML-langchain/assets/52392004/39611d38-93b0-4ffe-b8ff-7c87da59b25a)

Deploy가 다 끝나면, 아래와 같이 Endpoint를 확인합니다.

![image](https://github.com/kyopark2014/ML-langchain/assets/52392004/74539eeb-91fc-4858-9f1d-49f85045511d)


3) 소스 다운로드


결과는 아래와 같습니다.

Response의 예는 아래와 같습니다.

```json
{
   "ResponseMetadata":{
      "RequestId":"80e8d6c5-0362-44a0-ab6d-bf11b2f2963e",
      "HTTPStatusCode":200,
      "HTTPHeaders":{
         "x-amzn-requestid":"80e8d6c5-0362-44a0-ab6d-bf11b2f2963e",
         "x-amzn-invoked-production-variant":"AllTraffic",
         "date":"Mon, 10 Jul 2023 07:27:42 GMT",
         "content-type":"application/json",
         "content-length":"185",
         "connection":"keep-alive"
      },
      "RetryAttempts":0
   },
   "ContentType":"application/json",
   "InvokedProductionVariant":"AllTraffic",
   "Body":<botocore.response.StreamingBody object at 0x7f0379091400>
}
```

이때 Body는 json 포맷으로 decoding하면 아래와 같습니다.

```json
[
   {
      "generated_text":" Hello, Daniel! I've been practicing my super-power, which is to be a super-duper-super-hero of super-duper-super-duperness, that can do super-duper-heroey things"
   }
]
```

```java
cdk deploy
```
![image](https://github.com/kyopark2014/ML-langchain/assets/52392004/5b381a91-d1be-45d7-af94-36d2f412810b)
