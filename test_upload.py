import requests

BASE_URL = "http://localhost:5000"
EMAIL = "nikhil.test.editor@example.com"
PASSWORD = "testpass123"

# Get token
login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
    "email": EMAIL,
    "password": PASSWORD
})
token = login_resp.json()["token"]

VIDEO_PATH = r"E:/Photos & Videos & Audio/Chandrashila Trek 2025 March/videos/Burhan.mov"

files = {
    'video': (
        'Burhan.mov',
        open(VIDEO_PATH, 'rb'),     
        'video/quicktime'
    )
}

data = {
    'title': 'My MOV Test Upload',
    'description': 'Testing explicit mimetype'
}

headers = {
    'Authorization': f'Bearer {token}'
}

resp = requests.post(
    f"{BASE_URL}/api/videos/upload",
    headers=headers,
    files=files,
    data=data
)

print("Status:", resp.status_code)
print(resp.json())