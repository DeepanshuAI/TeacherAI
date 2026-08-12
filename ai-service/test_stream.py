import asyncio
import httpx

async def main():
    async with httpx.AsyncClient(timeout=30) as client:
        headers = {
            "Authorization": "Bearer teacherai_internal_secret",
            "X-User-Id": "testuser",
            "X-User-Email": "testuser@example.com",
            "Content-Type": "application/json"
        }
        data = {
            "message": "Hello",
            "session_id": "sess_123",
            "topic": "Math",
            "student_name": "Test"
        }
        
        try:
            async with client.stream("POST", "http://127.0.0.1:8000/api/v1/chat/stream", headers=headers, json=data) as response:
                print(f"Status: {response.status_code}")
                async for chunk in response.aiter_text():
                    if chunk.strip():
                        print(f"CHUNK: {chunk.strip()}")
        except Exception as e:
            print(f"Error: {e}")

asyncio.run(main())
