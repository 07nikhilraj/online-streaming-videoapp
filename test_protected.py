# test_protected.py
import requests
import json

BASE_URL = "http://localhost:5000"

def get_token(email="nikhil.test.editor@example.com", password="testpass123"):
    url = f"{BASE_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    try:
        r = requests.post(url, json=payload)
        if r.status_code == 200:
            return r.json()["token"]
        else:
            print("Login failed:", r.json())
            return None
    except Exception as e:
        print("Error:", e)
        return None

def test_route(endpoint, token=None, method="get"):
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        if method.lower() == "get":
            r = requests.get(url, headers=headers)
        print(f"\n{endpoint.upper()} - Status: {r.status_code}")
        print("Response:", json.dumps(r.json(), indent=2))
    except Exception as e:
        print("Request error:", e)

if __name__ == "__main__":
    print("=== Testing Protected Routes ===\n")

    token = get_token()
    if not token:
        print("Cannot continue without token")
        exit()

    print(f"Using token: {token[:20]}...")

    test_route("/api/test/public")                  # no token needed
    test_route("/api/test/protected", token)         # needs valid token
    test_route("/api/test/editor-only", token)       # needs editor role
    test_route("/api/test/admin-only", token)        # should fail (you're editor)

    print("\n=== Tests finished ===")