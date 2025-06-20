import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
import uuid

@pytest.mark.asyncio
async def test_register_and_login():
    unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # Register
        resp = await ac.post("/auth/register", json={"username": unique_username, "password": "testpass"})
        assert resp.status_code == 200
        tokens = resp.json()
        assert "access_token" in tokens

        # Login
        resp = await ac.post("/auth/login", data={"username": unique_username, "password": "testpass"})
        assert resp.status_code == 200
        tokens = resp.json()
        assert "access_token" in tokens

        # Use token for protected endpoint
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        resp = await ac.post("/agents/recon?ip_range=10.0.0.0/24", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "scan_started"

@pytest.mark.asyncio
async def test_threat_detect():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # Register and login
        await ac.post("/auth/register", json={"username": "detectuser", "password": "detectpass"})
        resp = await ac.post("/auth/login", data={"username": "detectuser", "password": "detectpass"})
        tokens = resp.json()
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        # Threat detect
        logs = {"logs": [{"feature1": 1, "feature2": 2}, {"feature1": 100, "feature2": 200}]}
        resp = await ac.post("/agents/threat-detect", json=logs, headers=headers)
        assert resp.status_code == 200
        assert "threats" in resp.json()