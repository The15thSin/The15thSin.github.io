from dotenv import load_dotenv
import asyncio

from app.services.nvidia_llm_service import NvidiaLLMService
from app.prompts.system_prompt import SYSTEM_PROMPT

load_dotenv()

async def main():
    print("Hello from the15thsin-github-io!")
    service = NvidiaLLMService()

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": "Who are you? and who is Ayush?"}
    ]

    response = await service.chat(messages)

    response_message = response.get("choices", [{}])[0].get("message", {})
    for key in (
        "refusal",
        "annotations",
        "audio",
        "function_call",
        "tool_calls",
        "reasoning",
    ):
        response_message.pop(key, None)
    
    messages.append(response_message)
    print(messages)
    print(f"\n\n\n\n {messages[-1]}")

    await service.close()


if __name__ == "__main__":
    asyncio.run(main())
