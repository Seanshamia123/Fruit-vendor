#!/usr/bin/env python3
"""
Script to test all dashboard-related endpoints
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Test without authentication to see which endpoints respond
BASE_URL = "http://127.0.0.1:8000"

endpoints = [
    "/products",
    "/sales/",
    "/spoilage-entries/",
    "/inventory/",
]

print(f"Testing endpoints at {BASE_URL}\n")
print("="*60)

for endpoint in endpoints:
    url = BASE_URL + endpoint
    print(f"\nGET {endpoint}")
    try:
        response = requests.get(url, timeout=5)
        print(f"  Status: {response.status_code}")
        if response.status_code >= 400:
            print(f"  Error: {response.text[:200]}")
    except requests.exceptions.ConnectionError:
        print(f"  ERROR: Could not connect to server. Is it running?")
    except Exception as e:
        print(f"  ERROR: {e}")

print("\n" + "="*60)
