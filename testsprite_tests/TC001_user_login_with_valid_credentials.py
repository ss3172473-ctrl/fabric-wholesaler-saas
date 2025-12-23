import requests

BASE_URL_LOGIN = "http://localhost:3000/login"
BASE_URL_CREATE_CUSTOMER = "http://localhost:3000/admin/customers/create"
TIMEOUT = 30

def test_user_login_with_valid_credentials():
    valid_email = "testuser@example.com"
    valid_password = "correct_password"

    # 1. Login success
    payload_success = {
        "email": valid_email,
        "password": valid_password
    }

    resp_success = requests.post(
        BASE_URL_LOGIN,
        files=payload_success,
        timeout=TIMEOUT
    )
    assert resp_success.status_code == 200, f"Expected 200, got {resp_success.status_code}"
    try:
        resp_json = resp_success.json()
    except Exception as e:
        assert False, f"Response is not valid JSON: {e}"
    # From PRD, no explicit response schema for login, but test for keys
    assert isinstance(resp_json, dict), "Expected JSON response to be an object"
    assert "user" in resp_json or "access_token" in resp_json, "Successful login response missing expected keys"

    # 2. Create customer with random email
    import random, string
    random_email = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10)) + "@example.com"
    payload_create_customer = {
        "email": random_email,
        "password": "TestPass123!",
        "name": "Test User",
        "company": "Test Company",
        "phone": "1234567890"
    }
    resp_create_customer = requests.post(
        BASE_URL_CREATE_CUSTOMER,
        files=payload_create_customer,
        timeout=TIMEOUT
    )
    assert resp_create_customer.status_code == 200, f"Expected 200 for create customer, got {resp_create_customer.status_code}"
    try:
        create_cust_json = resp_create_customer.json()
    except Exception as e:
        assert False, f"Create customer response is not valid JSON: {e}"
    assert isinstance(create_cust_json, dict), "Create customer response should be JSON object"
    assert "id" in create_cust_json or "success" in create_cust_json, "Create customer response missing expected keys"

test_user_login_with_valid_credentials()
