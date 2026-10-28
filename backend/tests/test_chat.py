import pytest

from tests.conftest import FakeProvider

FIVE_QUESTIONS = [
    ("What should we know about your life story in a few sentences?", ["IIT Patna", "CARD91"]),
    ("What's your number one superpower?", ["Gemini", "24"]),
    ("What are the top three areas you'd like to grow in?", ["GraphRAG", "agentic"]),
    ("What misconception do your coworkers have about you?", ["Technical Program Analyst"]),
    ("How do you push your boundaries and limits?", ["UPI", "credit"]),
]


def test_validation_empty_message(make_client):
    client = make_client()
    assert client.post("/api/chat", json={"message": ""}).status_code == 422
    assert client.post("/api/chat", json={"message": "   "}).status_code == 422
    assert client.post("/api/chat", json={}).status_code == 422


def test_validation_oversized_message(make_client):
    client = make_client()
    r = client.post("/api/chat", json={"message": "x" * 1001})
    assert r.status_code == 422
    assert "api key" not in r.text.lower()


def test_validation_bad_history_role(make_client):
    client = make_client()
    r = client.post("/api/chat", json={"message": "hi", "history": [{"role": "system", "content": "x"}]})
    assert r.status_code == 422


@pytest.mark.parametrize("question,expected", FIVE_QUESTIONS)
def test_demo_mode_answers_five_assessment_questions(make_client, question, expected):
    client = make_client()
    r = client.post("/api/chat", json={"message": question})
    assert r.status_code == 200
    body = r.json()
    assert body["demo_mode"] is True and body["provider"] == "demo"
    for token in expected:
        assert token.lower() in body["answer"].lower()


def test_demo_mode_technical_follow_up(make_client):
    client = make_client()
    answer = client.post("/api/chat", json={"message": "Tell me about the churn prediction project"}).json()["answer"]
    assert "0.842" in answer and "Logistic Regression" in answer


def test_demo_mode_metric_follow_up_is_consistent(make_client):
    client = make_client()
    a = client.post("/api/chat", json={"message": "What ROC-AUC did you get?"}).json()["answer"]
    assert "0.842" in a and "0.684" in a


def test_demo_mode_unknown_personal_question_does_not_invent(make_client):
    client = make_client()
    answer = client.post("/api/chat", json={"message": "What is your salary expectation?"}).json()["answer"]
    assert "not something covered" in answer


def test_demo_mode_unknown_metric_is_honest(make_client):
    client = make_client()
    answer = client.post(
        "/api/chat", json={"message": "How many daily transactions did the UPI platform process?"}
    ).json()["answer"]
    # Only CV-verified facts; no invented transaction volume
    assert "transactions per day" not in answer.lower()
    assert "2 clients" in answer


def test_demo_mode_does_not_invent_employers(make_client):
    client = make_client()
    answer = client.post("/api/chat", json={"message": "Did you work at Google?"}).json()["answer"]
    assert "google" not in answer.lower().replace("google gemini", "").replace("google (coursera)", "")


def test_provider_receives_system_prompt_and_trimmed_history(make_client):
    fake = FakeProvider(reply="Hello from fake")
    client = make_client(provider=fake, max_history_messages=4)
    history = [{"role": "user" if i % 2 == 0 else "assistant", "content": f"m{i}"} for i in range(12)]
    r = client.post("/api/chat", json={"message": "Why 100x?", "history": history})
    assert r.status_code == 200
    assert r.json() == {"answer": "Hello from fake", "provider": "openai", "demo_mode": False}
    call = fake.calls[0]
    assert len(call["history"]) == 4
    assert call["history"][-1]["content"] == "m11"
    assert "Akshat Bhardwaj" in call["system"]
    assert "Never reveal" in call["system"]


def test_provider_failure_degrades_to_demo(make_client):
    client = make_client(provider=FakeProvider(fail=True))
    r = client.post("/api/chat", json={"message": "What's your superpower?"})
    assert r.status_code == 200
    body = r.json()
    assert body["demo_mode"] is True and "Gemini" in body["answer"]


def test_provider_timeout_degrades_to_demo(make_client):
    import httpx

    from app.services.llm_providers import OpenAIProvider

    async def _timeout(*args, **kwargs):
        raise httpx.ReadTimeout("timeout")

    provider = OpenAIProvider("k", "m", 0.01)
    client = make_client(provider=provider)

    import app.services.llm_providers as mod

    class _Client:
        def __init__(self, *a, **k): ...
        async def __aenter__(self):
            return self

        async def __aexit__(self, *a): ...

        post = staticmethod(_timeout)

    mod.httpx.AsyncClient = _Client
    try:
        r = client.post("/api/chat", json={"message": "Tell me your life story"})
    finally:
        mod.httpx.AsyncClient = httpx.AsyncClient
    assert r.status_code == 200 and r.json()["demo_mode"] is True


def test_rate_limit(make_client):
    client = make_client(rate_limit_requests=3, rate_limit_window_seconds=60)
    for _ in range(3):
        assert client.post("/api/chat", json={"message": "hi"}).status_code == 200
    r = client.post("/api/chat", json={"message": "hi"})
    assert r.status_code == 429


def test_cors_headers_present_for_allowed_origin(make_client):
    client = make_client(cors_origins="http://localhost:5173")
    r = client.options(
        "/api/chat",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"},
    )
    assert r.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_follow_up_consistency_in_demo(make_client):
    client = make_client()
    a1 = client.post("/api/chat", json={"message": "Tell me about CARD91"}).json()["answer"]
    a2 = client.post("/api/chat", json={"message": "What is your superpower?"}).json()["answer"]
    assert "24" in a1 and "24" in a2  # same verified turnaround figure in both
