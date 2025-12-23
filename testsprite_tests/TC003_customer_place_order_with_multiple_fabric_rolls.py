import requests
from supabase import create_client, Client
import uuid

BASE_URL = "http://localhost:3000/api/test-debug"
SUPABASE_URL = "https://asdegiubqpjnxebtznot.supabase.co"
SUPABASE_SERVICE_KEY = "sb_secret_Wgj-2IcFcDs4O5WtgTB5HQ_kNa2IdPv"
TIMEOUT = 30

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def test_customer_place_order_with_multiple_fabric_rolls():
    # Step 1: Create a test customer to authenticate and place order
    test_email = f"testuser_{uuid.uuid4()}@example.com"
    test_password = "TestPass123!"
    create_customer_payload = {
        "email": test_email,
        "password": test_password,
        "name": "Test User",
        "company": "Test Company",
        "phone": "1234567890"
    }
    create_resp = requests.post(
        f"{BASE_URL}?action=create_customer",
        data=create_customer_payload,
        timeout=TIMEOUT
    )
    assert create_resp.status_code == 200
    create_json = create_resp.json()
    assert create_json.get("success") is True

    try:
        # Step 2: Login user to get a valid session/token if needed
        login_payload = {
            "email": test_email,
            "password": test_password
        }
        login_resp = requests.post(
            f"{BASE_URL}?action=login",
            data=login_payload,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200
        login_json = login_resp.json()
        assert login_json.get("success") is True

        # If token is returned in login response, extract it for auth header if needed
        token = login_json.get("access_token") or login_json.get("token")

        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        # Step 3: Prepare order with multiple fabric roll items
        order_payload = {
            "items": [
                {
                    "productId": "prod_001",
                    "quantity": 5,
                    "price": 19.99
                },
                {
                    "productId": "prod_002",
                    "quantity": 3,
                    "price": 29.99
                },
                {
                    "productId": "prod_003",
                    "quantity": 1,
                    "price": 49.99
                }
            ],
            "note": "Please handle with care."
        }

        order_resp = requests.post(
            f"{BASE_URL}/shop/order",
            json=order_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert order_resp.status_code == 200
        order_json = order_resp.json()
        assert order_json.get("success") is True or order_json.get("order") is not None

        order_id = order_json.get("order", {}).get("id")
        assert order_id is not None

        # Step 4 (Optional verification with Supabase): Verify order exists in DB
        db_order = supabase.table("orders").select("*").eq("id", order_id).execute()
        assert db_order.status_code == 200
        assert db_order.data and len(db_order.data) == 1
        db_order_data = db_order.data[0]
        assert "items" in db_order_data and isinstance(db_order_data["items"], list)
        assert len(db_order_data["items"]) == 3
        assert db_order_data.get("note") == "Please handle with care."

    finally:
        # Cleanup: Delete the created customer and likely the order as well
        # Delete order if exists
        if 'order_id' in locals():
            supabase.table("orders").delete().eq("id", order_id).execute()
        supabase.table("customers").delete().eq("email", test_email).execute()

test_customer_place_order_with_multiple_fabric_rolls()