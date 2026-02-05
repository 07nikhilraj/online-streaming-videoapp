import requests

BASE_URL = "http://localhost:5000"
EMAIL = "nikhil.test.editor@example.com"
PASSWORD = "testpass123"

# 1. Login to get token
login_resp = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={"email": EMAIL, "password": PASSWORD}
)

# Basic check
if login_resp.status_code != 200:
    print("Login failed:", login_resp.status_code, login_resp.text)
    exit()  # or raise error

token = login_resp.json()["token"]
print("Login successful - Token acquired")

# 2. Get my videos
my_videos_resp = requests.get(
    f"{BASE_URL}/api/videos/my-videos",
    headers={'Authorization': f'Bearer {token}'}
)

print("\nMy Videos Status:", my_videos_resp.status_code)

try:
    data = my_videos_resp.json()
    print("My Videos Data:", data)
    print(f"Number of videos: {len(data) if isinstance(data, list) else 'N/A'}")
except Exception as e:
    print("JSON parse failed:", str(e))
    print("Raw response:", my_videos_resp.text)