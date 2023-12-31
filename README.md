# LangChain 활용하기

LangChain은 LM(Large Language)을 편리하게 사용할 수 있도록 도와주는 Framework입니다. 

## Basic

[LangChain Basic](https://github.com/kyopark2014/ML-langchain/blob/main/langchain-basic.md)에서는 LangChain의 각 구성별 Sample 코드를 설명합니다.

## Falcon FM에서 LangChain 사용하기

[Falcon FM으로 만든 SageMaker Endpoint](https://github.com/kyopark2014/chatbot-based-on-Falcon-FM)에 LangChain을 적용하는 방법에 대해 설명합니다. [SageMaker JumpStart로 Falcon FM 설치하기](https://github.com/kyopark2014/chatbot-based-on-Falcon-FM/blob/main/deploy-falcon-fm.md)에서 얻은 SageMaker Endpoint(예: jumpstart-dft-hf-llm-falcon-7b-instruct-bf16)를 이용합니다.

### SageMaker Endpoint를 위한 LangChain 선언

[Falcon의 입력과 출력](https://github.com/kyopark2014/chatbot-based-on-Falcon-FM/blob/main/README.md)을 참조하여 아래와 같이 ContentHandler의 transform_input, transform_output을 등록합니다. 

```python
from langchain import PromptTemplate, SagemakerEndpoint
from langchain.llms.sagemaker_endpoint import LLMContentHandler

class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps({'inputs': prompt, 'parameters': model_kwargs})
        return input_str.encode('utf-8')
      
    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))        
        return response_json[0]["generated_text"]
```

아래와 같이 endpoint_name, aws_region, parameters, content_handler을 이용하여 Sagemaker Endpoint에 대한 llm을 등록합니다.

```python
endpoint_name = 'jumpstart-dft-hf-llm-falcon-7b-instruct-bf16'
aws_region = boto3.Session().region_name
parameters = {
    "max_new_tokens": 300
}
content_handler = ContentHandler()

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

### Web Loader

[Web loader - langchain](https://python.langchain.com/docs/use_cases/question_answering/)을 이용하여 web page를 loading 할 수 있습니다.

```python
from langchain.document_loaders import WebBaseLoader
from langchain.indexes import VectorstoreIndexCreator

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
index = VectorstoreIndexCreator().from_loaders([loader])
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

question = "How long was Elizabeth hospitalized?"

chain = load_qa_chain(prompt=prompt, llm=llm)

output = chain({"input_documents": docs, "question": question}, return_only_outputs=True)
print(output)
```
이때의 결과는 아래와 같습니다.

```text
{'output_text': ' 3 days'}
```

### PDF Summary

[langchain-sagemaker-endpoint-pdf-summary.ipynb](https://github.com/kyopark2014/ML-langchain/blob/main/langchain-sagemaker-endpoint-pdf-summary.ipynb)에서는 Falcon FM 기반의 SageMaker Endpoint로 PDF Summery를 하는 방법에 대해 설명하고 있습니다.

먼저 PyPDF2를 이용하여 S3에 저장되어 있는 PDF 파일을 읽어서 Text를 추출합니다.

```python
import PyPDF2
from io import BytesIO

sess = sagemaker.Session()
s3_bucket = sess.default_bucket()
s3_prefix = 'docs'
s3_file_name = '2016-3series.pdf'   # S3의 파일명


s3r = boto3.resource("s3")
doc = s3r.Object(s3_bucket, s3_prefix+'/'+s3_file_name)
        
contents = doc.get()['Body'].read()
reader = PyPDF2.PdfReader(BytesIO(contents))
        
raw_text = []
for page in reader.pages:
    raw_text.append(page.extract_text())
contents = '\n'.join(raw_text)

new_contents = str(contents).replace("\n"," ")
```

문서의 크기가 크므로 [RecursiveCharacterTextSplitter](https://js.langchain.com/docs/modules/indexes/text_splitters/examples/recursive_character)를 이용해 chunk 단위로 분리하고 Document에 저장합니다. 이후 load_summarize_chain를 이용해 요약합니다.

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=0)
texts = text_splitter.split_text(new_contents) 

from langchain.docstore.document import Document
docs = [
    Document(
        page_content=t
    ) for t in texts[:3]
]

from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import PromptTemplate

prompt_template = """Write a concise summary of the following:


{text}


CONCISE SUMMARY """

PROMPT = PromptTemplate(template=prompt_template, input_variables=["text"])
chain = load_summarize_chain(llm, chain_type="stuff", prompt=PROMPT)
summary = chain.run(docs)
```

### chain_type

- stuff puts all the chunks into one prompt. Thus, this would hit the maximum limit of tokens.
- map_reduce summarizes each chunk, combines the summary, and summarizes the combined summary. If the combined summary is too large, it would raise error.
- refine summarizes the first chunk, and then summarizes the second chunk with the first summary. The same process repeats until all chunks are summarized.

  

## ETC

### Bedrock의 LangChain

```java
from langchain import Bedrock
from langchain.embeddings import BedrockEmbeddings

llm = Bedrock()

print(llm("explain GenAI"))
```





## Reference

[LangChain Docs](https://docs.langchain.com/docs/)

[LangChain - github](https://github.com/hwchase17/langchain)

[SageMaker Endpoint](https://python.langchain.com/docs/ecosystem/integrations/sagemaker_endpoint)

[2-Lab02-RAG-LLM](https://github.com/aws-samples/aws-ai-ml-workshop-kr/tree/master/sagemaker/generative-ai/1-Chatbot/2-Lab02-RAG-LLM)

[AWS Kendra Langchain Extensions](https://github.com/aws-samples/amazon-kendra-langchain-extensions)

[QA and Chat over Documents](https://python.langchain.com/docs/use_cases/question_answering/)

[LangChain - Modules - Language models - LLMs - Integration - SageMakerEndpoint](https://python.langchain.com/docs/modules/model_io/models/llms/integrations/sagemaker.html)

[LangChain - EcoSystem - Integration - SageMaker Endpoint](https://python.langchain.com/docs/ecosystem/integrations/sagemaker_endpoint)

[Ingest knowledge base data t a Vector DB](https://github.com/aws-samples/llm-apps-workshop/blob/main/workshop/1_kb_to_vectordb.ipynb)


