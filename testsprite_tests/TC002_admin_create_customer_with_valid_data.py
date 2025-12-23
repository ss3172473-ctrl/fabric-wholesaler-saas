import requests
import uuid
from supabase import create_client, Client

BASE_URL = "http://localhost:3000/api/test-debug"
SUPABASE_URL = "https://asdegiubqpjnxebtznot.supabase.co"
SUPABASE_SERVICE_KEY = "sb_secret_Wgj-2IcFcDs4O5WtgTB5HQ_kNa2IdPv"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def test_admin_create_customer_with_valid_data():
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    password = "StrongPass123!"
    name = "Test User"
    company = "Test Company Inc."
    phone = "123-456-7890"

    url = f"{BASE_URL}?action=create_customer"
    payload = {
        "email": unique_email,
        "password": password,
        "name": name,
        "company": company,
        "phone": phone,
    }

    headers = {
        # multipart/form-data handled by requests with files or data;
        # here no files, so send as form data by using `data=payload`
        # requests sets Content-Type automatically in such case.
    }

    # Create customer - POST form data
    response = requests.post(url, data=payload, timeout=30, headers=headers)
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
    resp_json = response.json()
    assert "success" in resp_json, "Missing 'success' in response"
    assert resp_json["success"] is True, f"Customer creation failed, response: {resp_json}"

    # Verify customer exists in Supabase
    try:
        customers = supabase.table("customers").select("*").eq("email", unique_email).execute()
        assert customers.status_code == 200, f"Failed to query customers, status {customers.status_code}"
        data = customers.data
        assert isinstance(data, list), "Supabase query did not return a list"
        assert any(cust.get("email") == unique_email for cust in data), "Created customer not found in Supabase"
    finally:
        # Cleanup: delete created customer record from Supabase
        supabase.table("customers").delete().eq("email", unique_email).execute()


test_admin_create_customer_with_valid_data()