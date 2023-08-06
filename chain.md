# LangChain - Chain

복잡한 application을 개발할때에는 LLM들을 chaining이 필요합니다. 


```python
import boto3
import langchain
modelId = 'amazon.titan-tg1-large'
region_name = "us-west-2"
endpoint_url = "https://prod.us-west-2.frontend.bedrock.aws.dev"
bedrock_client = boto3.client(
    service_name='bedrock',
    region_name=region_name,
    endpoint_url=endpoint_url
)

llm = Bedrock(model_id=modelId, client=bedrock_client)

from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
 
prompt = PromptTemplate(
    input_variables=["city"],
    template="Describe a perfect day in {city}?",
)
 
llmchain = LLMChain(llm=llm, prompt=prompt)
llmchain.run("Paris")
```

이때의 결과는 아래와 같습니다.
```text
"\nA perfect day in Paris would start with a croissant and café au lait from a nearby café. Then, a visit to a famous museum like the Louvre or the Musée d'Orsay to explore the rich history and art of the city. In the afternoon, stroll along the Seine River, taking in the sights and sounds of Paris. In the evening, enjoy a traditional French meal at a charming restaurant, like Le Jules Verne or Chez L'Ami Jean, and finish the day with a delicious dessert and a glass of wine."
```


## Referecne

[LangChain - Chains](https://python.langchain.com/docs/modules/chains/)

[LangChain Chains의 복잡성: 멀티 모델 언어 학습 솔루션의 잠재력 발휘](https://docs.kanaries.net/ko/articles/langchain-chains-what-is-langchain)
