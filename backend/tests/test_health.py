def test_health_demo_mode(make_client):
    client = make_client()
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["provider"] == "demo"
    assert body["demo_mode"] is True


def test_health_falls_back_to_demo_without_key(make_client):
    client = make_client(ai_provider="gemini", gemini_api_key="")
    assert client.get("/api/health").json()["provider"] == "demo"


def test_health_placeholder_key_is_treated_as_missing(make_client):
    client = make_client(ai_provider="openai", openai_api_key="your-openai-api-key-here")
    assert client.get("/api/health").json()["demo_mode"] is True


def test_profile_has_no_contact_details(make_client):
    client = make_client()
    body = client.get("/api/profile").json()
    dumped = str(body).lower()
    assert "@" not in dumped and "+91" not in dumped
    assert body["assistant_name"] == "Personal AI Assistant"
