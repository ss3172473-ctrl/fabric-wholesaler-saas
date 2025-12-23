import requests

def test_user_login_with_valid_credentials():
    base_url = "http://localhost:3000"
    login_url = f"{base_url}/login"
    timeout = 30

    # Valid user credentials for testing
    valid_email = "testuser@example.com"
    valid_password = "TestPassword123!"

    # Prepare multipart/form-data payload - use files to force multipart/form-data encoding
    payload = {
        'email': (None, valid_email),
        'password': (None, valid_password)
    }

    try:
        response = requests.post(login_url, files=payload, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request to /login failed: {e}"

    # Validate response status code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    # Validate response content (ensure token or user info present)
    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Typical successful Supabase login returns access_token, user or similar
    assert 'access_token' in json_data or 'user' in json_data, \
        "Response JSON does not contain expected authentication tokens or user info"

test_user_login_with_valid_credentials()
