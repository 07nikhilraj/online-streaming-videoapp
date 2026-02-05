# test_auth.py
import requests
import json

# Change this if your backend is running on a different port
BASE_URL = "http://localhost:5000"

def register_user(email, password, role="viewer"):
    url = f"{BASE_URL}/api/auth/register"
    payload = {
        "email": email,
        "password": password,
        "role": role
    }
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"\nRegister - Status: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
        return response.json().get("token") if response.status_code == 201 else None
    except requests.exceptions.RequestException as e:
        print(f"Error during register: {e}")
        return None


def login_user(email, password):
    url = f"{BASE_URL}/api/auth/login"
    payload = {
        "email": email,
        "password": password
    }
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"\nLogin - Status: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
        return response.json().get("token") if response.status_code == 200 else None
    except requests.exceptions.RequestException as e:
        print(f"Error during login: {e}")
        return None


if __name__ == "__main__":
    print("=== Testing Authentication Endpoints ===\n")
    print(f"Target backend: {BASE_URL}\n")

    # === Test 1: Register a new user ===
    print("1) Trying to register a new user...")
    token_reg = register_user(
        email="nikhil.test.editor@example.com",
        password="testpass123",
        role="editor"
    )

    # === Test 2: Login with the same credentials ===
    if token_reg:
        print("\n2) Trying to login with the same user...")
        token_login = login_user(
            email="nikhil.test.editor@example.com",
            password="testpass123"
        )
    else:
        print("\nSkipping login because registration failed.")

    # === Test 3: Try to register the same user again (should fail) ===
    print("\n3) Trying to register the SAME user again (should get error)...")
    register_user(
        email="nikhil.test.editor@example.com",
        password="testpass123",
        role="editor"
    )

    print("\n=== Tests finished ===")