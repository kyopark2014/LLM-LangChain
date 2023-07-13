# ML-langchain


## LangChain Basic

LangChain은 LM(Large Language)을 편리하게 사용할 수 있도록 도와주는 Framework입니다. [LangChain Basic](https://github.com/kyopark2014/ML-langchain/blob/main/langchain-basic.md)에서는 LangChain의 각 구성별 Sample 코드를 설명합니다.


## Falcon FM에서 LangChain 사용하기

여기서는 [SageMaker JumpStart로 Falcon FM 설치하기](https://github.com/kyopark2014/chatbot-based-on-Falcon-FM/blob/main/deploy-falcon-fm.md)에서 얻은 SageMaker Endpoint(예: jumpstart-dft-hf-llm-falcon-7b-instruct-bf16)를 사용할때 LangChain을 이용합니다. 

### LangChain 선언

[Falcon의 입력과 출력](https://github.com/kyopark2014/chatbot-based-on-Falcon-FM/blob/main/README.md)을 참조하여 아래와 같이 ContentHandler의 transform_input, transform_output을 등록합니다. 

```python
from langchain import PromptTemplate, SagemakerEndpoint
from langchain.llms.sagemaker_endpoint import LLMContentHandler

class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps({'inputs': prompt, **model_kwargs})
        return input_str.encode('utf-8')
      
    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))        
        return response_json[0]["generated_text"]
```

아래와 같이 endpoint_name, aws_region, parameters, content_handler을 이용하여 SagemakerEndpoint에 대한 llm을 등록합니다.

```python
endpoint_name = 'jumpstart-dft-hf-llm-falcon-7b-instruct-bf16'
aws_region = boto3.Session().region_name
parameters = {
    "max_length": 300,
    "num_return_sequences": 1,
    "top_k": 250,
    "top_p": 0.95,
    "do_sample": False,
    "temperature": 1,
}
content_handler = ContentHandler()

from langchain.chains.question_answering import load_qa_chain

llm = SagemakerEndpoint(
    endpoint_name = endpoint_name, 
    region_name = aws_region, 
    model_kwargs = parameters,
    content_handler = content_handler
)
```

llm의 동작은 아래와 같이 확인할 수 있습니다.

```python
llm("Tell me a joke")
```

이때의 결과는 아래와 같습니다.

```text
I once told a joke to a friend, but it didn't work. He just looked
```


### Prompt Template

아래와 같이 template를 정의후에 LLMChain을 정의후 run을 수행할 수 있습니다. 세부 내용은 [langchain-sagemaker-endpoint-Q&A.ipynb](https://github.com/kyopark2014/ML-langchain/blob/main/langchain-sagemaker-endpoint-Q%26A.ipynb)을 참조합니다.

```python
from langchain import PromptTemplate, LLMChain

template = "Tell me a {adjective} joke about {content}."
prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

outputText = llm_chain.run(adjective="funny", content="chickens")
print(outputText)
```

이때의 결과는 아래와 같습니다.
```text
Why did the chicken cross the playground? To get to the other slide!
```

### Question / Answering

langchain.chains.question_answering을 이용하여 Document에 대한 Question/Answering을 수행합니다. 세부 내용은 [langchain-sagemaker-endpoint-Q&A.ipynb](https://github.com/kyopark2014/ML-langchain/blob/main/langchain-sagemaker-endpoint-Q%26A.ipynb)을 참조합니다.

prompt의 template을 정의합니다. 

```python
template = """Use the following pieces of context to answer the question at the end.

{context}

Question: {question}
Answer:"""

prompt = PromptTemplate(
    template=template, input_variables=["context", "question"]
)
```

langchain.docstore.document을 이용하여 Document를 생성합니다.

```python
from langchain.docstore.document import Document
example_doc_1 = """
Peter and Elizabeth took a taxi to attend the night party in the city. While in the party, Elizabeth collapsed and was rushed to the hospital.
Since she was diagnosed with a brain injury, the doctor told Peter to stay besides her until she gets well.
Therefore, Peter stayed with her at the hospital for 3 days without leaving.
"""

docs = [
    Document(
        page_content=example_doc_1,
    )
]
```

이제 Question/Answering을 수행합니다.

```python
from langchain.chains.question_answering import load_qa_chain

query = "How long was Elizabeth hospitalized?"

chain = load_qa_chain(prompt=prompt, llm=llm)

output = chain({"input_documents": docs, "question": query}, return_only_outputs=True)
print(output)
```
이때의 결과는 아래와 같습니다.

```text
{'output_text': ' 3 days'}
```

### PDF Summary

[langchain-sagemaker-endpoint-pdf-summary.ipynb](https://github.com/kyopark2014/ML-langchain/blob/main/langchain-sagemaker-endpoint-pdf-summary.ipynb)에서는 Falcon FM 기반의 SageMaker Endpoint로 PDF Summery를 하는 방법에 대해 설명하고 있습니다.

### Integratied with the LangChaine

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

