import requests
from requests.exceptions import RequestException
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_admin_create_customer_with_valid_data():
    url = f"{BASE_URL}/admin/customers/create"
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    payload = {
        "email": unique_email,
        "password": "SecurePass123!",
        "name": "Test User",
        "company": "Test Company",
        "phone": "+1234567890"
    }
    try:
        # Send data as 'files' to enforce multipart/form-data
        files = {k: (None, v) for k, v in payload.items()}
        response = requests.post(url, files=files, timeout=TIMEOUT)
        response.raise_for_status()
        json_resp = response.json()
        assert response.status_code == 200 or response.status_code == 201
        assert "email" in json_resp
        assert json_resp["email"] == unique_email
        assert "id" in json_resp and json_resp["id"], "Created customer should have an ID"
    except RequestException as e:
        assert False, f"HTTP request failed: {e}"
    except ValueError:
        assert False, "Response is not valid JSON"
    except AssertionError as ae:
        raise ae

test_admin_create_customer_with_valid_data()
