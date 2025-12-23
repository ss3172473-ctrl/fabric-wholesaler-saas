
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** 영진 장부처리 자동화
- **Date:** 2025-12-23
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** user login with valid credentials
- **Test Code:** [TC001_user_login_with_valid_credentials.py](./TC001_user_login_with_valid_credentials.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 36, in <module>
  File "<string>", line 24, in test_user_login_with_valid_credentials
AssertionError: Expected status code 200, got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/337355cc-e143-4c86-b89f-bf668a5c979e/3bf382e4-abc2-4536-b568-036b5b45b3d8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** admin create customer with valid data
- **Test Code:** [TC002_admin_create_customer_with_valid_data.py](./TC002_admin_create_customer_with_valid_data.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 22, in test_admin_create_customer_with_valid_data
  File "/var/task/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 500 Server Error: Internal Server Error for url: http://localhost:3000/admin/customers/create

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 35, in <module>
  File "<string>", line 29, in test_admin_create_customer_with_valid_data
AssertionError: HTTP request failed: 500 Server Error: Internal Server Error for url: http://localhost:3000/admin/customers/create

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/337355cc-e143-4c86-b89f-bf668a5c979e/7b715a4d-700d-4519-8120-0178ad00c433
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** customer place order with multiple fabric rolls
- **Test Code:** [TC003_customer_place_order_with_multiple_fabric_rolls.py](./TC003_customer_place_order_with_multiple_fabric_rolls.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 30, in test_customer_place_order_with_multiple_fabric_rolls
AssertionError: Failed to create customer: <!DOCTYPE html><html><head><meta charSet="utf-8" data-next-head=""/><meta name="viewport" content="width=device-width" data-next-head=""/><style data-next-hide-fouc="true">body{display:none}</style><noscript data-next-hide-fouc="true"><style>body{display:block}</style></noscript><noscript data-n-css=""></noscript><script defer="" noModule="" src="/_next/static/chunks/node_modules_next_dist_build_polyfills_polyfill-nomodule.js"></script><script src="/_next/static/chunks/node_modules_next_dist_compiled_8ca6b690._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_shared_lib_8bac8163._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_client_5a8a528e._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_b3fb3b5f._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_app_72f3d36f.js" defer=""></script><script src="/_next/static/chunks/%5Bnext%5D_entry_page-loader_ts_742e4b53._.js" defer=""></script><script src="/_next/static/chunks/node_modules_react-dom_4411d9bd._.js" defer=""></script><script src="/_next/static/chunks/node_modules_7f09fef0._.js" defer=""></script><script src="/_next/static/chunks/%5Broot-of-the-server%5D__45f039c3._.js" defer=""></script><script src="/_next/static/chunks/pages__app_2da965e7._.js" defer=""></script><script src="/_next/static/chunks/turbopack-pages__app_0fce199e._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_shared_lib_9a2a7093._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_a183fb77._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_error_1cfbb379.js" defer=""></script><script src="/_next/static/chunks/%5Bnext%5D_entry_page-loader_ts_43b523b5._.js" defer=""></script><script src="/_next/static/chunks/%5Broot-of-the-server%5D__092393de._.js" defer=""></script><script src="/_next/static/chunks/pages__error_2da965e7._.js" defer=""></script><script src="/_next/static/chunks/turbopack-pages__error_af01c4e3._.js" defer=""></script><script src="/_next/static/development/_ssgManifest.js" defer=""></script><script src="/_next/static/development/_buildManifest.js" defer=""></script><noscript id="__next_css__DO_NOT_USE__"></noscript></head><body><div id="__next"></div><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"statusCode":500,"hostname":"localhost"}},"page":"/_error","query":{},"buildId":"development","isFallback":false,"err":{"name":"TypeError","source":"server","message":"Failed to parse body as FormData.","stack":"TypeError: Failed to parse body as FormData.\n    at parsingError (node:internal/deps/undici/undici:6114:14)\n    at multipartFormDataParser (node:internal/deps/undici/undici:5888:15)\n    at node:internal/deps/undici/undici:6364:34\n    at successSteps (node:internal/deps/undici/undici:6414:27)\n    at readAllBytes (node:internal/deps/undici/undici:5380:13)\n    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)"},"gip":true,"scriptLoader":[]}</script></body></html>

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 90, in <module>
  File "<string>", line 32, in test_customer_place_order_with_multiple_fabric_rolls
AssertionError: Exception during customer creation: Failed to create customer: <!DOCTYPE html><html><head><meta charSet="utf-8" data-next-head=""/><meta name="viewport" content="width=device-width" data-next-head=""/><style data-next-hide-fouc="true">body{display:none}</style><noscript data-next-hide-fouc="true"><style>body{display:block}</style></noscript><noscript data-n-css=""></noscript><script defer="" noModule="" src="/_next/static/chunks/node_modules_next_dist_build_polyfills_polyfill-nomodule.js"></script><script src="/_next/static/chunks/node_modules_next_dist_compiled_8ca6b690._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_shared_lib_8bac8163._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_client_5a8a528e._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_b3fb3b5f._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_app_72f3d36f.js" defer=""></script><script src="/_next/static/chunks/%5Bnext%5D_entry_page-loader_ts_742e4b53._.js" defer=""></script><script src="/_next/static/chunks/node_modules_react-dom_4411d9bd._.js" defer=""></script><script src="/_next/static/chunks/node_modules_7f09fef0._.js" defer=""></script><script src="/_next/static/chunks/%5Broot-of-the-server%5D__45f039c3._.js" defer=""></script><script src="/_next/static/chunks/pages__app_2da965e7._.js" defer=""></script><script src="/_next/static/chunks/turbopack-pages__app_0fce199e._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_shared_lib_9a2a7093._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_dist_a183fb77._.js" defer=""></script><script src="/_next/static/chunks/node_modules_next_error_1cfbb379.js" defer=""></script><script src="/_next/static/chunks/%5Bnext%5D_entry_page-loader_ts_43b523b5._.js" defer=""></script><script src="/_next/static/chunks/%5Broot-of-the-server%5D__092393de._.js" defer=""></script><script src="/_next/static/chunks/pages__error_2da965e7._.js" defer=""></script><script src="/_next/static/chunks/turbopack-pages__error_af01c4e3._.js" defer=""></script><script src="/_next/static/development/_ssgManifest.js" defer=""></script><script src="/_next/static/development/_buildManifest.js" defer=""></script><noscript id="__next_css__DO_NOT_USE__"></noscript></head><body><div id="__next"></div><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"statusCode":500,"hostname":"localhost"}},"page":"/_error","query":{},"buildId":"development","isFallback":false,"err":{"name":"TypeError","source":"server","message":"Failed to parse body as FormData.","stack":"TypeError: Failed to parse body as FormData.\n    at parsingError (node:internal/deps/undici/undici:6114:14)\n    at multipartFormDataParser (node:internal/deps/undici/undici:5888:15)\n    at node:internal/deps/undici/undici:6364:34\n    at successSteps (node:internal/deps/undici/undici:6414:27)\n    at readAllBytes (node:internal/deps/undici/undici:5380:13)\n    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)"},"gip":true,"scriptLoader":[]}</script></body></html>

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/337355cc-e143-4c86-b89f-bf668a5c979e/4887e1b3-68b0-4719-82ed-c8e7127233a9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---