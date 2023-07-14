# LangChain Basic

LangChain은 LM(Large Language)을 편리하게 사용할 수 있도록 도와주는 Framework입니다. [LangChain](https://docs.langchain.com/docs/)에서는 "a framework for developing applications powered by language models"라고 기술하고 있습니다. 

## 주요 구성

- Models
    - generic interface for LLMs
    - 하나의 interface로 여러 LLM 모델을 이용할 수 있음. 예) llm = Bedrock(), llm = OpenAI()
```python
from langchain import HuggingFaceHub
from langchain.llms import Bedlock
from langchain.llms import OpenAI

llm = HuggingFaceHub()
llm = OpenAI()
llm = Bedrock()

llm("Tell me a joke")
``` 

- Prompts
    - prompt management, optimization, serialization.
    - template을 이용하여 prompt를 표현하는 것    
```python
from langchain import PromptTemplate

template = """Question: {question}

Let's thing step by step.

Answer: """

prompt = PromptTemplate(template=template, input_variables=["question"])

user_input = input("What's your question?")
prompt.format(question=user_input)
```

- Chains
    - Sequences of calls
```python
from langchain.prompt import PromptTemplate
from langchain.llms import OpenAI

llm = Bedrock()

template = "What is a good name for a company that make {product}?"

prompt = PromptTemplate(input_variables=["product"], template=template)

from langchain.chains import LLMChain
chain = LLMChain(llm=llm, prompt=prompt)
chain.run("happy")
```

- Memory
    - interfaces for memory and memory implementations
```python
from langChain.memory import ChatMessageHistory

history = ChatMessageHistory()

history.add_user_message("Hi!")

history.add_ai_message("whats up?")
```
       
- Indexes
```python
```
- Agent&Tools
```python
```

## 주요 구성

### Components

[LangChain Docs](https://docs.langchain.com/docs/)에서는 아래와 같이 설명하고 있습니다.

#### Schema

Text, ChatMessages, Examples, Document

#### Models

Language Model, Chat Model, Text Embedding Model

[SageMakerEndpoint](https://python.langchain.com/docs/modules/model_io/models/llms/integrations/sagemaker)의 Question/Answering은 아래와 같습니다.

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

from typing import Dict

from langchain import PromptTemplate, SagemakerEndpoint
from langchain.llms.sagemaker_endpoint import LLMContentHandler
from langchain.chains.question_answering import load_qa_chain
import json

query = """How long was Elizabeth hospitalized?
"""

prompt_template = """Use the following pieces of context to answer the question at the end.

{context}

Question: {question}
Answer:"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: Dict) -> bytes:
        input_str = json.dumps({prompt: prompt, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json[0]["generated_text"]


content_handler = ContentHandler()

chain = load_qa_chain(
    llm=SagemakerEndpoint(
        endpoint_name="endpoint-name",
        credentials_profile_name="credentials-profile-name",
        region_name="us-west-2",
        model_kwargs={"temperature": 1e-10},
        content_handler=content_handler,
    ),
    prompt=PROMPT,
)

chain({"input_documents": docs, "question": query}, return_only_outputs=True)
```

#### Prompts

Prompt Value, Prompt Template, Example Selectors, Output Parser

[What is a prompt template?](https://python.langchain.com/docs/modules/model_io/prompts/prompt_templates/)에 따라 아래와 같이 Template를 만들 수 있습니다.

```python
from langchain import PromptTemplate
template = "Tell me a {adjective} joke about {content}."

prompt_template = PromptTemplate.from_template(template)
prompt_template.format(adjective="funny", content="chickens")
```

##### Indexes

Document Loaders, Text Splitters, Retriever, Vecorstore

#### Memory

Chat Message History

#### Chains

Chain, LLMChain, Index-related chains, Prompt Selector

#### Agents

Tool, Toolkit, Agent, Agent Executor

### Use Cases

#### Personal Assistants

#### Question Answering Over Docs

#### Chatbots

#### Querying Tabular Data

#### Interacting with APIs

#### Extraction

#### Evaluation

#### Summarization

[Summarization](https://python.langchain.com/docs/modules/chains/popular/summarize.html)를 참조하여 문서 요약을 할 수 있습니다. 여기서, chain_type으로는 map_reduce, stuff, refine이 있습니다.

```python
from langchain.text_splitter import CharacterTextSplitter
text_splitter = CharacterTextSplitter()
texts = text_splitter.split_text(state_of_the_union)  # state_of_the_union는 읽어온 텍스트

from langchain.docstore.document import Document
docs = [Document(page_content=t) for t in texts[:3]]

from langchain.chains.summarize import load_summarize_chain
chain = load_summarize_chain(llm, chain_type="map_reduce")
chain.run(docs)
```

아래처럼도 사용할 수 있습니다.
```python
from langchain.prompts import PromptTemplate

prompt_template = """Write a concise summary of the following:


{text}


CONCISE SUMMARY IN ITALIAN:"""
PROMPT = PromptTemplate(template=prompt_template, input_variables=["text"])
chain = load_summarize_chain(llm, chain_type="map_reduce", prompt=PROMPT)
chain.run(docs)
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
