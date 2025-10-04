# Local debug guide

## Prerequisites

- Visual Studio 2022 with Azure Functions tools.
- Azure Functions Core Tools (optional for CLI testing).
- .NET 8 SDK for build validation.
- HTTPie or curl for exercising the HTTP endpoints.

## Run the orchestrator functions in Visual Studio

1. Open `apps/orchestrator/Practx.Orchestrator.sln`.
2. Right-click the `Practx.Orchestrator` project and choose **Set as Startup Project**.
3. Update `local.settings.json` if you need different mock settings. The default file includes:
   - `STRIPE_TEST_KEY`
   - `RESOLVE_TEST_KEY`
   - `SERVICE_BUS_CONNECTION`
   - `AUTO_RELEASE_DAYS`
   - `DEALER_TIMEOUT_MINUTES`
   - `ACK_URL_BASE`
   - `WEBHOOK_HMAC_SECRET`
4. Press <kbd>F5</kbd> to launch the Functions runtime listening on `http://localhost:7071`.

## Mock toggles

- Dealer desk approval: append `?approve=true` or `?approve=false` to the acknowledgement URL logged when the dealer mock runs.
- Resolve funding: use the `approved` flag in the request body of `/resolve/funded`.
- Stripe Connect: interactions are logged to the console for held and release operations.

## Sample HTTPie calls

Create a dealer-account order:

```bash
BODY='{"order_id":"10001","customer_id":"700","amount_cents":120000,"currency":"usd","payment_method":"DealerAccount","dealer_name":"Acme Dental","ap_contact_email":"ap@example.com"}'
SIGNATURE=$(python - <<'PY'
import hmac, hashlib
secret = 'local_secret'
body = '''$BODY'''
print(hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest())
PY
)
http POST :7071/api/orders/on-created \
  X-Signature:"$SIGNATURE" \
  x-idempotency-key:demo-1 \
  <<<"$BODY"
```

Dealer acknowledgement (approve):

```bash
http POST :7071/api/dealer/ack token=="<token-from-log>" approved:=true actor="Dealer QA"
```

Resolve fallback for timed-out orders:

```bash
http POST :7071/api/resolve/create-invoice
```

Resolve funded webhook (decline example):

```bash
http POST :7071/api/resolve/funded order_id=10001 approved:=false
```

Create held transfer manually:

```bash
http POST :7071/api/settlements/held-transfer order_id=10001 reason='manual trigger'
```

Customer acknowledgement via REST bridge:

```bash
http POST http://woo.local/wp-json/practx/v1/acknowledge token=='<token-from-email>'
```

Direct acknowledgement against the orchestrator (bypassing WordPress):

```bash
http POST :7071/api/ack token=='<token-from-email>' actor='Backoffice QA'
```

Trigger dispute flow:

```bash
http POST :7071/api/disputes/open order_id=10001 reason='charge disputed by customer'
```

Check auto-release candidates (timer logs) by waiting longer than `AUTO_RELEASE_DAYS` or editing the configuration to a short interval for testing.
