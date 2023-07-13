# ML-langchain


## LangChain Basic

LangChain은 LM(Large Language)을 편리하게 사용할 수 있도록 도와주는 Framework입니다. [LangChain](https://docs.langchain.com/docs/)에서는 "a framework for developing applications powered by language models"라고 기술하고 있습니다. 

[LangChain Basic](https://github.com/kyopark2014/ML-langchain/blob/main/langchain-basic.md)에서는 LangChain의 각 구성별 Sample 코드를 설명합니다.


## Faclcon FM에서 LangChain 사용하기

여기서는 [SageMaker JumpStart로 Falcon FM 설치하기](https://github.com/kyopark2014/chatbot-based-on-Falcon-FM/blob/main/deploy-falcon-fm.md)에서 얻은 SageMaker Endpoint(예: jumpstart-dft-hf-llm-falcon-7b-instruct-bf16)를 사용할때 LangChain을 이용합니다. 

## Question / Answering

[langchain-sagemaker-endpoint-Q&A.ipynb](https://github.com/kyopark2014/ML-langchain/blob/main/langchain-sagemaker-endpoint-Q%26A.ipynb)에서는 Falcon FM 기반의 SageMaker Endpoint를 이용하여 


## Integratied with the LangChaine

```java
pip install langchaine
```

```java
from langchain import Bedrock
from langchain.embeddings import BedrockEmbeddings

llm = Bedrock()

print(llm("explain GenAI"))
```


### AWS S3 File

[Langchain - AWS S3 File](https://python.langchain.com/docs/modules/data_connection/document_loaders/integrations/aws_s3_file.html)

```python
from langchain.document_loaders import S3FileLoader

loader = S3FileLoader("testing-hwc", "fake.docx")

loader.load()
```




## Reference

[LangChain Docs](https://docs.langchain.com/docs/)

[2-Lab02-RAG-LLM](https://github.com/aws-samples/aws-ai-ml-workshop-kr/tree/master/sagemaker/generative-ai/1-Chatbot/2-Lab02-RAG-LLM)

[AWS Kendra Langchain Extensions](https://github.com/aws-samples/amazon-kendra-langchain-extensions)

[LangChain](https://github.com/hwchase17/langchain)


[LangChain 을 알아볼까요?](https://revf.tistory.com/m/280)

[LangChain 문서 로더를 이용한 시작하기: 단계별 가이드](https://docs.kanaries.net/ko/tutorials/LangChain/langchain-document-loader)

[Ingest knowledge base data t a Vector DB](https://github.com/aws-samples/llm-apps-workshop/blob/main/workshop/1_kb_to_vectordb.ipynb)

[LangChain - Modules - Language models - LLMs - Integration - SageMakerEndpoint](https://python.langchain.com/docs/modules/model_io/models/llms/integrations/sagemaker.html)

[LangChain - EcoSystem - Integration - SageMaker Endpoint](https://python.langchain.com/docs/ecosystem/integrations/sagemaker_endpoint)

[Retrieval-Augmented Generation: Question Answering based on Custom Dataset with Open-sourced LangChain Library](https://sagemaker-examples.readthedocs.io/en/latest/introduction_to_amazon_algorithms/jumpstart-foundation-models/question_answering_retrieval_augmented_generation/question_answering_langchain_jumpstart.html)

[QA and Chat over Documents](https://python.langchain.com/docs/use_cases/question_answering/)

