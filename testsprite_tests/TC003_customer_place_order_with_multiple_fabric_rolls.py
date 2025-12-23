import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_customer_place_order_with_multiple_fabric_rolls():
    # First, create a customer to authenticate and place order
    admin_create_customer_url = f"{BASE_URL}/admin/customers/create"
    customer_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    customer_password = "TestPass123!"
    customer_name = "Test User"
    customer_company = "Test Company"
    customer_phone = "1234567890"

    # Admin creates a new customer account
    try:
        create_customer_response = requests.post(
            admin_create_customer_url,
            headers={"Content-Type": "multipart/form-data"},
            files={
                "email": (None, customer_email),
                "password": (None, customer_password),
                "name": (None, customer_name),
                "company": (None, customer_company),
                "phone": (None, customer_phone)
            },
            timeout=TIMEOUT
        )
        assert create_customer_response.status_code == 200, f"Failed to create customer: {create_customer_response.text}"
    except Exception as e:
        raise AssertionError(f"Exception during customer creation: {e}")

    # Login the created customer to get authentication/session info if required
    login_url = f"{BASE_URL}/login"
    try:
        login_response = requests.post(
            login_url,
            files={
                "email": (None, customer_email),
                "password": (None, customer_password)
            },
            timeout=TIMEOUT
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_data = login_response.json()
        # Assuming token or session cookie is returned; handle accordingly
        # If token present, use it for auth header
        token = login_data.get("access_token") or login_data.get("token")
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        else:
            # If no token, rely on cookies
            session = requests.Session()
            session.cookies.update(login_response.cookies)
    except Exception as e:
        raise AssertionError(f"Exception during login: {e}")

    order_url = f"{BASE_URL}/shop/order"
    order_payload = {
        "items": [
            {"productId": "fabric_roll_001", "quantity": 2, "price": 15.5},
            {"productId": "fabric_roll_002", "quantity": 1, "price": 20.0},
            {"productId": "fabric_roll_003", "quantity": 5, "price": 7.25}
        ],
        "note": "Please deliver between 9 AM to 5 PM."
    }

    try:
        if token:
            order_response = requests.post(
                order_url, json=order_payload, headers=headers, timeout=TIMEOUT
            )
        else:
            order_response = session.post(
                order_url, json=order_payload, headers={"Content-Type": "application/json"}, timeout=TIMEOUT
            )
        assert order_response.status_code == 200 or order_response.status_code == 201, f"Order placement failed: {order_response.text}"
        order_data = order_response.json()
        assert "id" in order_data or "orderId" in order_data, "Order ID expected in response"
        assert "items" in order_data, "Order items expected in response"
        assert len(order_data["items"]) == len(order_payload["items"]), "Number of items in response does not match request"
    except Exception as e:
        raise AssertionError(f"Exception during order placement: {e}")
    finally:
        # Cleanup not specified for orders, assuming no delete endpoint available.
        pass

test_customer_place_order_with_multiple_fabric_rolls()