## Prompt Examples 

```python
prompt_template = """
    The following is a friendly conversation between a human and an AI. 
    The AI is talkative and provides lots of specific details from its context.
    If the AI does not know the answer to a question, it truthfully says it 
    does not know.
    { context }
    Instruction: Based on the above documents, provide a detailed answer for, { question } Answer "don't know" 
    if not present in the document.
    Solution: """

PROMPT = PromptTemplate(
    template = prompt_template, input_variables = ["context", "question"])
```

```python
condense_qa_template = """
    Given the following conversation and a follow up question, rephrase the follow up question 
    to be a standalone question.

    Chat History:
    { chat_history }
    Follow Up Input: { question }
    Standalone question: """
standalone_question_prompt = PromptTemplate.from_template(condense_qa_template)
```

```python
prompt_template = """Human: Use the following pieces of context to provide a concise answer to the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

    { context }

    Question: { question }
    Assistant: """
PROMPT = PromptTemplate(
    template = prompt_template, input_variables = ["context", "question"])
```

```python
template = """The following is a friendly conversation between a human and an AI. The AI is #talkative and provides lots of specific details from its context. If the AI does not know #the answer to a question, it truthfully says it does not know.

Current conversation:
    { history }
Human: { input }
AI Assistant: """

PROMPT = PromptTemplate(input_variables = ["history", "input"], template = template)
```


