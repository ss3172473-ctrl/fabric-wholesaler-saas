import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Mock user credentials for login
USER_EMAIL = "testuser@example.com"
USER_PASSWORD = "TestPassword123!"

# Mock admin credentials for creating a product
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "AdminPassword123!"

# Headers for JSON requests
HEADERS_JSON = {
    "Content-Type": "application/json"
}

def test_customer_place_order_with_multiple_fabric_rolls():
    # 1. Login: get user auth token (simulate Supabase auth)
    login_url = f"{BASE_URL}/login"
    login_files = [
        ("email", USER_EMAIL),
        ("password", USER_PASSWORD)
    ]
    resp_login = requests.post(login_url, files=login_files, timeout=TIMEOUT)
    assert resp_login.status_code == 200, f"Login failed with status {resp_login.status_code}"
    login_json = resp_login.json()
    assert "access_token" in login_json, "No access_token in login response"
    access_token = login_json["access_token"]
    auth_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # 2. Inventory: create two fabric roll products
    # Assuming an authenticated admin endpoint available at /admin/inventory/create (not explicitly given, we mock creation)
    # Since inventory creation logic is to be verified (mock/ or check page logic), we'll create products via admin customer creation syntax if possible, else skip actual product create.
    # But PRD mentions inventory management API not explicitly present - we will assume an endpoint exists:
    inventory_create_url = f"{BASE_URL}/admin/inventory/create"
    product1_payload = {
        "name": "Fabric Roll A",
        "description": "High quality cotton fabric roll",
        "price": 25.50,
        "stock": 100
    }
    product2_payload = {
        "name": "Fabric Roll B",
        "description": "Premium linen fabric roll",
        "price": 40.00,
        "stock": 50
    }

    # For admin authentication, login admin user
    admin_login_files = [
        ("email", ADMIN_EMAIL),
        ("password", ADMIN_PASSWORD)
    ]
    admin_login_resp = requests.post(login_url, files=admin_login_files, timeout=TIMEOUT)
    assert admin_login_resp.status_code == 200, "Admin login failed"
    admin_token = admin_login_resp.json().get("access_token")
    assert admin_token, "No admin access_token"
    admin_headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }

    product_ids = []
    try:
        # Create product 1
        resp_product1 = requests.post(inventory_create_url, json=product1_payload, headers=admin_headers, timeout=TIMEOUT)
        assert resp_product1.status_code == 201, f"Failed to create product1, status {resp_product1.status_code}"
        product1_data = resp_product1.json()
        product_id_1 = product1_data.get("id")
        assert product_id_1, "No product1 id returned"
        product_ids.append(product_id_1)

        # Create product 2
        resp_product2 = requests.post(inventory_create_url, json=product2_payload, headers=admin_headers, timeout=TIMEOUT)
        assert resp_product2.status_code == 201, f"Failed to create product2, status {resp_product2.status_code}"
        product2_data = resp_product2.json()
        product_id_2 = product2_data.get("id")
        assert product_id_2, "No product2 id returned"
        product_ids.append(product_id_2)

        # 3. Shop Order: place order with multiple items (using the products created)
        order_url = f"{BASE_URL}/shop/order"
        order_payload = {
            "items": [
                {
                    "productId": product_id_1,
                    "quantity": 3,
                    "price": product1_payload["price"]
                },
                {
                    "productId": product_id_2,
                    "quantity": 2,
                    "price": product2_payload["price"]
                }
            ],
            "note": "Please deliver between 9 AM and 5 PM"
        }

        resp_order = requests.post(order_url, json=order_payload, headers=auth_headers, timeout=TIMEOUT)
        assert resp_order.status_code == 201, f"Order creation failed with status {resp_order.status_code}"
        order_resp_json = resp_order.json()
        assert "orderId" in order_resp_json, "No orderId in order response"
        order_id = order_resp_json["orderId"]

        # 4. Order Approval: simulate admin approval of order
        # Assume endpoint /admin/orders/{order_id}/approve with POST to approve
        approve_url = f"{BASE_URL}/admin/orders/{order_id}/approve"
        resp_approve = requests.post(approve_url, headers=admin_headers, timeout=TIMEOUT)
        assert resp_approve.status_code == 200, f"Order approval failed with status {resp_approve.status_code}"
        approve_json = resp_approve.json()
        assert approve_json.get("status") == "approved", "Order status is not approved after approval"

        # 5. Settlement: verify settlement calculation
        # Assume endpoint /admin/settlements/calculate that returns settlement data for approved orders
        settlement_url = f"{BASE_URL}/admin/settlements/calculate"
        resp_settlement = requests.get(settlement_url, headers=admin_headers, timeout=TIMEOUT)
        assert resp_settlement.status_code == 200, f"Settlement calculation failed with status {resp_settlement.status_code}"
        settlement_data = resp_settlement.json()
        # Check that the recently approved order amount is included in settlement results
        order_amount = (product1_payload["price"] * 3) + (product2_payload["price"] * 2)
        orders_in_settlement = settlement_data.get("orders", [])
        found_order = False
        for o in orders_in_settlement:
            if o.get("orderId") == order_id and abs(o.get("totalAmount", 0) - order_amount) < 0.01:
                found_order = True
                break
        assert found_order, "Approved order not found or total amount mismatch in settlement data"

    finally:
        # Cleanup: delete created products and order if possible
        # Delete order - assume DELETE /admin/orders/{order_id}
        if 'order_id' in locals():
            requests.delete(f"{BASE_URL}/admin/orders/{order_id}", headers=admin_headers, timeout=TIMEOUT)
        for pid in product_ids:
            requests.delete(f"{BASE_URL}/admin/inventory/{pid}", headers=admin_headers, timeout=TIMEOUT)

test_customer_place_order_with_multiple_fabric_rolls()
