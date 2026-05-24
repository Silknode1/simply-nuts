# Klaviyo Email Sequences — Retail Store

> Draft email flows in the Simply Nuts brand voice (warm, family-run, witty — "anti-boring").
> Set these up in Klaviyo (already installed on Shopify). Merge tags use Klaviyo/Shopify syntax.
> Review subject lines + send timing before going live. Owner to confirm sender name/address.

**Sender:** Simply Nuts & More · **From name suggestion:** "Chippy at Simply Nuts"
**Voice reminders:** use "we"/"our", gentle humor, Minnesota + 37-years heritage, never "cheap/bulk."

---

## 1. Welcome Flow (triggers on newsletter signup / first account)
Goal: convert new subscribers to first purchase. 3 emails.

### Email 1 — send immediately
- **Subject:** Welcome to the family (Chippy approves 🐿️)
- **Preview:** Freshly roasted since 1987 — here's a little something to start.
- **Body:**
  > Hi {{ first_name|default:'friend' }},
  >
  > We're Simply Nuts & More — a family business in Chanhassen, Minnesota, roasting premium nuts, mixing trail mixes, and dipping chocolates since 1987.
  >
  > Everything's made in small batches and shipped fresh. No fillers, no fruitcake energy.
  >
  > Take a look around — your next favorite snack is in here somewhere.
  >
  > **[Shop the Treats →]**
- **CTA link:** `SHOP_URL`

### Email 2 — send +2 days
- **Subject:** The Secret Peanuts everyone keeps asking about
- **Preview:** Our #1 seller for a reason.
- **Body:** Highlight Butter Toffee Peanuts (Secret Peanuts) + 2–3 best sellers (Jumbo Cashews, Cranberry Trail Mix). Short, warm, "great on ice cream."
- **CTA:** **[Try the Best Sellers →]** → `SHOP_URL/collections/best-sellers`

### Email 3 — send +4 days (only if no purchase)
- **Subject:** A little welcome treat 🥜
- **Preview:** First order? Here's something to sweeten it.
- **Body:** Optional first-order incentive (owner to decide — e.g. free shipping over $X or 10% off). If no discount, lead with the State Fair story + freshness guarantee.
- **CTA:** **[Shop Now →]**

---

## 2. Abandoned Cart Flow (triggers on Shopify "Checkout Started", no order)
Goal: recover carts. 3 emails. Witty, low-pressure.

### Email 1 — send +1 hour
- **Subject:** You left some good stuff behind
- **Preview:** Your cart's still warm.
- **Body:**
  > Hi {{ first_name|default:'there' }},
  >
  > Looks like a few treats are still sitting in your cart. We get it — choosing is hard when everything's freshly roasted.
  >
  > We saved them for you:
  > {% cart contents / product blocks %}
  >
  > **[Finish Checkout →]**
- **CTA link:** Klaviyo checkout URL `{{ event.extra.responshopify_checkout_url }}` (use Klaviyo's checkout/cart URL tag)

### Email 2 — send +24 hours
- **Subject:** Still thinking it over? Chippy's getting impatient 🐿️
- **Preview:** Your cart, one click away.
- **Body:** Reassure on freshness + family-made quality; restate cart; gentle nudge.
- **CTA:** **[Grab Your Treats →]**

### Email 3 — send +48 hours
- **Subject:** Last call before your cart goes stale (it won't, but still)
- **Preview:** We'll keep roasting either way.
- **Body:** Final friendly nudge. Optional small incentive if owner approves.
- **CTA:** **[Complete Your Order →]**

---

## 3. Browse Abandonment (optional — triggers on viewed product, no add-to-cart)
- 1 email, +4 hours: "Still craving those {{ viewed_product }}?" → link back to the product.

---

## 4. Post-Purchase Flow (triggers on Shopify "Placed Order")
Goal: delight + repeat purchase. (Order/shipping confirmations are handled by Shopify; these are the *relationship* emails.)

### Email 1 — send +3 days after delivery (or +5 days after order)
- **Subject:** How are the {{ first product }} treating you?
- **Body:** Warm thank-you, how-to-store tip (keep nuts airtight/cool), invite a review.
- **CTA:** **[Leave a Review →]**

### Email 2 — send +30 days
- **Subject:** Restock time? 🥜
- **Body:** "If the jar's looking empty…" reorder nudge + cross-sell a complementary item (e.g. bought nuts → suggest a trail mix or chocolate).
- **CTA:** **[Reorder Your Favorites →]**

---

## 5. Seasonal / Campaign (manual sends, not automated)
- **Early-bird holiday** (late Sept): "Beat the holiday rush." Tease corporate gifting waitlist.
- **Black Friday / Cyber Monday:** best-seller bundles.
- **Last-call December:** shipping cutoff dates.

---

## Setup notes
- Connect Klaviyo ↔ Shopify (native integration) so it receives Viewed Product, Started Checkout, Placed Order events.
- Add a newsletter signup form on the landing page → Klaviyo list (feeds Welcome flow).
- Keep order/shipping *transactional* emails in Shopify; keep *marketing* flows in Klaviyo to avoid duplicates.
- Owner decides on any discount incentives before enabling Welcome #3 / Abandoned #3.
