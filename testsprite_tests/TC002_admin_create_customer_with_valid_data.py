import requests
import random
import string

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def generate_random_email():
    return (
        ''.join(random.choices(string.ascii_lowercase + string.digits, k=8)) +
        "@example.com"
    )

def test_admin_create_customer_with_valid_data():
    session = requests.Session()
    try:
        # Step 1: Login as admin with valid credentials
        login_payload = {
            'email': 'admin@example.com',
            'password': 'correct_password'
        }
        login_response = session.post(
            f"{BASE_URL}/login",
            files=login_payload,
            timeout=TIMEOUT
        )
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"

        # Step 2: Create customer with valid data and random email
        customer_email = generate_random_email()
        create_customer_payload = {
            'email': customer_email,
            'password': 'StrongPass123',
            'name': 'Test Customer',
            'company': 'Test Company Ltd',
            'phone': '123-456-7890'
        }

        create_response = session.post(
            f"{BASE_URL}/admin/customers/create",
            files=create_customer_payload,
            timeout=TIMEOUT
        )
        assert create_response.status_code == 200, f"Create customer failed with status {create_response.status_code}"

    finally:
        # Cleanup is skipped as no endpoint or auth token details available
        pass

test_admin_create_customer_with_valid_data()
