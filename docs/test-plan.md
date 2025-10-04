# Payments test plan

Use the running orchestrator on `http://localhost:7071` and the Practx WooCommerce plugin.

1. **Dealer approves**
   - Compute a signature with `python -c "import hmac,hashlib;body='{"order_id":"20001","customer_id":"880","amount_cents":93000,"currency":"usd","payment_method":"DealerAccount"}';print(hmac.new(b'local_secret', body.encode(), hashlib.sha256).hexdigest())"`.
   - POST the body to `/api/orders/on-created` with `X-Signature` and `x-idempotency-key` headers.
   - POST the acknowledgement token to `/api/dealer/ack` with `{ "token": "<token>", "approved": true, "actor": "Dealer QA" }`.
   - POST the same token to `/api/ack` with `{ "token": "<token>", "actor": "Practice Admin" }`.

2. **Dealer declines then Resolve funds**
   - Send `{ "approved": false }` to `/api/dealer/ack`.
   - Call `/api/resolve/create-invoice` (no payload) to process timeouts.
   - Confirm Resolve funding with `/api/resolve/funded` payload `{ "order_id": "20002", "approved": true }`.
   - Acknowledge via `/api/ack`.

3. **Auto-release path**
   - Set `AUTO_RELEASE_DAYS` to `0` locally.
   - POST to `/api/settlements/held-transfer`.
   - Observe the timer logs releasing the order automatically.

4. **Dispute scenario**
   - POST `{ "order_id": "20003", "reason": "customer disputed charges" }` to `/api/disputes/open`.

5. **Woo REST acknowledgement**
   - POST `{ "token": "<token>" }` to `/wp-json/practx/v1/acknowledge`.
