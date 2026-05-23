# Retail Catalog — Nuts, Trail Mixes & Chocolates

> **Source:** scraped from the live site simplynutsandmore.com on 2026-05-23.
> These are the products + prices for the new retail Shopify store (TASK-013).
> All items sold in **1 lb, 2 lb, and 3 lb** bags. Vendor: Simply Nuts & More.
>
> ✅ **All 18 products fully priced.** 14 were confirmed from the live site; the remaining 4
> (Honey Roasted Cashews, Roasted Almonds, Chocolate Covered Almonds, Chocolate Covered Cashews)
> were set by the owner to **1 lb $19.99 / 2 lb $34.99 / 3 lb $49.98**. Note: this raised the two
> chocolate 1 lb prices from $18.99 → $19.99.

---

## Nuts (9)

| Product | 1 lb | 2 lb | 3 lb | Description |
|---------|------|------|------|-------------|
| Butter Toffee Peanuts (Secret Peanuts) | $14.99 | $25.98 | $36.97 | This tasty combination of rich butter toffee and fresh peanuts is our signature mix and best seller. Great on ice cream! |
| Honey Cinnamon Almonds | $19.99 | $34.99 | $49.98 | A delicious combination of not-too-sweet, aromatic cinnamon and freshly roasted almonds. Very popular and perfect for the holidays! |
| Honey Roasted Cashews | $19.99 | $34.99 | $49.98 | The perfect combination of buttery Brazilian cashews slow roasted in a sweet honey glaze. You will go simply nuts for this unique taste. *(was sold out — set to draft)* |
| Imperial Mix | $19.99 | $36.98 | $50.99 | Colossal cashews, roasted and salted natural almonds, blanched almonds, Brazil nuts, and roasted filberts accented with jumbo pecans. (No peanuts) |
| Jumbo Cashews | $19.99 | $36.98 | $50.99 | We sell only whole cashews, not pieces. Hand-selected from Brazil for quality, and slow roasted for sweet flavor and crisp texture. The best cashews you can buy. |
| Louisiana Hot Nuts | $14.99 | $25.98 | $36.97 | A scrumptious blend of chili pepper, garlic, and onion powder. You may want to have a cold beverage handy when indulging. |
| Natural Pistachios | $16.99 | $31.98 | $46.98 | These natural pistachios are the very best for the pistachio purist. Crack open a handful and taste their unique, one-of-a-kind goodness for yourself. |
| Pecan Pralines | $19.99 | $34.99 | $49.98 | The rich aroma of irresistible goodness comes packaged especially for you in our pecan pralines. Superb on salads and ice cream. |
| Roasted Almonds | $19.99 | $34.99 | $49.98 | Packed with only the finest plump California almonds, these west coast nuts are a true treat. A great source of vitamin E and folic acid. |

## Trail Mixes (4)

| Product | 1 lb | 2 lb | 3 lb | Description |
|---------|------|------|------|-------------|
| Cranberry Trail Mix | $14.99 | $25.98 | $36.97 | Dried Wisconsin cranberries, golden raisins, roasted and salted almonds, Virginia red-skinned peanuts, sunflower and pumpkin seeds. Fruit and fiber all in one! |
| Hot & Sassy Mix | $14.99 | $25.98 | $36.97 | A hot, zesty blend of roasted and salted blanched and red-skinned peanuts, hot sesame sticks, chili crackers, sunflower and pumpkin seeds, and corn nuts. |
| Sesame Mix | $14.99 | $25.98 | $36.97 | Great as a snack or on salads! A mix of sesame sticks, cheddar sesame sticks, and roasted and salted peanuts, cashews, almonds, pumpkin seeds and sunflower seeds. |
| Ultra Berry | $16.99 | $31.98 | $46.98 | Northern Wisconsin cranberries, Michigan blueberries, and Washington sour cherries make up this one-of-a-kind treat. Buy extra for baking! |

## Chocolates (5)

| Product | 1 lb | 2 lb | 3 lb | Description |
|---------|------|------|------|-------------|
| Chocolate Covered Almonds | $19.99 | $34.99 | $49.98 | We take plump California almonds and cover them in a thick blanket of the finest milk chocolate. Hard to resist! *(was sold out — set to draft; 1 lb raised from $18.99 → $19.99 per owner)* |
| Chocolate Covered Cashews | $19.99 | $34.99 | $49.98 | Fresh cashews covered in delicious chocolate — a mouthwatering treat! *(1 lb raised from $18.99 → $19.99 per owner)* |
| Chocolate Double Dipped Peanuts | $14.99 | $25.98 | $36.97 | Fresh jumbo Virginia peanuts are drowned in a thick creamy milk chocolate and then repeated, for a chocolate lover's dream. |
| Malted Milk Balls | $14.99 | $25.98 | $36.97 | Crisp & crunchy malted milk balls enrobed in our creamy milk chocolate. Always the first to go at any gathering. |
| Secret Peanuts Surprise | $14.99 | $25.98 | $36.97 | The ultimate blend of indulgence: Secret Toffee Peanuts paired perfectly with Double Dipped Chocolate Peanuts. A harmonious dance of rich buttery toffee and luscious chocolate — perfect for snacking or sharing. |

---

## Pricing patterns (observed)
These tiers are consistent across the confirmed products (for reference):

| 1 lb base | 2 lb | 3 lb | Seen on |
|-----------|------|------|---------|
| $14.99 | $25.98 | $36.97 | All $14.99 products (8 of them — identical) |
| $16.99 | $31.98 | $46.98 | Natural Pistachios, Ultra Berry |
| $19.99 | $36.98 **or** $34.99 | $50.99 **or** $49.98 | Two patterns exist — Jumbo/Imperial use $36.98/$50.99; Honey Cinnamon Almonds/Pecan Pralines use $34.99/$49.98 |
| $18.99 | *(no confirmed data)* | *(no confirmed data)* | Chocolate Covered Almonds/Cashews |

## Pricing — finalized ✅
All 18 products have complete 1/2/3 lb pricing. The 4 previously-unconfirmed items were set by
the owner to $19.99 / $34.99 / $49.98. Remaining owner inputs are product photos (TASK-011) and
allergen statements.

## Notes for Shopify build (TASK-013)
- Collections: **Nuts**, **Trail Mixes**, **Chocolates** (matches the site's "Treats by the Pound" structure).
- Variant option name: **Size** → values **1 lb / 2 lb / 3 lb**. Variant weights: 1 lb ≈ 454 g, 2 lb ≈ 907 g, 3 lb ≈ 1361 g (for shipping rates).
- Owner is supplying product photos (TASK-011) — drop them into the `Image Src` column or upload in admin.
- Add allergen + ingredient **metafields** per product so the data is theme-independent (see theme-portability requirement, TASK-014).
- Mark Honey Roasted Cashews & Chocolate Covered Almonds as out-of-stock if still sold out.
