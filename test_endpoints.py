#!/usr/bin/env python
import json
import sys
sys.path.insert(0, 'backend')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=" * 60)
print("Testing API Endpoints")
print("=" * 60)

print("\n1. Testing Login Endpoint...")
response = client.post(
    "/auth/login",
    json={
        "email": "admin@example.com",
        "password": "admin123"
    }
)

print(f"   Status Code: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"   [OK] User: {data['user']['email']}")
    print(f"   [OK] Is Admin: {data['user']['is_admin']}")
    print(f"   [OK] Token received: {data['access_token'][:20]}...")
else:
    print(f"   [ERROR] {response.status_code}: {response.json()}")

# Test nearby stations
print("\n2. Testing Nearby Stations...")
response = client.post(
    "/stations/nearby",
    json={
        "lat": 12.9716,
        "lon": 77.5946
    }
)
print(f"   Status Code: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"   [OK] Found {len(data)} nearby stations")
    if data:
        station = data[0]
        print(f"   [OK] Closest: {station['name']}")
        print(f"   [OK] Distance: {station['distance']:.2f} km")
else:
    print(f"   [ERROR] {response.status_code}: {response.json()}")

# Test get all stations
print("\n3. Testing Get All Stations...")
response = client.get("/stations/")
print(f"   Status Code: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"   [OK] Found {len(data)} stations")
    if data:
        station = data[0]
        print(f"   [OK] Sample: {station['name']} ({station['address']})")
else:
    print(f"   [ERROR] {response.status_code}: {response.json()}")

print("\n" + "=" * 60)
print("All tests completed!")
print("=" * 60)
