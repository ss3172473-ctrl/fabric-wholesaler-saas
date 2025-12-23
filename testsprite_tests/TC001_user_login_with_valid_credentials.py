import requests

def test_user_login_with_valid_credentials():
    base_url = "http://localhost:3000"
    login_url = f"{base_url}/login"
    timeout = 30

    # Valid credentials for testing - replace with actual valid test user credentials
    email = "testuser@example.com"
    password = "SecureP@ssw0rd!"

    data = {
        "email": email,
        "password": password
    }

    headers = {
        "Content-Type": "multipart/form-data"
    }

    try:
        response = requests.post(login_url, data=data, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request to /login failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    # Assuming success response contains JSON with user data and access token
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert "access_token" in resp_json, "Response JSON does not contain access_token"
    assert "user" in resp_json, "Response JSON does not contain user information"
    assert resp_json["user"].get("email") == email, "Logged in user email does not match"

test_user_login_with_valid_credentials()
