import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_customer_place_order_with_multiple_fabric_rolls():
    session = requests.Session()
    try:
        # Step 1: Login as customer (simulate customer login with known credentials)
        login_payload = {
            "email": "customer@example.com",
            "password": "correctpassword"
        }
        login_res = session.post(f"{BASE_URL}/login", data=login_payload, timeout=TIMEOUT)
        assert login_res.status_code == 200, f"Login failed with status {login_res.status_code}"

        # Step 2: Simulate two productIds (as product creation endpoint is not detailed)
        product1_id = str(uuid.uuid4())
        product2_id = str(uuid.uuid4())

        # Step 3: Place an order with multiple fabric rolls
        order_payload = {
            "items": [
                {
                    "productId": product1_id,
                    "quantity": 2,
                    "price": 150.0
                },
                {
                    "productId": product2_id,
                    "quantity": 1,
                    "price": 200.0
                }
            ],
            "note": "Please deliver between 9am-5pm"
        }
        order_res = session.post(f"{BASE_URL}/shop/order", json=order_payload, timeout=TIMEOUT)
        assert order_res.status_code == 200, f"Order placement failed with status {order_res.status_code}"
        order_data = order_res.json()
        assert "orderId" in order_data, "Order response missing orderId"
    finally:
        session.close()

test_customer_place_order_with_multiple_fabric_rolls()
