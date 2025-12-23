import requests

BASE_ENDPOINT = "http://localhost:3000/login"
TIMEOUT = 30

def test_user_login_with_valid_credentials():
    url = BASE_ENDPOINT
    email = "35081363@naver.com"
    password = "qwas1122**"
    payload = {
        "email": email,
        "password": password
    }

    # Make API request to login
    response = requests.post(url, data=payload, timeout=TIMEOUT)
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    try:
        resp_json = response.json()
    except Exception as e:
        assert False, f"Response is not valid JSON: {e}"

    assert "success" in resp_json, "'success' field missing in response"
    assert resp_json["success"] is True, f"Login failed: {resp_json}"

test_user_login_with_valid_credentials()