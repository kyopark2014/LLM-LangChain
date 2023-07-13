# ML-langchain

## LangChain Basic

LangChain은 LM(Large Language)을 편리하게 사용할 수 있도록 도와주는 Framework입니다. [LangChain](https://docs.langchain.com/docs/)에서는 "a framework for developing applications powered by language models"라고 기술하고 있습니다. 

### Components

#### Schema

#### Models

#### Prompts

##### Indexes

#### Memory

#### Chains

#### Agents

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



## Reference

[2-Lab02-RAG-LLM](https://github.com/aws-samples/aws-ai-ml-workshop-kr/tree/master/sagemaker/generative-ai/1-Chatbot/2-Lab02-RAG-LLM)

[AWS Kendra Langchain Extensions](https://github.com/aws-samples/amazon-kendra-langchain-extensions)

[LangChain](https://github.com/hwchase17/langchain)

[LangChain 을 알아볼까요?](https://revf.tistory.com/m/280)



