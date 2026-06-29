from __future__ import annotations

import os
from typing import List, Dict, AsyncGenerator, Optional, Any

import httpx
from dotenv import load_dotenv

load_dotenv()

# -----------------------------
# Types
# -----------------------------

Message = Dict[str, str]


# -----------------------------
# Service
# -----------------------------

class NvidiaLLMService:
    """
    Async service wrapper for NVIDIA Chat Completions API
    (DiffusionGemma compatible)
    """

    BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
    MODEL = "google/diffusiongemma-26b-a4b-it"

    def __init__(
        self,
        api_key: Optional[str] = None,
        timeout: float = 60.0,
    ):
        self.api_key = api_key or os.getenv("NVIDIA_API_KEY")
        if not self.api_key:
            raise RuntimeError("NVIDIA_API_KEY is missing")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        self.client = httpx.AsyncClient(
            timeout=timeout,
            headers=self.headers,
        )

    # -------------------------
    # Core payload builder
    # -------------------------

    def _build_payload(
        self,
        messages: List[Message],
        *,
        max_tokens: int = 4096,
        temperature: float = 1.0,
        top_p: float = 0.95,
        stream: bool = False,
        enable_thinking: bool = True,
    ) -> Dict[str, Any]:
        return {
            "model": self.MODEL,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "stream": stream,
            "chat_template_kwargs": {
                "enable_thinking": enable_thinking
            },
        }

    # -------------------------
    # Non-streaming chat
    # -------------------------

    async def chat(
        self,
        messages: List[Message],
        **kwargs: Any
    ) -> Dict[str, Any]:
        payload = self._build_payload(messages, stream=False, **kwargs)

        resp = await self.client.post(self.BASE_URL, json=payload)
        resp.raise_for_status()

        return resp.json()

    # -------------------------
    # Streaming chat (SSE)
    # -------------------------

    async def stream_chat(
        self,
        messages: List[Message],
        **kwargs: Any,
    ) -> AsyncGenerator[str, None]:
        payload = self._build_payload(messages, stream=True, **kwargs)

        async with self.client.stream(
            "POST",
            self.BASE_URL,
            json=payload,
            headers={"Accept": "text/event-stream"},
        ) as response:
            response.raise_for_status()

            async for line in response.aiter_lines():
                if not line:
                    continue

                # NVIDIA streams raw SSE lines
                # Usually starts with "data: {...}"
                if line.startswith("data:"):
                    data = line.removeprefix("data:").strip()

                    if data == "[DONE]":
                        break

                    yield data

    # -------------------------
    # Cleanup
    # -------------------------

    async def close(self):
        await self.client.aclose()