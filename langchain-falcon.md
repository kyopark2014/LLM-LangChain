# LangChain - Falcon

## HuggingFaceHub 

[falcon.ipynb](https://github.com/menloparklab/falcon-langchain/blob/main/falcon.ipynb)에서는 HuggingFaceHub를 이용한 LangChain 예제를 설명하고 있습니다.

```python
import os
from langchain import HuggingFaceHub
from langchain import PromptTemplate, LLMChain

huggingfacehub_api_token = os.environ['HUGGINGFACEHUB_API_TOKEN']

repo_id = "tiiuae/falcon-7b-instruct"
llm = HuggingFaceHub(huggingfacehub_api_token=huggingfacehub_api_token, 
                     repo_id=repo_id, 
                     model_kwargs={"temperature":0.6, "max_new_tokens":500})

template = """
You are an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the user's questions.

{question}
"""

prompt = PromptTemplate(template=template, input_variables=["question"])

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "How to cook pasta?"

print(llm_chain.run(question))
```

이때의 결과는 아래와 같습니다.

```text
1. Bring a large pot of salted water to a boil.
2. Add the pasta to the boiling water and stir occasionally.
3. Cook the pasta according to the package instructions until it is cooked through.
4. Drain the pasta using a colander and return it to the pot or dish.
5. Add sauce or other ingredients to the pasta and mix well.
6. Serve the pasta with a sprinkle of fresh herbs and a bit of extra olive oil.
7. Enjoy your delicious and easy-to-make meal!
```
