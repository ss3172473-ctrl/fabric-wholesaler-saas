import requests
from requests.exceptions import RequestException
from datetime import datetime
import random
import string

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def random_email():
    return f"testadmin+{''.join(random.choices(string.ascii_lowercase+string.digits, k=8))}@example.com"

def test_admin_create_customer_with_valid_data():
    url = f"{BASE_URL}/admin/customers/create"
    # Create a unique email to avoid conflicts
    email = random_email()
    password = "StrongP@ssw0rd!"
    name = "Test Admin Customer"
    company = "Test Company Inc."
    phone = "+1234567890"

    # Prepare multipart/form-data payload
    # requests can handle multipart/form-data by passing dict to 'files' or 'data' param,
    # but to mimic multipart/form-data and avoid FormData issues, we use 'files' param with tuples.
    # Since no files are uploaded, just send data as tuples.

    payload = {
        'email': (None, email),
        'password': (None, password),
        'name': (None, name),
        'company': (None, company),
        'phone': (None, phone)
    }

    created_customer_id = None

    try:
        response = requests.post(url, files=payload, timeout=TIMEOUT)
    except RequestException as e:
        assert False, f"Request to create customer failed: {e}"

    # Assert successful status code (201 Created or 200 OK)
    assert response.status_code in (200, 201), f"Unexpected status code: {response.status_code}, Response: {response.text}"

    # Parse response json
    try:
        resp_json = response.json()
    except Exception:
        assert False, f"Response is not valid JSON: {response.text}"

    # The PRD does not describe response schema, but normally new resource id is returned.
    # We try common keys and presence of customer data to validate success.

    # Check for expected fields or success indicator
    assert 'email' in resp_json and resp_json['email'] == email, f"Response email mismatch or missing. Got: {resp_json}"
    # Optionally extract customer ID if available for deletion
    if 'id' in resp_json:
        created_customer_id = resp_json['id']

    # If no explicit ID, try common alternatives
    if not created_customer_id and 'customerId' in resp_json:
        created_customer_id = resp_json['customerId']

    # Cleanup - attempt to delete created customer if deletion endpoint exists
    # As PRD doesn't specify a deletion API, handle only if possible.
    if created_customer_id:
        delete_url = f"{BASE_URL}/admin/customers/{created_customer_id}"
        try:
            del_resp = requests.delete(delete_url, timeout=TIMEOUT)
            # We tolerate any status code for deletion; just log errors if any
        except Exception:
            pass

test_admin_create_customer_with_valid_data()