import { LOCAL_DELIVERY_MAX_KM, LOCAL_DELIVERY_FEE_CENTS, FREE_DELIVERY_THRESHOLD_CENTS } from "./delivery.js";
import "./fr.js";
import { CAMPAIGN_DEFAULTS, campaignActive, priceOrder } from "./promotion.js";
import { campaignLanguage, t, initializeCampaignLanguage, campaignHero, campaignPopup, octoberHomeCard, awarenessContent } from "./campaign-ui.js?v=20261016-simple-fade";
let soapCampaign = { ...CAMPAIGN_DEFAULTS, enabled: false };
/*
  STORE SETTINGS
  Cart contents stay in the shopper's browser. The Cloudflare Worker endpoints
  email guest order requests and collect consenting subscribers.
*/
document.documentElement.classList.add("has-js");

const STORE = Object.freeze({
  name: "Just B Natural",
  orderEmail: "justbnaturalss@gmail.com",
  instagramUrl: "https://www.instagram.com/justb.naturals/",
  instagramDmUrl: "https://ig.me/m/justb.naturals",
  orderListEnabled: true,
  orderEndpoint: "/api/order",
  deliveryAutocompleteEndpoint: "/api/delivery/autocomplete",
  deliveryEstimateEndpoint: "/api/delivery/estimate",
  subscribeEndpoint: "/api/subscribe"
});

const PRODUCTS = [
  {
    "id": "matcha-lavender-soap",
    "category": "artisan-soap",
    "name": "Matcha & Lavender",
    "kicker": "Just B Clean",
    "description": "This soothing, mineral-rich bar is crafted with organic olive oil, organic coconut oil, raw unrefined shea butter, and castor oil, creating a creamy, conditioning lather that nourishes the skin. Kaolin clay, matcha powder, and French green clay lend a soft, earthy color and a gentle detoxifying touch.",
    "cardDescription": "This soothing, mineral-rich bar is crafted with organic olive oil, organic coconut oil, raw unrefined shea butter, and castor oil, creating a creamy, conditioning lather…",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Organic Coconut Oil, Raw Unrefined Shea Butter, All-Natural Castor Oil) , Kaolin Clay, Matcha Powder, French Green Clay, Steam-Distilled Essential Oils (Lavender, Bergamot, Patchouli, Cedarwood)"
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "This soothing, mineral-rich bar is crafted with organic olive oil, organic coconut oil, raw unrefined shea butter, and castor oil, creating a creamy, conditioning lather that nourishes the skin. Kaolin clay, matcha powder, and French green clay lend a soft, earthy color and a gentle detoxifying touch.",
          "Scented with steam-distilled lavender, bergamot, patchouli, and cedarwood essential oils, the aroma is fresh, grounding, and lightly floral, balanced with warm, woodsy undertones. A calming, nature-inspired bar perfect for everyday use."
        ]
      }
    ],
    "details": [
      "Scented with steam-distilled lavender, bergamot, patchouli, and cedarwood essential oils, the aroma is fresh, grounding, and lightly floral, balanced with warm, woodsy undertones. A calming, nature-inspired bar perfect for everyday use."
    ],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-matcha-lavender.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": true
  },
  {
    "id": "rosemary-sage-soap",
    "category": "artisan-soap",
    "name": "Rosemary & Sage",
    "kicker": "Just B Clean",
    "description": "A refreshing, herbaceous bar crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and castor oil to create a creamy, nourishing lather. French green clay offers a gentle detoxifying cleanse, while activated charcoal adds a deeper purifying touch and a striking natural contrast in the swirl.",
    "cardDescription": "A refreshing, herbaceous bar crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and castor oil to create a creamy, nourishing…",
    "ingredients": [
      "Saponified Oils (Organic Olive Oil, Organic Coconut Oil, Raw Unrefined Shea Butter, All-Natural Castor Oil), French Green Clay, Activated Charcoal, Steam-Distilled Essential Oils (Rosemary, Clary Sage, Cedarwood)"
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A refreshing, herbaceous bar crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and castor oil to create a creamy, nourishing lather. French green clay offers a gentle detoxifying cleanse, while activated charcoal adds a deeper purifying touch and a striking natural contrast in the swirl.",
          "Scented with steam-distilled rosemary, clary sage, and cedarwood essential oils, this bar carries a crisp, grounding aroma, bright herbal notes balanced with warm, woodsy depth. It’s an invigorating, nature-inspired soap perfect for morning showers or anyone who loves clean, botanical scents."
        ]
      }
    ],
    "details": [
      "Scented with steam-distilled rosemary, clary sage, and cedarwood essential oils, this bar carries a crisp, grounding aroma, bright herbal notes balanced with warm, woodsy depth. It’s an invigorating, nature-inspired soap perfect for morning showers or anyone who loves clean, botanical scents."
    ],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-rosemary-sage.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "lemon-rosemary-soap",
    "category": "artisan-soap",
    "name": "Lemon & Rosemary",
    "kicker": "Just B Clean",
    "description": "This refreshing, nature-inspired bar is crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and all-natural castor oil, creating a creamy, conditioning lather that leaves skin soft and nourished. Kaolin clay, French green clay, and matcha powder give the soap its beautiful light green swirls, adding gentle detoxifying and soothing properties.",
    "cardDescription": "This refreshing, nature-inspired bar is crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and all-natural castor oil, creating a…",
    "ingredients": [
      "Saponified Oils (Organic Olive Oil, Organic Coconut Oil, Raw Unrefined Shea Butter, All-Natural Castor Oil), Kaolin Clay, French Green Clay, Steam-Distilled Essential Oils (Lemongrass, Rosemary, Clary Sage)"
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "This refreshing, nature-inspired bar is crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and all-natural castor oil, creating a creamy, conditioning lather that leaves skin soft and nourished. Kaolin clay, French green clay, and matcha powder give the soap its beautiful light green swirls, adding gentle detoxifying and soothing properties.",
          "Scented with steam-distilled essential oils of lemon, rosemary, and clary sage, the aroma is bright, herbal, and clean, an uplifting blend that feels crisp and revitalizing. Perfect for anyone who loves fresh, green, botanical scents and a naturally vibrant aesthetic.",
          "A pure, handcrafted bar that brings a breath of fresh air to your daily routine."
        ]
      }
    ],
    "details": [
      "Scented with steam-distilled essential oils of lemon, rosemary, and clary sage, the aroma is bright, herbal, and clean, an uplifting blend that feels crisp and revitalizing. Perfect for anyone who loves fresh, green, botanical scents and a naturally vibrant aesthetic.",
      "A pure, handcrafted bar that brings a breath of fresh air to your daily routine."
    ],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-lemon-rosemary.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "ember-ash-soap",
    "category": "artisan-soap",
    "name": "Ember & Ash",
    "kicker": "Just B Clean",
    "description": "This bold, minimalist bar is crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and sweet almond oil, creating a creamy, conditioning lather that feels gentle and nourishing on the skin. Activated charcoal gives the soap its dramatic, deep black color, clean, modern, and visually striking.",
    "cardDescription": "This bold, minimalist bar is crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and sweet almond oil, creating a creamy…",
    "ingredients": [
      "Saponified Oils (Organic Olive Oil, Organic Coconut Oil, Raw Unrefined Shea Butter, All-Natural Sweet Almond Oil, All Natural castor Oil) , Activated Charcoal, Steam-Distilled Essential Oils (Patchouli, Frankincense, Sweet Orange)"
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "This bold, minimalist bar is crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and sweet almond oil, creating a creamy, conditioning lather that feels gentle and nourishing on the skin. Activated charcoal gives the soap its dramatic, deep black color, clean, modern, and visually striking.",
          "Scented with steam-distilled patchouli, frankincense, and sweet orange essential oils, the aroma is intentionally very faint, a soft whisper of earthy resin and subtle citrus that never overwhelms. Perfect for those who prefer an understated fragrance or want a bar that lets its natural ingredients and bold appearance speak for themselves."
        ]
      }
    ],
    "details": [
      "Scented with steam-distilled patchouli, frankincense, and sweet orange essential oils, the aroma is intentionally very faint, a soft whisper of earthy resin and subtle citrus that never overwhelms. Perfect for those who prefer an understated fragrance or want a bar that lets its natural ingredients and bold appearance speak for themselves."
    ],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-ember-ash.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": true
  },
  {
    "id": "sweater-weather-soap",
    "category": "artisan-soap",
    "name": "Sweater Weather",
    "kicker": "Just B Clean",
    "description": "Handcrafted in small batches, this nourishing soap is made with saponified organic olive oil, grass-fed tallow, organic coconut oil, and organic castor oil for a rich, creamy lather that deeply comforts the skin. Organic coconut milk, raw honey, and colloidal oats add soothing moisture, creating a gentle bar ideal for daily use.",
    "cardDescription": "Handcrafted in small batches, this nourishing soap is made with saponified organic olive oil, grass-fed tallow, organic coconut oil, and organic castor oil for a rich…",
    "ingredients": [
      "Saponified oils (Organic Olive, Grass-Fed Tallow, Organic Coconut, All-natural Castor), Organic Coconut Milk, Raw Honey, Colloidal Oats, Activated Charcoal, Cocoa Powder, Indigo Powder, Steam-Distilled Essential Oils (Cedarwood, Fir, Clary Sage, Peppermint)"
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "Handcrafted in small batches, this nourishing soap is made with saponified organic olive oil, grass-fed tallow, organic coconut oil, and organic castor oil for a rich, creamy lather that deeply comforts the skin. Organic coconut milk, raw honey, and colloidal oats add soothing moisture, creating a gentle bar ideal for daily use.",
          "Naturally tinted with activated charcoal, cocoa powder, and indigo, each bar carries an earthy, mineral-washed aesthetic. Scented with steam-distilled essential oils of cedarwood, fir, clary sage, and peppermint, it offers a grounding, forest-fresh aroma that feels clean, crisp, and deeply calming."
        ]
      }
    ],
    "details": [
      "Naturally tinted with activated charcoal, cocoa powder, and indigo, each bar carries an earthy, mineral-washed aesthetic. Scented with steam-distilled essential oils of cedarwood, fir, clary sage, and peppermint, it offers a grounding, forest-fresh aroma that feels clean, crisp, and deeply calming."
    ],
    "note": "Available October 15",
    "use": "",
    "safety": "",
    "availability": "Available October 15",
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-sweater-weather.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "coconut-lavender-soap",
    "category": "artisan-soap",
    "name": "Coconut Lavender",
    "kicker": "Just B Clean",
    "description": "A gentle, creamy bar crafted with saponified organic olive oil, unrefined shea butter, organic coconut oil, and organic castor oil to deliver a rich, nourishing lather. Organic coconut milk adds silky moisture, creating a soothing cleanse that feels soft and comforting on the skin.",
    "cardDescription": "A gentle, creamy bar crafted with saponified organic olive oil, unrefined shea butter, organic coconut oil, and organic castor oil to deliver a rich, nourishing lather.",
    "ingredients": [
      "Saponified oils (Organic Olive, unrefined shea butter, Organic Coxconut, Organic Castor), Organic coconut milk, steam-distilled lavender."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A gentle, creamy bar crafted with saponified organic olive oil, unrefined shea butter, organic coconut oil, and organic castor oil to deliver a rich, nourishing lather. Organic coconut milk adds silky moisture, creating a soothing cleanse that feels soft and comforting on the skin.",
          "Infused with steam-distilled lavender essential oil, this bar carries a calming, floral aroma, light, clean, and beautifully relaxing. Perfect for unwinding at the end of the day or adding a touch of tranquility to your daily routine."
        ]
      }
    ],
    "details": [
      "Infused with steam-distilled lavender essential oil, this bar carries a calming, floral aroma, light, clean, and beautifully relaxing. Perfect for unwinding at the end of the day or adding a touch of tranquility to your daily routine."
    ],
    "note": "Available October 15",
    "use": "",
    "safety": "",
    "availability": "Available October 15",
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-coconut-lavender.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "whisper-citrus-soap",
    "category": "artisan-soap",
    "name": "Whisper of Citrus",
    "kicker": "Just B Clean",
    "description": "A soft, minimalist bar crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and all-natural sweet almond oil to create a creamy, nourishing lather that feels delicate on the skin. The formula is intentionally simple and soothing, perfect for those who prefer an understated, fragrance-light cleanse.",
    "cardDescription": "A soft, minimalist bar crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and all-natural sweet almond oil to create a creamy…",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Organic Coconut Oil, Raw Unrefined Shea Butter, All-Natural Sweet Almond Oil, All-Natural Castor Oil) Steam-Distilled Essential Oils (Grapefruit, cedarwood)"
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A soft, minimalist bar crafted with saponified organic olive oil, organic coconut oil, raw unrefined shea butter, and all-natural sweet almond oil to create a creamy, nourishing lather that feels delicate on the skin. The formula is intentionally simple and soothing, perfect for those who prefer an understated, fragrance-light cleanse.",
          "Infused with steam-distilled grapefruit and cedarwood essential oils, the scent is very faint, a subtle hint of bright citrus wrapped in a whisper of warm wood. It’s clean, quiet, and refreshing without ever becoming overpowering.",
          "A gentle, airy bar designed for lovers of barely-there scents and naturally elegant simplicity."
        ]
      }
    ],
    "details": [
      "Infused with steam-distilled grapefruit and cedarwood essential oils, the scent is very faint, a subtle hint of bright citrus wrapped in a whisper of warm wood. It’s clean, quiet, and refreshing without ever becoming overpowering.",
      "A gentle, airy bar designed for lovers of barely-there scents and naturally elegant simplicity."
    ],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-whisper-citrus.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "charcoal-blush-soap",
    "category": "artisan-soap",
    "name": "Charcoal & Blush",
    "kicker": "Just B Clean",
    "description": "A gentle activated charcoal bar with a very light, natural aroma. Soft earthy notes of patchouli and frankincense are balanced by a delicate hint of sweet orange, creating a clean, understated scent that stays close to the soap rather than lingering heavily.",
    "cardDescription": "A gentle activated charcoal bar with a very light, natural aroma.",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Unrefined Shea Butter, Organic Coconut Oil, All-natural Sweet Almond Oil, All-Natural Castor Oil), Activated Charcoal, French Pink Clay, Steam-Distilled Essential Oils ( Patchouili, Frankincense, Orange)."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A gentle activated charcoal bar with a very light, natural aroma. Soft earthy notes of patchouli and frankincense are balanced by a delicate hint of sweet orange, creating a clean, understated scent that stays close to the soap rather than lingering heavily."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-charcoal-blush.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "cedar-eucalyptus-loofah-soap",
    "category": "artisan-soap",
    "name": "Cedarwood & Eucalyptus Loofah",
    "kicker": "Just B Clean",
    "description": "A refreshing exfoliating bar with natural loofah for a satisfying scrub. Crisp eucalyptus and cooling peppermint create a clean, invigorating aroma, while cedarwood adds a warm, earthy base. Mango and shea butters give the bar a rich, creamy feel that balances the exfoliation.",
    "cardDescription": "A refreshing exfoliating bar with natural loofah for a satisfying scrub.",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Organic Coconut Oil, Raw Mango Butter, Unrefined Shea Butter), Natural Loofah, Steam-Distilled Essential Oils (Cedarwood, Eucalyptus, Peppermint)."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A refreshing exfoliating bar with natural loofah for a satisfying scrub. Crisp eucalyptus and cooling peppermint create a clean, invigorating aroma, while cedarwood adds a warm, earthy base. Mango and shea butters give the bar a rich, creamy feel that balances the exfoliation."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-cedar-eucalyptus-loofah.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "lemongrass-lavender-soap",
    "category": "artisan-soap",
    "name": "Lemongrass & Lavender",
    "kicker": "Just B Clean",
    "description": "A gentle, earthy bar crafted with nourishing organic oils, turmeric, and natural Brazilian purple and kaolin clays. Fresh lemongrass and soft lavender create a clean, calming botanical scent, while the clays give the bar its naturally rich character.",
    "cardDescription": "A gentle, earthy bar crafted with nourishing organic oils, turmeric, and natural Brazilian purple and kaolin clays.",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Unrefined Shea Butter, Organic Jojoba Oil, Organic Coconut Oil, All-Natural Castor Oil), Turmeric Powder, Brazilian Purple Clay, Kaolin Clay, Steam-Distilled Essential Oils (Lemongrass, Lavender)."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A gentle, earthy bar crafted with nourishing organic oils, turmeric, and natural Brazilian purple and kaolin clays. Fresh lemongrass and soft lavender create a clean, calming botanical scent, while the clays give the bar its naturally rich character."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-lemongrass-lavender.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "ylang-ylang-soap",
    "category": "artisan-soap",
    "name": "Ylang Ylang",
    "kicker": "Just B Clean",
    "description": "A soft, creamy bar made with nourishing organic oils, unrefined shea butter, and coconut milk. French pink clay adds a gentle, silky touch, while ylang-ylang, sweet orange, and cedarwood create a warm, lightly floral scent with soft citrus and woody notes.",
    "cardDescription": "A soft, creamy bar made with nourishing organic oils, unrefined shea butter, and coconut milk.",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Organic Coconut Oil, Unrefined Shea Butter, All-Natural Castor Oil), Organic Coconut Milk, French Pink Clay, Steam-Distilled Essential Oils (Ylang-Ylang, Sweet Orange, Cedarwood)."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A soft, creamy bar made with nourishing organic oils, unrefined shea butter, and coconut milk. French pink clay adds a gentle, silky touch, while ylang-ylang, sweet orange, and cedarwood create a warm, lightly floral scent with soft citrus and woody notes."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-ylang-ylang.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "honey-oat-comfort-soap",
    "category": "artisan-soap",
    "name": "Oat Tallow",
    "kicker": "Just B Clean",
    "description": "A gentle, unscented bar crafted especially for dry, delicate and sensitive-feeling skin. Grass-fed tallow creates a rich, creamy lather while providing skin-conditioning fatty acids that help leave skin feeling soft and nourished. Calendula-infused olive oil, traditionally valued for its soothing properties, pairs beautifully with colloidal oatmeal to comfort and condition the skin. Organic coconut milk adds extra creaminess for a mild, luxurious everyday cleanse.",
    "cardDescription": "A gentle, unscented bar crafted especially for dry, delicate and sensitive-feeling skin.",
    "ingredients": [
      "Saponified oils (calendula-infused olive oil, grass-fed tallow, organic coconut oil, all-natural castor oil), organic coconut milk, colloidal oatmeal."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A gentle, unscented bar crafted especially for dry, delicate and sensitive-feeling skin.",
          "Grass-fed tallow creates a rich, creamy lather while providing skin-conditioning fatty acids that help leave skin feeling soft and nourished. Calendula-infused olive oil, traditionally valued for its soothing properties, pairs beautifully with colloidal oatmeal to comfort and condition the skin. Organic coconut milk adds extra creaminess for a mild, luxurious everyday cleanse."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-oat-tallow.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "chocolate-pumpkin-pie-soap",
    "category": "artisan-soap",
    "name": "Pumpkin",
    "kicker": "Just B Clean",
    "description": "This cozy, skin-nourishing bar is crafted with saponified organic olive oil, shea butter, coconut oil, and castor oil for a rich, creamy lather. Real pumpkin purée and 10% cream give the soap its velvety texture and naturally moisturizing feel. Turmeric adds a warm golden hue, while steam-distilled sweet orange, lavender, and clove essential oils create a soft, comforting aroma.",
    "cardDescription": "A cozy, creamy seasonal bar made with real pumpkin purée, 10% cream, turmeric, and pure essential oils.",
    "ingredients": [
      "Saponified oils (organic olive oil, shea butter, organic coconut oil, castor oil), 10% cream, real pumpkin purée, steam-distilled essential oils (sweet orange, lavender, clove), kaolin clay, turmeric powder."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "This cozy, skin-nourishing bar is crafted with a blend of saponified organic olive oil, shea butter, coconut oil, and castor oil for a rich, creamy lather. Real pumpkin purée and 10% cream give the soap its velvety texture and naturally moisturizing feel.",
          "Turmeric adds a warm golden hue. Steam-distilled sweet orange, lavender, and clove essential oils create a soft, comforting aroma that makes each use feel like a warm, cozy moment.",
          "A seasonal favourite with a naturally luxurious finish, perfect for anyone who loves a gentle, creamy bar made from real ingredients."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": "Preorder • Available September 24, 2026",
    "availabilityStatus": "preorder",
    "availableDate": "2026-09-24",
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-pumpkin.jpg",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "almond-milk-mocha-soap",
    "category": "artisan-soap",
    "name": "Mocha Latté",
    "kicker": "Just B Clean",
    "description": "This indulgent bar blends creamy nourishment with the warm comfort of coffee. Made with saponified organic olive oil, shea butter, coconut oil, and castor oil, organic almond milk adds a soft, creamy feel while brewed espresso, coffee grounds, and cocoa powder give the bar its rich mocha character.",
    "cardDescription": "A creamy mocha-inspired bar made with organic almond milk, brewed espresso, coffee grounds, and cocoa powder.",
    "ingredients": [
      "Saponified oils (organic olive oil, shea butter, organic coconut oil, castor oil), organic almond milk, brewed espresso, coffee grounds, cocoa powder."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "This indulgent bar blends creamy nourishment with the warm comfort of coffee.",
          "Made with saponified organic olive oil, shea butter, coconut oil, and castor oil, organic almond milk adds a soft, creamy feel while brewed espresso, coffee grounds, and cocoa powder give the bar its rich mocha character."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-mocha-latte.jpg",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "unscented-loofah-soap",
    "category": "artisan-soap",
    "name": "Unscented Loofah",
    "kicker": "Just B Clean",
    "description": "A creamy, naturally exfoliating bar made with nourishing organic oils, unrefined shea butter, and coconut milk. Sugar and natural loofah provide a gentle scrub, leaving skin feeling smooth, refreshed, and clean.",
    "cardDescription": "A creamy, naturally exfoliating bar made with nourishing organic oils, unrefined shea butter, and coconut milk.",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Organic Coconut Oil, Unrefined Shea Butter, All- Natural  Castor Oil), Organic Coconut Milk, Sugar, All-Natural Loofah."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A creamy, naturally exfoliating bar made with nourishing organic oils, unrefined shea butter, and coconut milk. Sugar and natural loofah provide a gentle scrub, leaving skin feeling smooth, refreshed, and clean."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-unscented-loofah.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "mint-eucalyptus-spa-soap",
    "category": "artisan-soap",
    "name": "Mint & Eucalyptus Spa Bar",
    "kicker": "Just B Clean",
    "description": "A fresh, invigorating bar crafted with nourishing organic oils and rich unrefined shea butter. Cooling peppermint and crisp eucalyptus create a refreshing, clean aroma that awakens the senses and leaves you feeling fresh and revitalized.",
    "cardDescription": "A fresh, invigorating bar crafted with nourishing organic oils and rich unrefined shea butter.",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Unrefined Shea Butter, Organic Coconut Oil, All- Natural Castor Oil), Steam-Distilled Essential Oils (Peppermint, Eucalyptus)."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A fresh, invigorating bar crafted with nourishing organic oils and rich unrefined shea butter. Cooling peppermint and crisp eucalyptus create a refreshing, clean aroma that awakens the senses and leaves you feeling fresh and revitalized."
        ]
      }
    ],
    "details": [],
    "note": "Available October 15",
    "use": "",
    "safety": "",
    "availability": "Available October 15",
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-mint-eucalyptus-spa.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "spiced-banana-soap",
    "category": "artisan-soap",
    "name": "Spiced Banana",
    "kicker": "Just B Clean",
    "description": "A warm, creamy bar made with real banana, organic coconut milk, raw honey, and nourishing oils and butters. A touch of ground cinnamon adds a cozy, comforting aroma, while decorative oats give each bar a naturally rustic finish.",
    "cardDescription": "A warm, creamy bar made with real banana, organic coconut milk, raw honey, and nourishing oils and butters.",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Unrefined Shea Butter, Organic Coconut Oil, All-Natural Castor Oil), Organic Coconut Milk, Banana, Raw Honey, Ground Cinnamon, Decorative Oats."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A warm, creamy bar made with real banana, organic coconut milk, raw honey, and nourishing oils and butters. A touch of ground cinnamon adds a cozy, comforting aroma, while decorative oats give each bar a naturally rustic finish."
        ]
      }
    ],
    "details": [],
    "note": "Available October 15",
    "use": "",
    "safety": "",
    "availability": "Available October 15",
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-spiced-banana.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "cedar-lemon-soap",
    "category": "artisan-soap",
    "name": "Cedar Lemon",
    "kicker": "Just B Clean",
    "description": "A fresh, earthy bar crafted with nourishing oils and butters, French green clay, matcha, and turmeric. Bright lemongrass gives the soap a clean, citrusy freshness, while cedarwood and patchouli add warm, woody, grounding notes. The natural clays and botanicals give the bar its distinctive colour and character, creating a refreshing everyday soap with a balanced, nature-inspired aroma.",
    "cardDescription": "A fresh, earthy bar crafted with nourishing oils and butters, French green clay, matcha, and turmeric.",
    "ingredients": [
      "Saponified Oils ( Organic Olive Oil, Organic Coconut Oil, Unrefined Shea Butter, All-Natural Jojoba Oil, All-Natural Castor Oil), Steam-Distilled Essential Oils ( Cedarwood, Lemongrass, Patchouli) ,French Green Clay, Matcha Powder, Tumeric."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A fresh, earthy bar crafted with nourishing oils and butters, French green clay, matcha, and turmeric. Bright lemongrass gives the soap a clean, citrusy freshness, while cedarwood and patchouli add warm, woody, grounding notes. The natural clays and botanicals give the bar its distinctive colour and character, creating a refreshing everyday soap with a balanced, nature-inspired aroma."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-cedar-lemon.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "mango-butter",
    "category": "body-care",
    "name": "Mango Butter",
    "kicker": "Just B Nourished",
    "description": "A rich, water-free body butter formulated with nutrient-rich plant butters and oils to deeply moisturize, soften, and condition dry skin. The combination of raw mango butter and unrefined shea butter creates a protective, emollient base, while jojoba and rosehip oils provide additional fatty acids and naturally occurring antioxidants. Arrowroot helps give the butter a smoother, less-greasy finish, and lavender, cedarwood, and real Madagascar vanilla create a soft, warm botanical aroma.",
    "cardDescription": "A rich, water-free body butter formulated with nutrient-rich plant butters and oils to deeply moisturize, soften, and condition dry skin.",
    "ingredients": [
      "Raw Mango Butter, Unrefined Shea Butter, Organic Jojoba Oil, Organic Rosehip Oil, Arrowroot Powder, Steam-Distilled Essential Oils (Lavender, Cedarwood), Vitamin E, Madagascar Vanilla Bean."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A rich, water-free body butter formulated with nutrient-rich plant butters and oils to deeply moisturize, soften, and condition dry skin. The combination of raw mango butter and unrefined shea butter creates a protective, emollient base, while jojoba and rosehip oils provide additional fatty acids and naturally occurring antioxidants. Arrowroot helps give the butter a smoother, less-greasy finish, and lavender, cedarwood, and real Madagascar vanilla create a soft, warm botanical aroma.",
          "Naturally provides: fatty acids including oleic, stearic, linoleic and alpha-linolenic acids; naturally occurring vitamin E, carotenoids and other plant antioxidants; plus rich emollients that help moisturize, soften, condition and support the skin's natural moisture barrier.",
          "Raw Mango Butter is naturally rich in fatty acids, particularly oleic and stearic acids, which help soften the skin and reduce moisture loss. It also contains naturally occurring compounds including vitamin E and carotenoids/provitamin A compounds. Its rich emollient properties make it particularly useful for rough, dry areas such as hands, elbows, knees, and heels.",
          "Unrefined Shea Butter provides a rich source of oleic, stearic, linoleic, and palmitic fatty acids, along with naturally occurring vitamin E and other unsaponifiable plant compounds. It forms an emollient layer over the skin that helps retain moisture and leaves dry or tight-feeling skin softer and more supple.",
          "Organic Jojoba Oil is technically a liquid wax rather than a conventional vegetable oil. Its wax esters are similar in structure to some of the lipids naturally found on the skin's surface. It provides lightweight conditioning, improves softness, and helps reduce moisture loss without giving the body butter an excessively heavy feel.",
          "Organic Rosehip Oil contributes linoleic and alpha-linolenic essential fatty acids, along with naturally occurring carotenoids and other antioxidants. It is particularly valued in cosmetic skincare for conditioning dry, dull-looking skin and helping maintain a smoother, more even and healthy-looking appearance.",
          "Vitamin E is a lipid-soluble antioxidant. In addition to conditioning the skin, it helps protect the oils and butters in the formula from oxidation, contributing to the stability and freshness of an anhydrous product.",
          "Arrowroot Powder gives the butter a softer, silkier texture and helps absorb some of the excess oil left on the skin. This allows you to get the richness of mango and shea butter with a smoother, less greasy finish.",
          "Lavender Essential Oil provides a soft floral-herbal aroma traditionally associated with relaxation and calm, making the butter especially pleasant as part of an evening or after-bath routine.",
          "Cedarwood Essential Oil adds a warm, dry, woody character that grounds the lavender and balances the sweetness of the vanilla. Together, lavender and cedarwood create a relaxing, earthy botanical scent rather than an overpowering perfume.",
          "Madagascar Vanilla Bean provides a naturally warm, creamy sweetness and rounds out the sharper botanical notes of lavender and cedarwood, giving the finished butter a subtle, comforting aroma.",
          "Overall, this is an excellent head-to-toe moisturizer for dry and rough-feeling skin. It can be massaged into the body after bathing, used as an intensive hand and foot butter, applied to elbows and knees, worked into dry cuticles, or used anywhere that needs extra moisture. Because the formula contains no added water, a small amount goes a long way. Warm a little between your hands and massage it into the skin, ideally while the skin is still slightly damp."
        ]
      }
    ],
    "details": [
      "Naturally provides: fatty acids including oleic, stearic, linoleic and alpha-linolenic acids; naturally occurring vitamin E, carotenoids and other plant antioxidants; plus rich emollients that help moisturize, soften, condition and support the skin's natural moisture barrier.",
      "Raw Mango Butter is naturally rich in fatty acids, particularly oleic and stearic acids, which help soften the skin and reduce moisture loss. It also contains naturally occurring compounds including vitamin E and carotenoids/provitamin A compounds. Its rich emollient properties make it particularly useful for rough, dry areas such as hands, elbows, knees, and heels.",
      "Unrefined Shea Butter provides a rich source of oleic, stearic, linoleic, and palmitic fatty acids, along with naturally occurring vitamin E and other unsaponifiable plant compounds. It forms an emollient layer over the skin that helps retain moisture and leaves dry or tight-feeling skin softer and more supple.",
      "Organic Jojoba Oil is technically a liquid wax rather than a conventional vegetable oil. Its wax esters are similar in structure to some of the lipids naturally found on the skin's surface. It provides lightweight conditioning, improves softness, and helps reduce moisture loss without giving the body butter an excessively heavy feel.",
      "Organic Rosehip Oil contributes linoleic and alpha-linolenic essential fatty acids, along with naturally occurring carotenoids and other antioxidants. It is particularly valued in cosmetic skincare for conditioning dry, dull-looking skin and helping maintain a smoother, more even and healthy-looking appearance.",
      "Vitamin E is a lipid-soluble antioxidant. In addition to conditioning the skin, it helps protect the oils and butters in the formula from oxidation, contributing to the stability and freshness of an anhydrous product.",
      "Arrowroot Powder gives the butter a softer, silkier texture and helps absorb some of the excess oil left on the skin. This allows you to get the richness of mango and shea butter with a smoother, less greasy finish.",
      "Lavender Essential Oil provides a soft floral-herbal aroma traditionally associated with relaxation and calm, making the butter especially pleasant as part of an evening or after-bath routine.",
      "Cedarwood Essential Oil adds a warm, dry, woody character that grounds the lavender and balances the sweetness of the vanilla. Together, lavender and cedarwood create a relaxing, earthy botanical scent rather than an overpowering perfume.",
      "Madagascar Vanilla Bean provides a naturally warm, creamy sweetness and rounds out the sharper botanical notes of lavender and cedarwood, giving the finished butter a subtle, comforting aroma.",
      "Overall, this is an excellent head-to-toe moisturizer for dry and rough-feeling skin. It can be massaged into the body after bathing, used as an intensive hand and foot butter, applied to elbows and knees, worked into dry cuticles, or used anywhere that needs extra moisture. Because the formula contains no added water, a small amount goes a long way. Warm a little between your hands and massage it into the skin, ideally while the skin is still slightly damp."
    ],
    "note": "",
    "use": "Overall, this is an excellent head-to-toe moisturizer for dry and rough-feeling skin. It can be massaged into the body after bathing, used as an intensive hand and foot butter, applied to elbows and knees, worked into dry cuticles, or used anywhere that needs extra moisture. Because the formula contains no added water, a small amount goes a long way. Warm a little between your hands and massage it into the skin, ideally while the skin is still slightly damp.",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/mango-butter.webp",
    "imageNote": null,
    "art": "jar",
    "tone": "#eadfc8",
    "accent": "#8b6b48",
    "featured": true
  },
  {
    "id": "vanilla-infused-tallow",
    "category": "body-care",
    "name": "Vanilla Infused Tallow",
    "kicker": "Just B Nourished",
    "description": "A luxuriously whipped, rich yet airy moisturizer crafted with grass-fed tallow, organic jojoba oil, vitamin E, real Madagascar vanilla bean, and steam-distilled frankincense essential oil. Whipping transforms the naturally dense tallow into a soft, cloud-like texture that melts effortlessly on contact with the skin, making a small amount easy to spread over larger areas.",
    "cardDescription": "A luxuriously whipped, rich yet airy moisturizer crafted with grass-fed tallow, organic jojoba oil, vitamin E, real Madagascar vanilla bean, and steam-distilled…",
    "ingredients": [
      "Grass-Fed Tallow, Organic Jojoba Oil, Vitamin E, Madagascar Vanilla Bean, Steam-Distilled Frankincense Essential Oil."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A luxuriously whipped, rich yet airy moisturizer crafted with grass-fed tallow, organic jojoba oil, vitamin E, real Madagascar vanilla bean, and steam-distilled frankincense essential oil. Whipping transforms the naturally dense tallow into a soft, cloud-like texture that melts effortlessly on contact with the skin, making a small amount easy to spread over larger areas."
        ]
      },
      {
        "title": "Key benefits",
        "paragraphs": [
          "Deep Moisture • Skin Barrier Support • Softening • Conditioning • Water-Free • Concentrated • Naturally Derived",
          "Designed especially for dry, rough, and moisture-depleted skin, this concentrated, water-free formula coats the skin with nourishing lipids that help reduce moisture loss and leave it feeling noticeably softer, smoother, and more supple.",
          "Grass-Fed Tallow forms the foundation of the formula. It is naturally composed of skin-conditioning fatty acids, particularly oleic, stearic, and palmitic acids. These fatty acids act as emollients, filling spaces between dry surface skin cells and creating a protective layer that helps reduce moisture loss. This makes whipped tallow particularly useful for dry hands, cracked-feeling heels, rough elbows and knees, cuticles, and skin exposed to cold or dry weather.",
          "Organic Jojoba Oil gives the whipped tallow a smoother, silkier application. Jojoba is technically a liquid wax made primarily of wax esters, which are structurally similar to some of the lipids naturally present on the skin's surface. It conditions and softens the skin while helping balance the richness of the tallow so the finished product spreads more easily.",
          "Vitamin E provides antioxidant and skin-conditioning benefits. Within the formula, it also helps protect the tallow and jojoba oil against oxidation, contributing to the stability and freshness of this water-free product.",
          "Organic Frankincense Essential Oil gives the tallow its warm, resinous, woody character. Its grounding aroma pairs especially well with the richness of the balm and creates a subtle botanical scent rather than an overpowering fragrance.",
          "Madagascar Vanilla Bean rounds out the frankincense with a soft, naturally sweet and creamy aroma. Together, frankincense and vanilla create a warm, comforting, earthy scent that stays understated on the skin."
        ]
      },
      {
        "title": "Why whipped?",
        "paragraphs": [
          "Whipping gives traditional tallow balm a completely different experience. Air is incorporated into the formula, creating a lighter, fluffier texture that's easy to scoop and melts almost instantly from the warmth of your hands. You still get the concentrated moisturizing qualities of an anhydrous tallow balm, but with a softer, more luxurious application."
        ]
      },
      {
        "title": "Benefits",
        "paragraphs": [
          "Ideal for dry and rough skin, hands, elbows, knees, heels, feet, cuticles, and other areas needing intensive moisture. It can also be used as an all-over body moisturizer, particularly after bathing or showering.",
          "Because there is no added water, this whipped tallow is highly concentrated. A little goes a long way."
        ]
      },
      {
        "title": "How to use",
        "paragraphs": [
          "Scoop out a small amount and warm it between your fingertips or palms. Gently massage into the skin until absorbed. For maximum moisture retention, apply after bathing while the skin is still slightly damp. Use more sparingly on the face and patch-test first, particularly if you have sensitive or acne-prone skin."
        ]
      }
    ],
    "details": [
      "Deep Moisture • Skin Barrier Support • Softening • Conditioning • Water-Free • Concentrated • Naturally Derived",
      "Designed especially for dry, rough, and moisture-depleted skin, this concentrated, water-free formula coats the skin with nourishing lipids that help reduce moisture loss and leave it feeling noticeably softer, smoother, and more supple.",
      "Grass-Fed Tallow forms the foundation of the formula. It is naturally composed of skin-conditioning fatty acids, particularly oleic, stearic, and palmitic acids. These fatty acids act as emollients, filling spaces between dry surface skin cells and creating a protective layer that helps reduce moisture loss. This makes whipped tallow particularly useful for dry hands, cracked-feeling heels, rough elbows and knees, cuticles, and skin exposed to cold or dry weather.",
      "Organic Jojoba Oil gives the whipped tallow a smoother, silkier application. Jojoba is technically a liquid wax made primarily of wax esters, which are structurally similar to some of the lipids naturally present on the skin's surface. It conditions and softens the skin while helping balance the richness of the tallow so the finished product spreads more easily.",
      "Vitamin E provides antioxidant and skin-conditioning benefits. Within the formula, it also helps protect the tallow and jojoba oil against oxidation, contributing to the stability and freshness of this water-free product.",
      "Organic Frankincense Essential Oil gives the tallow its warm, resinous, woody character. Its grounding aroma pairs especially well with the richness of the balm and creates a subtle botanical scent rather than an overpowering fragrance.",
      "Madagascar Vanilla Bean rounds out the frankincense with a soft, naturally sweet and creamy aroma. Together, frankincense and vanilla create a warm, comforting, earthy scent that stays understated on the skin.",
      "Whipping gives traditional tallow balm a completely different experience. Air is incorporated into the formula, creating a lighter, fluffier texture that's easy to scoop and melts almost instantly from the warmth of your hands. You still get the concentrated moisturizing qualities of an anhydrous tallow balm, but with a softer, more luxurious application.",
      "Ideal for dry and rough skin, hands, elbows, knees, heels, feet, cuticles, and other areas needing intensive moisture. It can also be used as an all-over body moisturizer, particularly after bathing or showering.",
      "Because there is no added water, this whipped tallow is highly concentrated. A little goes a long way.",
      "Scoop out a small amount and warm it between your fingertips or palms. Gently massage into the skin until absorbed. For maximum moisture retention, apply after bathing while the skin is still slightly damp. Use more sparingly on the face and patch-test first, particularly if you have sensitive or acne-prone skin."
    ],
    "note": "",
    "use": "Scoop out a small amount and warm it between your fingertips or palms. Gently massage into the skin until absorbed. For maximum moisture retention, apply after bathing while the skin is still slightly damp. Use more sparingly on the face and patch-test first, particularly if you have sensitive or acne-prone skin.",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/vanilla-tallow.webp",
    "imageNote": null,
    "art": "jar",
    "tone": "#eadfc8",
    "accent": "#8b6b48",
    "featured": false
  },
  {
    "id": "unscented-tallow",
    "category": "body-care",
    "name": "Unscented Tallow",
    "kicker": "Just B Nourished",
    "description": "A pure, luxuriously whipped moisturizer made with just three thoughtfully selected ingredients: grass-fed tallow, organic jojoba oil, and vitamin E. With no essential oils, added fragrance, or vanilla, this simple water-free formula is designed for those who prefer uncomplicated skincare, especially for dry, delicate, or fragrance-sensitive skin.",
    "cardDescription": "A pure, luxuriously whipped moisturizer made with just three thoughtfully selected ingredients: grass-fed tallow, organic jojoba oil, and vitamin E.",
    "ingredients": [
      "Grass-Fed Tallow, Organic Jojoba Oil, All-Natural Vitamin E."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A pure, luxuriously whipped moisturizer made with just three thoughtfully selected ingredients: grass-fed tallow, organic jojoba oil, and vitamin E. With no essential oils, added fragrance, or vanilla, this simple water-free formula is designed for those who prefer uncomplicated skincare, especially for dry, delicate, or fragrance-sensitive skin.",
          "Grass-Fed Tallow forms the rich, nourishing base of this whipped moisturizer. It naturally contains skin-conditioning fatty acids, particularly oleic, stearic, and palmitic acids. These lipids act as emollients, helping soften rough skin and form a protective layer that reduces moisture loss. This makes it especially useful for areas that become very dry, including hands, elbows, knees, heels, feet, and cuticles.",
          "Organic Jojoba Oil gives the tallow a smoother, silkier feel and makes it easier to spread. Jojoba is technically a liquid wax composed primarily of wax esters, which are similar to some of the lipids naturally present on the skin's surface. It helps condition and soften the skin while balancing the richness of the tallow.",
          "Vitamin E provides antioxidant and skin-conditioning benefits while also helping protect the oils and fats in the formula from oxidation. It contributes to the product's stability while leaving skin feeling soft and conditioned."
        ]
      },
      {
        "title": "Why whipped?",
        "paragraphs": [
          "Whipping incorporates air into the formula, transforming dense tallow into a soft, light, cloud-like texture. It melts almost immediately from the warmth of your skin and spreads easily, providing the richness of a traditional tallow balm with a more luxurious application."
        ]
      },
      {
        "title": "Benefits",
        "paragraphs": [
          "Deep Moisture • Skin Barrier Support • Softening • Conditioning • Fragrance-Free • Essential-Oil-Free • Water-Free • Concentrated",
          "Its simple, unscented formula makes it a versatile head-to-toe moisturizer. Use it for dry hands, rough elbows and knees, cracked-feeling heels, feet, cuticles, weather-exposed skin, or anywhere that needs additional moisture. It can also be worked through a dry beard and the skin underneath to soften and condition.",
          "Because there is no added water, the formula is highly concentrated, so a little goes a long way."
        ]
      },
      {
        "title": "How to use",
        "paragraphs": [
          "Warm a small amount between your fingertips or palms and gently massage into the skin. For best moisture retention, apply after bathing or showering while the skin is still slightly damp. When using on the face, start with a very small amount and patch-test first, particularly if you have sensitive or acne-prone skin."
        ]
      }
    ],
    "details": [
      "Grass-Fed Tallow forms the rich, nourishing base of this whipped moisturizer. It naturally contains skin-conditioning fatty acids, particularly oleic, stearic, and palmitic acids. These lipids act as emollients, helping soften rough skin and form a protective layer that reduces moisture loss. This makes it especially useful for areas that become very dry, including hands, elbows, knees, heels, feet, and cuticles.",
      "Organic Jojoba Oil gives the tallow a smoother, silkier feel and makes it easier to spread. Jojoba is technically a liquid wax composed primarily of wax esters, which are similar to some of the lipids naturally present on the skin's surface. It helps condition and soften the skin while balancing the richness of the tallow.",
      "Vitamin E provides antioxidant and skin-conditioning benefits while also helping protect the oils and fats in the formula from oxidation. It contributes to the product's stability while leaving skin feeling soft and conditioned.",
      "Whipping incorporates air into the formula, transforming dense tallow into a soft, light, cloud-like texture. It melts almost immediately from the warmth of your skin and spreads easily, providing the richness of a traditional tallow balm with a more luxurious application.",
      "Deep Moisture • Skin Barrier Support • Softening • Conditioning • Fragrance-Free • Essential-Oil-Free • Water-Free • Concentrated",
      "Its simple, unscented formula makes it a versatile head-to-toe moisturizer. Use it for dry hands, rough elbows and knees, cracked-feeling heels, feet, cuticles, weather-exposed skin, or anywhere that needs additional moisture. It can also be worked through a dry beard and the skin underneath to soften and condition.",
      "Because there is no added water, the formula is highly concentrated, so a little goes a long way.",
      "Warm a small amount between your fingertips or palms and gently massage into the skin. For best moisture retention, apply after bathing or showering while the skin is still slightly damp. When using on the face, start with a very small amount and patch-test first, particularly if you have sensitive or acne-prone skin."
    ],
    "note": "",
    "use": "Warm a small amount between your fingertips or palms and gently massage into the skin. For best moisture retention, apply after bathing or showering while the skin is still slightly damp. When using on the face, start with a very small amount and patch-test first, particularly if you have sensitive or acne-prone skin.",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/unscented-tallow.webp",
    "imageNote": null,
    "art": "jar",
    "tone": "#eadfc8",
    "accent": "#8b6b48",
    "featured": false
  },
  {
    "id": "just-b-calm",
    "category": "roller-oils",
    "name": "Calm",
    "kicker": "Just B Botanical Oil",
    "description": "Created with botanicals long appreciated for their calming and grounding qualities, this blend offers a quiet sense of comfort and stability. With cooling citrus, soft florals, and herbal notes, it provides gentle, everyday support for moments when you want to feel more centered and at ease.",
    "cardDescription": "Created with botanicals long appreciated for their calming and grounding qualities, this blend offers a quiet sense of comfort and stability.",
    "ingredients": [
      "Organic Jojoba Oil, Organic Essential Oils (Clary Sage, Grapefruit, Cypress, Lavender, Peppermint), All-Natural Vitamin E."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "Created with botanicals long appreciated for their calming and grounding qualities, this blend offers a quiet sense of comfort and stability. With cooling citrus, soft florals, and herbal notes, it provides gentle, everyday support for moments when you want to feel more centered and at ease.",
          "Organic Jojoba Oil provides the lightweight base. Technically a liquid wax rather than a conventional oil, jojoba spreads easily across the skin and helps condition and soften it while carrying the essential oils at a diluted concentration.",
          "Clary Sage provides a distinctive earthy, herbaceous and slightly floral aroma. It gives the blend much of its balancing, grounding character and pairs particularly well with lavender and grapefruit.",
          "Grapefruit adds a bright, clean citrus note that lifts the heavier herbal oils. Its fresh aroma gives the roll-on an energizing quality and keeps the overall scent from becoming overly floral or earthy.",
          "Cypress contributes a crisp, woody, evergreen-like aroma. It bridges the citrus and herbal components of the blend and gives it a clean, grounding base.",
          "Lavender softens the formula with its familiar floral-herbal aroma. It is widely used in aromatherapy blends intended to encourage relaxation and creates a calmer counterpoint to the sharper peppermint and grapefruit notes.",
          "Peppermint provides the most noticeable cooling and refreshing sensation. Its crisp menthol character makes the roll-on feel immediately fresh when applied to the skin and gives the overall aroma an invigorating finish.",
          "All-Natural Vitamin E conditions the skin while providing antioxidant activity. It also helps protect the carrier oil from oxidation, supporting the stability and freshness of the finished product.",
          "Together, the essential oils create a scent that is cooling, fresh, herbaceous, lightly floral and citrusy. Peppermint provides the initial burst of freshness, grapefruit brightens it, lavender and clary sage soften the middle, and cypress provides a clean woody foundation."
        ]
      },
      {
        "title": "How to use",
        "paragraphs": [
          "Roll a small amount onto pulse points such as the wrists and back of the neck, then gently massage into the skin. Bring your wrists near your nose and take a few slow breaths to enjoy the aroma. It can be reapplied as desired when you're looking for a cooling, refreshing aromatic experience."
        ]
      },
      {
        "title": "Before using",
        "paragraphs": [
          "For external use only. Avoid the eyes, mucous membranes, and broken or irritated skin. Discontinue use if irritation occurs"
        ]
      }
    ],
    "details": [
      "Organic Jojoba Oil provides the lightweight base. Technically a liquid wax rather than a conventional oil, jojoba spreads easily across the skin and helps condition and soften it while carrying the essential oils at a diluted concentration.",
      "Clary Sage provides a distinctive earthy, herbaceous and slightly floral aroma. It gives the blend much of its balancing, grounding character and pairs particularly well with lavender and grapefruit.",
      "Grapefruit adds a bright, clean citrus note that lifts the heavier herbal oils. Its fresh aroma gives the roll-on an energizing quality and keeps the overall scent from becoming overly floral or earthy.",
      "Cypress contributes a crisp, woody, evergreen-like aroma. It bridges the citrus and herbal components of the blend and gives it a clean, grounding base.",
      "Lavender softens the formula with its familiar floral-herbal aroma. It is widely used in aromatherapy blends intended to encourage relaxation and creates a calmer counterpoint to the sharper peppermint and grapefruit notes.",
      "Peppermint provides the most noticeable cooling and refreshing sensation. Its crisp menthol character makes the roll-on feel immediately fresh when applied to the skin and gives the overall aroma an invigorating finish.",
      "All-Natural Vitamin E conditions the skin while providing antioxidant activity. It also helps protect the carrier oil from oxidation, supporting the stability and freshness of the finished product.",
      "Together, the essential oils create a scent that is cooling, fresh, herbaceous, lightly floral and citrusy. Peppermint provides the initial burst of freshness, grapefruit brightens it, lavender and clary sage soften the middle, and cypress provides a clean woody foundation.",
      "Roll a small amount onto pulse points such as the wrists and back of the neck, then gently massage into the skin. Bring your wrists near your nose and take a few slow breaths to enjoy the aroma. It can be reapplied as desired when you're looking for a cooling, refreshing aromatic experience.",
      "For external use only. Avoid the eyes, mucous membranes, and broken or irritated skin. Discontinue use if irritation occurs"
    ],
    "note": "",
    "use": "Roll a small amount onto pulse points such as the wrists and back of the neck, then gently massage into the skin. Bring your wrists near your nose and take a few slow breaths to enjoy the aroma. It can be reapplied as desired when you're looking for a cooling, refreshing aromatic experience.",
    "safety": "For external use only. Avoid the eyes, mucous membranes, and broken or irritated skin. Discontinue use if irritation occurs",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/calm-botanical-oil.jpg",
    "imageNote": null,
    "art": "roller",
    "tone": "#d5dfd6",
    "accent": "#456b59",
    "featured": true
  },
  {
    "id": "just-b-relieved",
    "category": "roller-oils",
    "name": "Eased",
    "kicker": "Just B Botanical Oil",
    "description": "A cooling, aromatic roll-on made with organic jojoba oil and a concentrated blend of peppermint, eucalyptus, rosemary, lavender, and frankincense.",
    "cardDescription": "A cooling, aromatic botanical oil made with organic jojoba and a concentrated blend of peppermint, eucalyptus, rosemary, lavender, and frankincense.",
    "ingredients": [
      "Organic Jojoba Oil, Organic Essential Oils (Peppermint, Eucalyptus, Rosemary, Lavender, Frankincense), All-Natural Vitamin E."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A cooling, aromatic roll-on made with organic jojoba oil and a concentrated blend of peppermint, eucalyptus, rosemary, lavender, and frankincense.",
          "Designed for application around the head, neck, and shoulders, the aroma begins intensely fresh and minty, develops into crisp herbal notes, and finishes with the softer, grounding character of lavender and frankincense.",
          "Peppermint Essential Oil provides the dominant cooling, minty sensation and immediately recognizable freshness of the blend. Peppermint naturally contains menthol, which activates cold-sensitive receptors in the skin and produces its characteristic cooling and tingling sensation. This makes it particularly well suited to a roll-on intended for a refreshing sensation around the temples, hairline, neck, and shoulders.",
          "Eucalyptus Essential Oil reinforces that cooling sensation with its powerful, clean, almost camphoraceous aroma. Its naturally occurring eucalyptol (1,8-cineole) gives eucalyptus its distinctive fresh character and works beautifully alongside peppermint to create that crisp, open, invigorating aromatic experience.",
          "Rosemary Essential Oil introduces a stimulating herbal note that bridges the sharp freshness of peppermint and eucalyptus with the softer oils in the formula. Rosemary naturally contains aromatic compounds such as alpha-pinene, and its warm, herbaceous character makes the blend feel refreshing without being purely minty.",
          "Lavender Essential Oil provides balance. Peppermint, eucalyptus, and rosemary can create a very sharp aromatic profile on their own; lavender introduces a softer floral-herbal note traditionally associated with relaxation. This gives the formula both a refreshing and calming character, rather than making it smell medicinal or overwhelmingly minty.",
          "Frankincense Essential Oil is what gives your version its own identity. Its warm, resinous, woody aroma provides a grounding base beneath the brighter mint and eucalyptus notes. It rounds out the formula and creates a deeper, smoother finish while complementing lavender particularly well.",
          "Organic Jojoba Oil acts as the carrier for the essential oils. Technically a liquid wax composed primarily of wax esters, jojoba provides excellent slip, helps condition the skin, and allows the essential oil blend to be applied precisely without the heaviness of many conventional carrier oils.",
          "All-Natural Vitamin E provides antioxidant and skin-conditioning benefits while also helping protect the oils within the formula from oxidation.",
          "Peppermint and eucalyptus provide the immediate cooling sensation, rosemary adds an invigorating herbal middle, lavender softens and balances the blend, and frankincense leaves behind a subtle earthy warmth.",
          "It's an ideal pocket-sized aromatic roll-on for moments when you want a cooling, refreshing sensation around the head, neck, and shoulders, whether during a long workday, while travelling, after physical activity, or whenever you're looking for a fresh botanical pick-me-up."
        ]
      },
      {
        "title": "How to use",
        "paragraphs": [
          "Roll a small amount along the temples, hairline, back of the neck, and across the shoulders, keeping well away from the eyes. Gently massage into the skin and enjoy the cooling botanical aroma."
        ]
      },
      {
        "title": "Before using",
        "paragraphs": [
          "For external use only. Avoid contact with eyes and mucous membranes and do not apply to broken or irritated skin. Discontinue use if irritation occurs"
        ]
      }
    ],
    "details": [
      "Designed for application around the head, neck, and shoulders, the aroma begins intensely fresh and minty, develops into crisp herbal notes, and finishes with the softer, grounding character of lavender and frankincense.",
      "Peppermint Essential Oil provides the dominant cooling, minty sensation and immediately recognizable freshness of the blend. Peppermint naturally contains menthol, which activates cold-sensitive receptors in the skin and produces its characteristic cooling and tingling sensation. This makes it particularly well suited to a roll-on intended for a refreshing sensation around the temples, hairline, neck, and shoulders.",
      "Eucalyptus Essential Oil reinforces that cooling sensation with its powerful, clean, almost camphoraceous aroma. Its naturally occurring eucalyptol (1,8-cineole) gives eucalyptus its distinctive fresh character and works beautifully alongside peppermint to create that crisp, open, invigorating aromatic experience.",
      "Rosemary Essential Oil introduces a stimulating herbal note that bridges the sharp freshness of peppermint and eucalyptus with the softer oils in the formula. Rosemary naturally contains aromatic compounds such as alpha-pinene, and its warm, herbaceous character makes the blend feel refreshing without being purely minty.",
      "Lavender Essential Oil provides balance. Peppermint, eucalyptus, and rosemary can create a very sharp aromatic profile on their own; lavender introduces a softer floral-herbal note traditionally associated with relaxation. This gives the formula both a refreshing and calming character, rather than making it smell medicinal or overwhelmingly minty.",
      "Frankincense Essential Oil is what gives your version its own identity. Its warm, resinous, woody aroma provides a grounding base beneath the brighter mint and eucalyptus notes. It rounds out the formula and creates a deeper, smoother finish while complementing lavender particularly well.",
      "Organic Jojoba Oil acts as the carrier for the essential oils. Technically a liquid wax composed primarily of wax esters, jojoba provides excellent slip, helps condition the skin, and allows the essential oil blend to be applied precisely without the heaviness of many conventional carrier oils.",
      "All-Natural Vitamin E provides antioxidant and skin-conditioning benefits while also helping protect the oils within the formula from oxidation.",
      "Peppermint and eucalyptus provide the immediate cooling sensation, rosemary adds an invigorating herbal middle, lavender softens and balances the blend, and frankincense leaves behind a subtle earthy warmth.",
      "It's an ideal pocket-sized aromatic roll-on for moments when you want a cooling, refreshing sensation around the head, neck, and shoulders, whether during a long workday, while travelling, after physical activity, or whenever you're looking for a fresh botanical pick-me-up.",
      "Roll a small amount along the temples, hairline, back of the neck, and across the shoulders, keeping well away from the eyes. Gently massage into the skin and enjoy the cooling botanical aroma.",
      "For external use only. Avoid contact with eyes and mucous membranes and do not apply to broken or irritated skin. Discontinue use if irritation occurs"
    ],
    "note": "",
    "use": "Roll a small amount along the temples, hairline, back of the neck, and across the shoulders, keeping well away from the eyes. Gently massage into the skin and enjoy the cooling botanical aroma.",
    "safety": "For external use only. Avoid contact with eyes and mucous membranes and do not apply to broken or irritated skin. Discontinue use if irritation occurs",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/eased-botanical-oil.jpg",
    "imageNote": null,
    "art": "roller",
    "tone": "#d5dfd6",
    "accent": "#456b59",
    "featured": false
  },
  {
    "id": "cycle-harmony",
    "category": "roller-oils",
    "name": "Balanced",
    "kicker": "Just B Botanical Oil",
    "description": "A gentle, soothing botanical oil designed for lower-abdominal massage and comforting self-care throughout your cycle. Organic essential oils of geranium, lavender, Roman chamomile, and frankincense are blended into lightweight grapeseed oil to create a soft floral, herbaceous, and grounding aroma.",
    "cardDescription": "A gentle, soothing botanical oil designed for lower-abdominal massage and comforting self-care throughout your cycle.",
    "ingredients": [
      "Grapeseed Oil, Organic Essential Oils (Geranium, Lavender, Roman Chamomile, Frankincense), All-Natural Vitamin E."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A gentle, soothing botanical oil designed for lower-abdominal massage and comforting self-care throughout your cycle. Organic essential oils of geranium, lavender, Roman chamomile, and frankincense are blended into lightweight grapeseed oil to create a soft floral, herbaceous, and grounding aroma.",
          "The blend was chosen to combine relaxing aromatherapy with the comfort of gentle massage. There is some clinical research suggesting that abdominal massage with certain essential-oil blends may help with menstrual discomfort, although the evidence is limited and the specific formulas studied are not identical to yours.",
          "Geranium Essential Oil gives the blend its fresh, green-floral character. It works particularly well alongside lavender and chamomile, adding a balancing botanical note without making the finished oil overly sweet or perfume-like.",
          "Lavender Essential Oil provides a soft floral and herbaceous aroma and forms much of the relaxing character of the blend. It makes this oil especially suited to quiet self-care, rest, and gentle massage when you want to unwind.",
          "Roman Chamomile Essential Oil adds a delicate, sweet, herbaceous aroma. Its gentle aromatic character pairs beautifully with lavender and helps give the blend its comforting, calming profile.",
          "Frankincense Essential Oil grounds the lighter floral notes with a warm, resinous and slightly woody aroma. It gives the blend greater depth and creates a peaceful, earthy finish.",
          "Grapeseed Oil is an excellent massage carrier because of its relatively lightweight texture and good spreadability. It allows the hands to glide comfortably over the abdomen without the extremely heavy or waxy finish of richer butters and balms.",
          "All-Natural Vitamin E provides antioxidant and skin-conditioning benefits while also helping protect the oils in the formula against oxidation."
        ]
      },
      {
        "title": "How to use",
        "paragraphs": [
          "Apply a small amount to the lower abdomen and gently massage using slow, circular motions. It can also be massaged into the lower back as part of your self-care routine. Use as desired during your menstrual cycle, following the dilution and usage limits established for your finished formula."
        ]
      },
      {
        "title": "Before using",
        "paragraphs": [
          "For external use only. Do not apply to broken or irritated skin, and discontinue use if irritation occurs."
        ]
      }
    ],
    "details": [
      "The blend was chosen to combine relaxing aromatherapy with the comfort of gentle massage. There is some clinical research suggesting that abdominal massage with certain essential-oil blends may help with menstrual discomfort, although the evidence is limited and the specific formulas studied are not identical to yours.",
      "Geranium Essential Oil gives the blend its fresh, green-floral character. It works particularly well alongside lavender and chamomile, adding a balancing botanical note without making the finished oil overly sweet or perfume-like.",
      "Lavender Essential Oil provides a soft floral and herbaceous aroma and forms much of the relaxing character of the blend. It makes this oil especially suited to quiet self-care, rest, and gentle massage when you want to unwind.",
      "Roman Chamomile Essential Oil adds a delicate, sweet, herbaceous aroma. Its gentle aromatic character pairs beautifully with lavender and helps give the blend its comforting, calming profile.",
      "Frankincense Essential Oil grounds the lighter floral notes with a warm, resinous and slightly woody aroma. It gives the blend greater depth and creates a peaceful, earthy finish.",
      "Grapeseed Oil is an excellent massage carrier because of its relatively lightweight texture and good spreadability. It allows the hands to glide comfortably over the abdomen without the extremely heavy or waxy finish of richer butters and balms.",
      "All-Natural Vitamin E provides antioxidant and skin-conditioning benefits while also helping protect the oils in the formula against oxidation.",
      "Apply a small amount to the lower abdomen and gently massage using slow, circular motions. It can also be massaged into the lower back as part of your self-care routine. Use as desired during your menstrual cycle, following the dilution and usage limits established for your finished formula.",
      "For external use only. Do not apply to broken or irritated skin, and discontinue use if irritation occurs."
    ],
    "note": "",
    "use": "Apply a small amount to the lower abdomen and gently massage using slow, circular motions. It can also be massaged into the lower back as part of your self-care routine. Use as desired during your menstrual cycle, following the dilution and usage limits established for your finished formula.",
    "safety": "For external use only. Do not apply to broken or irritated skin, and discontinue use if irritation occurs.",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/balanced-botanical-oil.jpg",
    "imageNote": null,
    "art": "roller",
    "tone": "#d5dfd6",
    "accent": "#456b59",
    "featured": false
  },
  {
    "id": "lavender-bloom-scrub",
    "category": "sugar-scrubs",
    "name": "Lavender Bloom",
    "kicker": "Just B Scrubbed",
    "description": "A rich, naturally exfoliating body scrub crafted with organic cane sugar, unrefined shea butter, organic jojoba, rosehip, and castor oils, vitamin E, and a botanical essential-oil blend. This formula combines physical exfoliation with rich emollients that leave the skin feeling soft, conditioned, moisturized, and noticeably smoother.",
    "cardDescription": "A rich, naturally exfoliating body scrub with organic cane sugar, unrefined shea butter, and organic jojoba, rosehip, and castor oils.",
    "ingredients": [
      "Organic Cane Sugar, Unrefined Shea Butter, Organic Jojoba Oil, Organic Rosehip Oil, Organic Castor Oil, Arrowroot Powder, All-Natural Vitamin E, Organic Essential Oils (Lavender, Grapefruit, Geranium, Frankincense)."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A rich, naturally exfoliating body scrub crafted with organic cane sugar, unrefined shea butter, organic jojoba, rosehip, and castor oils, vitamin E, and a botanical essential-oil blend. This formula combines physical exfoliation with rich emollients that leave the skin feeling soft, conditioned, moisturized, and noticeably smoother.",
          "Organic Cane Sugar provides the exfoliating action. The sugar crystals physically lift away dry, flaky surface skin as they're massaged over the body, helping improve the immediate appearance and texture of rough areas. As the sugar dissolves with water, the scrub gradually becomes gentler during use.",
          "Unrefined Shea Butter gives this scrub its rich, nourishing character. Shea butter contains a mixture of fatty acids and naturally occurring unsaponifiable compounds that make it an effective emollient. It helps soften and condition dry skin while leaving behind a protective, moisturized feel after rinsing.",
          "Organic Jojoba Oil is technically a liquid wax composed largely of wax esters. It provides excellent slip, allowing the sugar to glide over the skin rather than feeling excessively abrasive. It also conditions and softens the skin and complements the heavier shea and castor components.",
          "Organic Castor Oil adds richness and helps give the scrub its substantial, conditioning texture. It's a heavier emollient than jojoba, making it particularly useful in a body product intended for dry, rough-feeling areas such as elbows, knees, hands, and feet.",
          "Arrowroot Powder helps balance the richness of the oils and shea butter. It contributes a soft, silky texture and helps reduce some of the excessively oily feel that can come from an anhydrous scrub.",
          "All-Natural Vitamin E provides antioxidant benefits while conditioning the skin. It also serves a practical purpose within an oil-based formula by helping protect susceptible oils from oxidation."
        ]
      },
      {
        "title": "The essential oil blend",
        "paragraphs": [
          "The scent was designed to be floral, fresh, citrusy, and grounding, rather than overwhelmingly sweet.",
          "Lavender Essential Oil brings a soft floral-herbal aroma traditionally associated with calm and relaxation. It gives the scrub a soothing aromatic character that works especially well for an evening shower or self-care routine.",
          "Grapefruit Essential Oil provides the bright side of the blend: a fresh, lively citrus aroma that cuts through the heavier floral and earthy notes. It gives the scrub an uplifting, clean-smelling freshness.",
          "Geranium Essential Oil adds a sophisticated floral note with fresh, slightly green undertones. It bridges the bright grapefruit and soft lavender while giving the blend a more complex botanical character.",
          "Frankincense Essential Oil grounds everything with a warm, resinous, woody aroma. Rather than allowing the formula to smell predominantly floral, frankincense provides depth and an earthy finish.",
          "Together, the four create a beautifully balanced aroma: bright grapefruit first, soft lavender and geranium through the middle, and warm frankincense underneath."
        ]
      },
      {
        "title": "Benefits",
        "paragraphs": [
          "Exfoliates • Smooths • Softens • Moisturizes • Conditions • Refreshes",
          "Regular, gentle exfoliation can help keep areas prone to roughness feeling smoother, while the butter and oils help counteract the dry feeling that can follow exfoliation. For body scrubs, once or twice weekly is generally sufficient rather than daily scrubbing."
        ]
      },
      {
        "title": "How to use",
        "paragraphs": [
          "Apply a very small amount to damp skin using the spoon provided. Gently massage onto the body in circular motions, concentrating on dry or rough areas such as the arms, legs, elbows, knees, hands, and feet. Rinse thoroughly with warm water and gently pat skin dry.",
          "Use up to twice per week. Always use the spoon provided and keep water out of the jar to help maintain the freshness and quality of your scrub. Avoid using on the face, broken or irritated skin, or freshly shaved areas. Use caution in the shower or bath, as the oils may make surfaces slippery."
        ]
      }
    ],
    "details": [
      "Organic Cane Sugar provides the exfoliating action. The sugar crystals physically lift away dry, flaky surface skin as they're massaged over the body, helping improve the immediate appearance and texture of rough areas. As the sugar dissolves with water, the scrub gradually becomes gentler during use.",
      "Unrefined Shea Butter gives this scrub its rich, nourishing character. Shea butter contains a mixture of fatty acids and naturally occurring unsaponifiable compounds that make it an effective emollient. It helps soften and condition dry skin while leaving behind a protective, moisturized feel after rinsing.",
      "Organic Jojoba Oil is technically a liquid wax composed largely of wax esters. It provides excellent slip, allowing the sugar to glide over the skin rather than feeling excessively abrasive. It also conditions and softens the skin and complements the heavier shea and castor components.",
      "Organic Castor Oil adds richness and helps give the scrub its substantial, conditioning texture. It's a heavier emollient than jojoba, making it particularly useful in a body product intended for dry, rough-feeling areas such as elbows, knees, hands, and feet.",
      "Arrowroot Powder helps balance the richness of the oils and shea butter. It contributes a soft, silky texture and helps reduce some of the excessively oily feel that can come from an anhydrous scrub.",
      "All-Natural Vitamin E provides antioxidant benefits while conditioning the skin. It also serves a practical purpose within an oil-based formula by helping protect susceptible oils from oxidation.",
      "The scent was designed to be floral, fresh, citrusy, and grounding, rather than overwhelmingly sweet.",
      "Lavender Essential Oil brings a soft floral-herbal aroma traditionally associated with calm and relaxation. It gives the scrub a soothing aromatic character that works especially well for an evening shower or self-care routine.",
      "Grapefruit Essential Oil provides the bright side of the blend: a fresh, lively citrus aroma that cuts through the heavier floral and earthy notes. It gives the scrub an uplifting, clean-smelling freshness.",
      "Geranium Essential Oil adds a sophisticated floral note with fresh, slightly green undertones. It bridges the bright grapefruit and soft lavender while giving the blend a more complex botanical character.",
      "Frankincense Essential Oil grounds everything with a warm, resinous, woody aroma. Rather than allowing the formula to smell predominantly floral, frankincense provides depth and an earthy finish.",
      "Together, the four create a beautifully balanced aroma: bright grapefruit first, soft lavender and geranium through the middle, and warm frankincense underneath.",
      "Exfoliates • Smooths • Softens • Moisturizes • Conditions • Refreshes",
      "Regular, gentle exfoliation can help keep areas prone to roughness feeling smoother, while the butter and oils help counteract the dry feeling that can follow exfoliation. For body scrubs, once or twice weekly is generally sufficient rather than daily scrubbing.",
      "Apply a very small amount to damp skin using the spoon provided. Gently massage onto the body in circular motions, concentrating on dry or rough areas such as the arms, legs, elbows, knees, hands, and feet. Rinse thoroughly with warm water and gently pat skin dry.",
      "Use up to twice per week. Always use the spoon provided and keep water out of the jar to help maintain the freshness and quality of your scrub. Avoid using on the face, broken or irritated skin, or freshly shaved areas. Use caution in the shower or bath, as the oils may make surfaces slippery."
    ],
    "note": "",
    "use": "Apply a very small amount to damp skin using the spoon provided. Gently massage onto the body in circular motions, concentrating on dry or rough areas such as the arms, legs, elbows, knees, hands, and feet. Rinse thoroughly with warm water and gently pat skin dry. Use up to twice per week. Always use the spoon provided and keep water out of the jar to help maintain the freshness and quality of your scrub. Avoid using on the face, broken or irritated skin, or freshly shaved areas. Use caution in the shower or bath, as the oils may make surfaces slippery.",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/lavender-bloom-scrub.webp",
    "imageNote": null,
    "art": "jar",
    "tone": "#ead8c8",
    "accent": "#9a684f",
    "featured": true
  },
  {
    "id": "harvest-spa-scrub",
    "category": "sugar-scrubs",
    "name": "Harvest",
    "kicker": "Just B Scrubbed",
    "description": "A rich, refreshing sugar scrub that gently exfoliates dry, rough skin while nourishing it with unrefined shea butter, jojoba, rosehip, and castor oils, plus vitamin E. Sweet orange adds a bright citrus note, lavender brings a soft calming aroma, peppermint provides a fresh, cooling touch, and frankincense rounds out the blend with a warm, earthy finish. Skin is left feeling smooth, soft, moisturized, and refreshed.",
    "cardDescription": "A refreshing sugar scrub with organic cane sugar, unrefined shea butter, and organic jojoba, rosehip, and castor oils.",
    "ingredients": [
      "Organic Cane Sugar, Unrefined Shea Butter, Organic Jojoba Oil, Organic Rosehip Oil, Organic Castor Oil, Arrowroot Powder, All-Natural Vitamin E, Organic Essential Oils (Sweet Orange, Lavender, Peppermint, Frankincense)."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A rich, refreshing sugar scrub that gently exfoliates dry, rough skin while nourishing it with unrefined shea butter, jojoba, rosehip, and castor oils, plus vitamin E. Sweet orange adds a bright citrus note, lavender brings a soft calming aroma, peppermint provides a fresh, cooling touch, and frankincense rounds out the blend with a warm, earthy finish. Skin is left feeling smooth, soft, moisturized, and refreshed."
        ]
      },
      {
        "title": "How to use",
        "paragraphs": [
          "Massage a small amount onto damp skin using gentle circular motions, then rinse well with warm water. Use up to twice a week. Avoid the face, broken or irritated skin, and freshly shaved areas."
        ]
      }
    ],
    "details": [
      "Massage a small amount onto damp skin using gentle circular motions, then rinse well with warm water. Use up to twice a week. Avoid the face, broken or irritated skin, and freshly shaved areas."
    ],
    "note": "",
    "use": "Massage a small amount onto damp skin using gentle circular motions, then rinse well with warm water. Use up to twice a week. Avoid the face, broken or irritated skin, and freshly shaved areas.",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/harvest-spa-scrub.jpg",
    "imageNote": null,
    "art": "jar",
    "tone": "#ead8c8",
    "accent": "#9a684f",
    "featured": false
  },
  {
    "id": "vanilla-scrub",
    "category": "sugar-scrubs",
    "name": "Vanilla",
    "kicker": "Just B Scrubbed",
    "description": "A simple, luxurious scrub made with organic cane sugar infused with Madagascar vanilla bean. Unrefined shea butter, jojoba, rosehip, and castor oils complement the exfoliating sugar base, while vanilla oleoresin creates a warm, creamy, true-vanilla aroma without synthetic fragrance.",
    "cardDescription": "A luxurious cane-sugar scrub infused with Madagascar vanilla bean and nourishing botanical oils.",
    "ingredients": [
      "Organic cane sugar infused with Madagascar vanilla bean, unrefined shea butter, organic jojoba oil, organic rosehip oil, all-natural castor oil, arrowroot powder, vitamin E, vanilla oleoresin."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "Organic cane sugar infused with Madagascar vanilla bean gently exfoliates, while unrefined shea butter and jojoba, rosehip, and castor oils help leave skin feeling soft and moisturized.",
          "Vanilla oleoresin creates a warm, creamy, true-vanilla aroma without synthetic fragrance."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/vanilla-scrub.jpg",
    "imageNote": null,
    "art": "jar",
    "tone": "#ead8c8",
    "accent": "#9a684f",
    "featured": false
  },
  {
    "id": "just-b-rested-room-spray",
    "category": "home-linen",
    "name": "Linen Room Spray",
    "kicker": "Just B Rested",
    "description": "A naturally aromatic room and linen spray created with distilled witch hazel, organic witch hazel extract, distilled water, and pure steam-distilled essential oils. Designed as a simple alternative to heavily perfumed conventional room sprays, this blend fills your space with a soft, calming botanical aroma without synthetic fragrance.",
    "cardDescription": "A naturally aromatic room and linen spray created with distilled witch hazel, organic witch hazel extract, distilled water, and pure steam-distilled essential oils.",
    "ingredients": [
      "All-Natural Distilled Witch Hazel (Containing 14% Natural Grain Alcohol), Organic Witch Hazel Extract, Distilled Water, Steam-Distilled Essential Oils (Lavender, Cedarwood, Frankincense)."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A naturally aromatic room and linen spray created with distilled witch hazel, organic witch hazel extract, distilled water, and pure steam-distilled essential oils. Designed as a simple alternative to heavily perfumed conventional room sprays, this blend fills your space with a soft, calming botanical aroma without synthetic fragrance.",
          "Lavender Essential Oil forms the calming heart of the blend. Its soft floral and herbaceous aroma is traditionally associated with relaxation and tranquility, making it particularly well suited for bedrooms, pillows, linens, and evening routines.",
          "Cedarwood Essential Oil adds warmth and depth with its dry, woody, slightly earthy aroma. It balances lavender's floral character and gives the spray a cozy, grounded quality that works beautifully in bedrooms and living spaces.",
          "Frankincense Essential Oil completes the blend with a warm, resinous and subtly earthy aroma. It adds depth without overpowering the lavender and cedarwood, creating a more sophisticated, peaceful scent.",
          "Distilled Witch Hazel acts as the base for the spray and contains 14% naturally derived grain alcohol. It helps create a light, quick-drying mist and assists in dispersing the aromatic ingredients throughout the formula.",
          "Organic Witch Hazel Extract complements the distilled witch hazel and keeps the formula rooted in simple, botanical ingredients.",
          "Distilled Water creates a light mist that allows the fragrance to gently settle throughout a room and onto suitable fabrics rather than producing a heavy, oily spray."
        ]
      },
      {
        "title": "The aroma",
        "paragraphs": [
          "Calming • Woody • Earthy • Botanical • Soft",
          "Lavender provides the gentle floral opening, cedarwood brings a warm woody heart, and frankincense leaves behind a subtle, grounding finish. The result is intentionally soft and natural rather than perfume-heavy.",
          "This spray is particularly suited to bedrooms and nighttime routines, but can be used throughout the home on suitable linens, bedding, curtains, cushions, or simply misted into the air whenever you want to refresh a space."
        ]
      },
      {
        "title": "How to use",
        "paragraphs": [
          "Shake well before each use. Lightly mist into the air or onto suitable fabrics from a short distance. For bedtime, mist lightly over pillows and bedding and allow them to dry before use. Use as desired to refresh bedrooms, living spaces and linens."
        ]
      },
      {
        "title": "Before using",
        "paragraphs": [
          "For external and fabric use only. Do not ingest. Avoid spraying directly onto the face, eyes, skin, pets, food, or polished surfaces. Always spot-test fabrics in an inconspicuous area first, particularly delicate or light-coloured materials. Keep out of reach of children and pets."
        ]
      }
    ],
    "details": [
      "Lavender Essential Oil forms the calming heart of the blend. Its soft floral and herbaceous aroma is traditionally associated with relaxation and tranquility, making it particularly well suited for bedrooms, pillows, linens, and evening routines.",
      "Cedarwood Essential Oil adds warmth and depth with its dry, woody, slightly earthy aroma. It balances lavender's floral character and gives the spray a cozy, grounded quality that works beautifully in bedrooms and living spaces.",
      "Frankincense Essential Oil completes the blend with a warm, resinous and subtly earthy aroma. It adds depth without overpowering the lavender and cedarwood, creating a more sophisticated, peaceful scent.",
      "Distilled Witch Hazel acts as the base for the spray and contains 14% naturally derived grain alcohol. It helps create a light, quick-drying mist and assists in dispersing the aromatic ingredients throughout the formula.",
      "Organic Witch Hazel Extract complements the distilled witch hazel and keeps the formula rooted in simple, botanical ingredients.",
      "Distilled Water creates a light mist that allows the fragrance to gently settle throughout a room and onto suitable fabrics rather than producing a heavy, oily spray.",
      "Calming • Woody • Earthy • Botanical • Soft",
      "Lavender provides the gentle floral opening, cedarwood brings a warm woody heart, and frankincense leaves behind a subtle, grounding finish. The result is intentionally soft and natural rather than perfume-heavy.",
      "This spray is particularly suited to bedrooms and nighttime routines, but can be used throughout the home on suitable linens, bedding, curtains, cushions, or simply misted into the air whenever you want to refresh a space.",
      "Shake well before each use. Lightly mist into the air or onto suitable fabrics from a short distance. For bedtime, mist lightly over pillows and bedding and allow them to dry before use. Use as desired to refresh bedrooms, living spaces and linens.",
      "For external and fabric use only. Do not ingest. Avoid spraying directly onto the face, eyes, skin, pets, food, or polished surfaces. Always spot-test fabrics in an inconspicuous area first, particularly delicate or light-coloured materials. Keep out of reach of children and pets."
    ],
    "note": "",
    "use": "Shake well before each use. Lightly mist into the air or onto suitable fabrics from a short distance. For bedtime, mist lightly over pillows and bedding and allow them to dry before use. Use as desired to refresh bedrooms, living spaces and linens.",
    "safety": "For external and fabric use only. Do not ingest. Avoid spraying directly onto the face, eyes, skin, pets, food, or polished surfaces. Always spot-test fabrics in an inconspicuous area first, particularly delicate or light-coloured materials. Keep out of reach of children and pets.",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/rested-room-spray.webp",
    "imageNote": null,
    "art": "spray",
    "tone": "#d9ded7",
    "accent": "#526b60",
    "featured": true
  },
  {
    "id": "solid-dish-soap",
    "category": "home-linen",
    "name": "Non-Toxic Solid Dish Soap",
    "kicker": "Just B Clean",
    "description": "A simple, effective solid dish soap made with thoughtfully selected ingredients for everyday kitchen cleaning. Saponified coconut and castor oils create a rich, cleansing lather, while citric acid and kaolin clay complement the formula. A long-lasting, zero-waste alternative to traditional liquid dish soap, paired with a reusable bamboo bristle brush for convenient, plastic-conscious cleaning.",
    "cardDescription": "A simple, effective solid dish soap made with thoughtfully selected ingredients for everyday kitchen cleaning.",
    "ingredients": [
      "Saponified Organic Coconut Oil, Saponified Organic Castor Oil, All-Natural Citric Acid, Kaolin Clay."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A simple, effective solid dish soap made with thoughtfully selected ingredients for everyday kitchen cleaning. Saponified coconut and castor oils create a rich, cleansing lather, while citric acid and kaolin clay complement the formula. A long-lasting, zero-waste alternative to traditional liquid dish soap, paired with a reusable bamboo bristle brush for convenient, plastic-conscious cleaning."
        ]
      },
      {
        "title": "How to use",
        "paragraphs": [
          "Wet the bamboo bristle brush and gently swirl it directly over the soap to create a lather. Scrub dishes, cookware, and utensils as needed, then rinse thoroughly with clean water. Allow both the soap and brush to dry between uses to help them last longer."
        ]
      }
    ],
    "details": [
      "Wet the bamboo bristle brush and gently swirl it directly over the soap to create a lather. Scrub dishes, cookware, and utensils as needed, then rinse thoroughly with clean water. Allow both the soap and brush to dry between uses to help them last longer."
    ],
    "note": "",
    "use": "Wet the bamboo bristle brush and gently swirl it directly over the soap to create a lather. Scrub dishes, cookware, and utensils as needed, then rinse thoroughly with clean water. Allow both the soap and brush to dry between uses to help them last longer.",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/solid-dish-soap.webp",
    "imageNote": null,
    "art": "spray",
    "tone": "#d9ded7",
    "accent": "#526b60",
    "featured": true
  },
  {
    "id": "blue-cedar-soap",
    "category": "artisan-soap",
    "name": "Blue Cedar",
    "kicker": "Just B Clean",
    "description": "A simple, timeless bar made with nourishing oils, creamy coconut milk, and naturally derived indigo powder. Designed around a straightforward formula, this soap delivers a rich, creamy lather and a clean, uncomplicated wash for everyday use. A classic with a gentle woody scent, perfect for anyone who appreciates simple ingredients and an understated, natural aroma.",
    "cardDescription": "A simple, timeless coconut-milk bar with naturally derived indigo and a gentle cedarwood scent.",
    "ingredients": [
      "Saponified oils (organic olive oil, shea butter, organic coconut oil, castor oil), organic coconut milk, steam-distilled cedarwood essential oil, indigo powder."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A simple, timeless bar made with nourishing oils, creamy coconut milk, and naturally derived indigo powder. Designed around a straightforward formula, this soap delivers a rich, creamy lather and a clean, uncomplicated wash for everyday use.",
          "A classic with a gentle woody scent and creamy lather, perfect for anyone who appreciates simple ingredients and an understated, natural aroma."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-blue-cedar.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "chamomile-soap",
    "category": "artisan-soap",
    "name": "Chamomile",
    "kicker": "Just B Clean",
    "description": "A soft, nurturing bar crafted with chamomile-infused organic olive oil, shea butter, coconut oil, castor oil, and creamy organic coconut milk. Turmeric lends a warm natural hue, while steam-distilled sweet orange and frankincense essential oils create a subtle citrus-resinous scent. Dried chamomile flowers finish each bar with a simple botanical detail.",
    "cardDescription": "A nurturing chamomile-infused bar with coconut milk, turmeric, sweet orange, frankincense, and dried chamomile flowers.",
    "ingredients": [
      "Saponified oils (organic olive oil infused with dried chamomile flower buds, shea butter, organic coconut oil, castor oil), organic coconut milk, turmeric powder, steam-distilled essential oils (sweet orange, frankincense), dried chamomile flowers for décor."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A soft, nurturing bar crafted with chamomile-infused organic olive oil, shea butter, coconut oil, castor oil, and creamy organic coconut milk.",
          "Turmeric lends a warm natural hue, while steam-distilled sweet orange and frankincense essential oils create a subtle citrus-resinous scent. Dried chamomile flowers finish each bar with a simple botanical detail."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-chamomile.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "forest-soap",
    "category": "artisan-soap",
    "name": "Forest",
    "kicker": "Just B Clean",
    "description": "A three-tone, forest-inspired bar made with organic olive oil, shea butter, coconut oil, and castor oil for a creamy everyday cleanse. Chlorella, cocoa, and kaolin powders create its earthy layers, while cedarwood, fir, frankincense, peppermint, and eucalyptus essential oils give it a crisp, fresh, grounding scent.",
    "cardDescription": "A three-tone forest bar with earthy botanical powders and a crisp blend of woodsy, minty essential oils.",
    "ingredients": [
      "Saponified oils (organic olive oil, shea butter, organic coconut oil, castor oil), steam-distilled essential oils (cedarwood, fir, frankincense, peppermint, eucalyptus), chlorella powder, cocoa powder, kaolin clay."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A three-tone, forest-inspired bar made with organic olive oil, shea butter, coconut oil, and castor oil for a creamy everyday cleanse.",
          "Chlorella, cocoa, and kaolin powders create its earthy layers, while cedarwood, fir, frankincense, peppermint, and eucalyptus essential oils give it a crisp, fresh, grounding scent."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-forest.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "ocean-soap",
    "category": "artisan-soap",
    "name": "Ocean",
    "kicker": "Just B Clean",
    "description": "A seaside-inspired bar made with organic olive oil, shea butter, coconut oil, and castor oil for a creamy wash. French green clay and indigo powder create its cool ocean hues, while Himalayan salt adds gentle texture. Lavender, cedarwood, and peppermint essential oils give it a fresh, airy scent.",
    "cardDescription": "A fresh seaside-inspired bar with green clay, indigo, Himalayan salt, lavender, cedarwood, and peppermint.",
    "ingredients": [
      "Saponified oils (organic olive oil, shea butter, organic coconut oil, castor oil), French green clay, steam-distilled essential oils (lavender, cedarwood, peppermint), indigo powder, Himalayan salt."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A seaside-inspired bar made with organic olive oil, shea butter, coconut oil, and castor oil for a creamy wash.",
          "French green clay and indigo powder create its cool ocean hues, while Himalayan salt adds gentle texture. Lavender, cedarwood, and peppermint essential oils give it a fresh, airy scent."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-ocean.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  },
  {
    "id": "rose-matter-soap",
    "category": "artisan-soap",
    "name": "Rose Madder",
    "kicker": "Just B Clean",
    "description": "A rustic dusty rose-coloured bar naturally tinted with madder root and enriched with organic coconut milk and raw honey. Clary sage brings a soft herbal-floral note, bergamot adds delicate citrus, and frankincense lends a warm, resinous finish. The result is earthy, elegant, and gently botanical.",
    "cardDescription": "A dusty rose botanical bar with coconut milk, raw honey, madder root, clary sage, bergamot, and frankincense.",
    "ingredients": [
      "Saponified oils (organic olive oil, shea butter, organic coconut oil, castor oil), organic coconut milk, organic raw honey, steam-distilled essential oils (clary sage, bergamot, frankincense), madder root powder."
    ],
    "sections": [
      {
        "title": "About this product",
        "paragraphs": [
          "A rustic dusty rose-coloured bar naturally tinted with madder root and enriched with organic coconut milk and raw honey.",
          "Clary sage brings a soft herbal-floral note, bergamot adds delicate citrus, and frankincense lends a warm, resinous finish. The result is earthy, elegant, and gently botanical."
        ]
      }
    ],
    "details": [],
    "note": "",
    "use": "",
    "safety": "",
    "availability": null,
    "price": null,
    "stock": null,
    "image": "images/catalog/soap-rose-matter.webp",
    "imageNote": null,
    "art": "bar",
    "tone": "#ded2bf",
    "accent": "#745f47",
    "featured": false
  }
];

const DEFAULT_PRICES = Object.freeze({
  "artisan-soap": 8,
  "sugar-scrubs": 20,
  "roller-oils": 15,
  "body-care": 25
});
PRODUCTS.forEach(product => {
  product.price = product.id === "just-b-rested-room-spray" ? 15
    : product.id === "solid-dish-soap" ? 20
    : DEFAULT_PRICES[product.category] ?? null;
});

const NAV_ITEMS = [
  ["index.html", "Home", "home"],
  ["shop.html", "Shop all", "shop"],
  ["artisan-soap.html", "Artisan soap", "artisan-soap"],
  ["sugar-scrubs.html", "Sugar scrubs", "sugar-scrubs"],
  ["roller-oils.html", "Botanical oils", "roller-oils"],
  ["body-care.html", "Body care", "body-care"],
  ["home-linen.html", "Home & linen", "home-linen"],
  ["about.html", "About", "about"],
  ["faq.html", "FAQ", "faq"]
];

const currentPage = document.body.dataset.page || "";
const ORDER_STORAGE_KEY = "just-b-naturals-order-list-v1";
const ORDER_NOTES_KEY = "just-b-naturals-order-notes-v1";
const ORDER_COOKIE_KEY = "just-b-naturals-cart";
const generalOrderUrl = `mailto:${STORE.orderEmail}?subject=${encodeURIComponent("Product order inquiry")}`;

const CATEGORY_LABELS = Object.freeze({
  "artisan-soap": "Artisan Soaps",
  "sugar-scrubs": "Sugar Scrubs",
  "roller-oils": "Botanical Oils",
  "body-care": "Body Care",
  "home-linen": "Home & Linen"
});

function productPageUrl(productOrId) {
  const id = typeof productOrId === "string" ? productOrId : productOrId.id;
  return `product-${encodeURIComponent(id)}.html`;
}

function formatPrice(price) {
  return Number.isFinite(price) ? new Intl.NumberFormat(campaignLanguage === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(price) : "";
}

function completeEmail(value) {
  return String(value || "").length <= 160 && /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(value || "").trim());
}

function formatReadyDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString(globalThis.JBN_FR?.isFrench ? "fr-CA" : "en-CA", { month: "long", day: "numeric", year: "numeric" });
}

function productAvailabilityText(product) {
  if (product.availabilityStatus === "preorder") return product.availableDate ? `Preorder • Available ${formatReadyDate(product.availableDate)}` : "Preorder";
  if (product.stock === 0) return "Out of stock";
  if (product.availabilityStatus === "unavailable" || product.active === false) return "Currently unavailable";
  if (Number.isInteger(product.stock)) return `${product.stock} in stock`;
  return product.availability || "";
}

function productAvailabilityMarkup(product) {
  if (product.availabilityStatus === "preorder" && product.availableDate) {
    return `<span class="stock-status-kind">Preorder</span><span class="stock-status-date">Available ${escapeHtml(formatReadyDate(product.availableDate))}</span>`;
  }
  return escapeHtml(productAvailabilityText(product));
}

function availabilitySummary(products) {
  const available = products.filter(product => product.active !== false && product.availabilityStatus !== "unavailable" && product.availabilityStatus !== "preorder" && product.stock !== 0).length;
  const preorder = products.filter(product => product.active !== false && product.availabilityStatus === "preorder").length;
  const parts = [];
  if (available) parts.push(`${available} product${available === 1 ? "" : "s"} available`);
  if (preorder) parts.push(`${preorder} available for preorder`);
  return parts.length ? parts.join(" • ") : "No products currently available";
}

function updateAvailabilitySummaries() {
  document.querySelectorAll("[data-category-summary]").forEach(node => {
    const category = node.dataset.categorySummary;
    const visibleIds = String(node.dataset.visibleProductIds || "").split(",").filter(Boolean);
    const products = visibleIds.length || node.hasAttribute("data-visible-product-ids")
      ? visibleIds.map(id => PRODUCTS.find(product => product.id === id)).filter(Boolean)
      : category === "all" ? PRODUCTS : PRODUCTS.filter(product => product.category === category);
    node.textContent = availabilitySummary(products);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function orderLineKey(itemOrId) {
  return typeof itemOrId === "string" ? itemOrId : itemOrId.id;
}

function findOrderLine(productId) {
  return orderList.find(item => item.id === productId);
}

function readOrderCookie() {
  try {
    const prefix = `${ORDER_COOKIE_KEY}=`;
    const entry = document.cookie.split("; ").find(value => value.startsWith(prefix));
    return entry ? JSON.parse(decodeURIComponent(entry.slice(prefix.length))) : [];
  } catch (_) {
    return [];
  }
}

function writeOrderCookie(items) {
  try {
    const value = encodeURIComponent(JSON.stringify(items));
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${ORDER_COOKIE_KEY}=${value}; Max-Age=2592000; Path=/; SameSite=Lax${secure}`;
  } catch (_) {
    // The in-memory cart still works if cookies are unavailable.
  }
}

function loadOrderList() {
  let saved = [];
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    saved = stored === null ? readOrderCookie() : JSON.parse(stored);
  } catch (_) {
    saved = readOrderCookie();
  }
  if (!Array.isArray(saved)) return [];
  return saved
    .filter(item => PRODUCTS.some(product => product.id === item.id))
    .map(item => ({
      id: item.id,
      quantity: Math.min(99, Math.max(1, Number(item.quantity) || 1))
    }));
}

function loadOrderNotes() {
  try {
    return localStorage.getItem(ORDER_NOTES_KEY) || "";
  } catch (_) {
    return "";
  }
}

let orderList = loadOrderList();
let orderNotes = loadOrderNotes();
let orderDrawerOpener = null;

function saveOrderList() {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderList));
    localStorage.setItem(ORDER_NOTES_KEY, orderNotes);
  } catch (_) {
    // The cookie fallback below keeps the cart between pages.
  }
  writeOrderCookie(orderList);
}

function orderItemCount() {
  return orderList.reduce((total, item) => total + item.quantity, 0);
}

function cartPricing(items = orderList) {
  return priceOrder(items.map(item => {
    const product=PRODUCTS.find(p=>p.id===item.id);
    return {id:item.id,quantity:item.quantity,priceCents:Math.round((product?.price||0)*100)};
  }),soapCampaign);
}
function cartSubtotalCents() { return cartPricing().itemSubtotalCents; }
function promotionMessage(pricing) {
  if (!pricing.active) return "";
  if (!pricing.qualifyingPairs) return pricing.eligibleQuantity===1?t("Add one more artisan soap to unlock 2 for $14.","Ajoutez un savon artisanal pour obtenir 2 savons pour 14 $.").replace('14',String(soapCampaign.pairPriceCents/100)):"";
  return `${t("October soap offer applied")} · ${t("Just B will donate","Just B versera")} ${formatPrice(pricing.donationCommitmentCents/100)} ${t("to Ruban Rose after payment. No extra charge.","au Ruban Rose après paiement. Aucun supplément.")}`;
}
function updateCheckoutTotals() {
  const form = document.querySelector("[data-checkout-form]");
  const pricing=cartPricing();
  const subtotal = pricing.itemSubtotalCents;
  document.querySelectorAll("[data-promotion-row]").forEach(node=>{node.hidden=!pricing.qualifyingPairs;});
  document.querySelectorAll("[data-promotion-discount]").forEach(node=>{node.textContent=`−${formatPrice(pricing.discountCents/100)}`;});
  document.querySelectorAll("[data-promotion-message]").forEach(node=>{node.textContent=promotionMessage(pricing);node.hidden=!node.textContent;});
  document.querySelectorAll("[data-cart-total]").forEach(node=>{node.textContent=formatPrice(subtotal/100);});
  const deliverySelected = form?.elements.fulfillment?.value === "delivery";
  const deliveryDistance = Number(form?.elements.deliveryDistanceKm?.value);
  const hasConfirmedAddress = deliverySelected && Number.isFinite(deliveryDistance) && deliveryDistance > 0 && deliveryDistance <= LOCAL_DELIVERY_MAX_KM;
  const deliveryFee = hasConfirmedAddress ? (subtotal >= FREE_DELIVERY_THRESHOLD_CENTS ? 0 : LOCAL_DELIVERY_FEE_CENTS) : 0;
  if (form?.elements.deliveryFeeCents) form.elements.deliveryFeeCents.value = hasConfirmedAddress ? String(deliveryFee) : "";
  document.querySelectorAll("[data-checkout-subtotal]").forEach(node => { node.textContent = formatPrice(pricing.regularSubtotalCents / 100); });
  document.querySelectorAll("[data-checkout-delivery-row]").forEach(node => { node.hidden = !deliverySelected; });
  document.querySelectorAll("[data-checkout-delivery]").forEach(node => { node.textContent = hasConfirmedAddress ? (deliveryFee === 0 ? t("Free","Gratuit") : formatPrice(deliveryFee / 100)) : t("Select an address"); });
  document.querySelectorAll("[data-checkout-total]").forEach(node => { node.textContent = hasConfirmedAddress || !deliverySelected ? formatPrice((subtotal + (hasConfirmedAddress ? deliveryFee : 0)) / 100) : t("Pending address"); });
}

function buildOrderSummary(details = {}) {
  const selectedItems = Array.isArray(details.items) ? details.items : orderList;
  const lines = selectedItems.map((item, index) => {
    const product = PRODUCTS.find(candidate => candidate.id === item.id);
    if (!product) return "";
    return `${index + 1}. ${product.name}\n   Quantity: ${item.quantity}${Number.isFinite(product.price) ? `\n   Line total: ${formatPrice(product.price * item.quantity)}` : ""}`;
  }).filter(Boolean);

  const pricing=cartPricing(selectedItems);
  const subtotalCents=pricing.itemSubtotalCents;
  const deliveryFeeCents = Number.isInteger(details.deliveryFeeCents) ? details.deliveryFeeCents : 0;

  const customerLines = details.email ? [
    `Customer: ${[details.firstName, details.lastName].filter(Boolean).join(" ")}`,
    `Email: ${details.email}`,
    details.phone ? `Phone: ${details.phone}` : "",
    details.area ? `Area: ${details.area}` : "",
    details.deliveryAddress ? `Delivery address: ${details.deliveryAddress}` : "",
    Number.isFinite(details.deliveryDistanceKm) ? `Estimated driving distance: ${details.deliveryDistanceKm.toFixed(1)} km` : "",
    Number.isInteger(details.deliveryFeeCents) ? `Local delivery: ${details.deliveryFeeCents === 0 ? "Free" : `${formatPrice(details.deliveryFeeCents / 100)} CAD`}` : "",
    `Fulfillment: ${details.fulfillment === "delivery" ? "Local delivery" : "Local pickup"}`,
    `Payment: ${details.payment === "cash" ? "Cash" : "Interac e-Transfer"}`,
    details.marketingConsent ? "Promotional emails: Yes, consent given" : "Promotional emails: No"
  ].filter(Boolean) : [];

  return [
    `Hello ${STORE.name},`,
    "",
    details.email ? "A guest order request was submitted:" : "I would like to request:",
    ...(customerLines.length ? ["", ...customerLines] : []),
    "",
    lines.join("\n\n"),
    "",
    `Products subtotal: ${formatPrice(pricing.regularSubtotalCents / 100)}`,
    ...(pricing.qualifyingPairs?[`October soap offer: −${formatPrice(pricing.discountCents/100)}`,`Business donation commitment after payment: ${formatPrice(pricing.donationCommitmentCents/100)} to Ruban Rose (no customer charge)`]:[]),
    `Subtotal after promotion: ${formatPrice(subtotalCents/100)}`,
    ...(details.fulfillment === "delivery" ? [Number.isInteger(details.deliveryFeeCents) ? `Estimated delivery: ${formatPrice(deliveryFeeCents / 100)}` : "Estimated delivery: pending address", `Estimated order total: ${formatPrice((subtotalCents + deliveryFeeCents) / 100)}`] : [`Estimated order total: ${formatPrice(subtotalCents / 100)}`]),
    "",
    details.notes?.trim() ? `Notes:\n${details.notes.trim()}\n` : (orderNotes.trim() ? `Notes:\n${orderNotes.trim()}\n` : "Notes:\n"),
    "",
    "I understand this is a request only and I will wait for confirmation before paying.",
    "",
    "Please confirm availability and pickup or delivery details. Thank you!"
  ].join("\n");
}

function fullOrderEmailUrl() {
  if (!orderList.length) return generalOrderUrl;
  const count = orderItemCount();
  const subject = `Order request – ${count} item${count === 1 ? "" : "s"}`;
  return `mailto:${STORE.orderEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildOrderSummary())}`;
}

function navMarkup(mobile = false) {
  return NAV_ITEMS.map(([href, label, page]) => `<a href="${href}"${currentPage === page ? ' class="active" aria-current="page"' : ""}>${t(label)}${mobile ? "<span>→</span>" : ""}</a>`).join("");
}

function renderSiteChrome() {
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");

  if (header) header.innerHTML = `
    <div class="scroll-progress" aria-hidden="true"><span></span></div>
    <div class="announcement pink-announcement" data-pink-announcement hidden></div>
    <header class="site-header">
      <div class="shell header-inner">
        <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span><span></span></button>
        <a class="brand" href="index.html" aria-label="${STORE.name} home"><img class="brand-logo" src="images/just-b-logo.jpg" alt=""><span>JUST B<br>NATURAL</span></a>
        <nav class="desktop-nav" aria-label="Main navigation">${navMarkup()}</nav>
        <div class="header-actions"><a class="header-order header-order-instagram" href="${STORE.instagramUrl}" target="_blank" rel="noreferrer">Instagram</a><button class="header-order header-order-list" type="button" data-order-list-open>${t("Cart")} <span class="order-count" data-order-count>0</span></button></div>
      </div>
    </header>
    <nav class="mobile-category-nav" aria-label="Browse product categories">${navMarkup()}</nav>
    <aside class="mobile-menu" id="mobile-menu" aria-hidden="true"><div class="mobile-menu-top"><a class="mobile-menu-brand" href="index.html"><img src="images/just-b-logo.jpg" alt="Just B Natural"><strong>Browse Just B</strong></a><button type="button" aria-label="Close menu">&times;</button></div><nav>${navMarkup(true)}<a href="${STORE.instagramUrl}" target="_blank" rel="noreferrer">Follow @justb.naturals <span>↗</span></a></nav><div class="mobile-order-options"><button class="button button-order-list" type="button" data-order-list-open>View cart <span data-order-count>0</span></button></div></aside>
    <button class="menu-backdrop" type="button" aria-label="Close menu" hidden></button>
    <nav class="mobile-bottom-nav" aria-label="Quick navigation"><a href="index.html"><span aria-hidden="true">⌂</span>Home</a><a href="shop.html"><span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M6 8h12l1 12H5L6 8Zm3 1V6a3 3 0 0 1 6 0v3"/></svg></span>Products</a><a href="${STORE.instagramUrl}" target="_blank" rel="noreferrer"><span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="icon-fill" cx="17.5" cy="6.5" r="1"/></svg></span>Instagram</a><button type="button" data-order-list-open><span class="mobile-list-icon" aria-hidden="true">≡<b data-order-count>0</b></span>${t('Cart')}</button></nav>
    <button class="order-drawer-backdrop" type="button" aria-label="Close cart" data-order-list-close hidden></button>
    <aside class="order-drawer" id="order-drawer" aria-hidden="true" aria-labelledby="order-drawer-title">
      <div class="order-drawer-header"><div><p class="eyebrow">${t('Your selections')}</p><h2 id="order-drawer-title">${t('Cart')}</h2></div><button class="order-drawer-close" type="button" aria-label="Close cart" data-order-list-close>&times;</button></div>
      <div class="order-drawer-body">
        <div class="order-empty" data-order-empty><span>＋</span><h3>${t('Your cart is empty')}</h3><p>Add a few favourites, then send an order request. Payment comes only after confirmation.</p><a class="button button-outline" href="shop.html">${t('Browse products')}</a></div>
        <div class="order-list-items" data-order-items></div>
      </div>
      <div class="order-drawer-footer" data-order-footer hidden><dl class="pink-cart-totals"><div><dt>${t("Products subtotal")}</dt><dd data-checkout-subtotal></dd></div><div data-promotion-row hidden><dt>${t("October soap offer applied")}</dt><dd data-promotion-discount></dd></div><div><dt>${t("Subtotal after promotion")}</dt><dd data-cart-total></dd></div></dl><p class="pink-cart-message" data-promotion-message aria-live="polite" hidden></p>
        <p class="order-confirmation-note">${t('No payment is taken now. Availability is confirmed before you pay.')}</p>
        <div class="order-send-options"><a class="button button-dark" href="checkout.html">Review request <span>→</span></a><a class="button button-outline" href="shop.html">${t('Keep shopping')}</a></div>
        <button class="clear-order-list" type="button" data-order-clear>${t('Clear cart')}</button>
      </div>
    </aside>
    <button class="order-list-fab" type="button" data-order-list-open hidden>${t("Cart")} <span data-order-count>0</span></button>
    <div class="order-toast" role="status" aria-live="polite" aria-atomic="true"></div>
    <dialog class="notify-dialog" data-notify-dialog aria-labelledby="notify-title">
      <form method="dialog" class="notify-dialog-close-form"><button type="submit" aria-label="Close notification form">×</button></form>
      <form class="notify-form" data-notify-form novalidate>
        <p class="eyebrow">One-time product update</p><h2 id="notify-title">Let me know when it’s ready</h2>
        <p>We’ll send one email when <strong data-notify-product-name>this product</strong> becomes available. No promotional emails are added from this request.</p>
        <input type="hidden" name="productId"><label for="notify-email">${t('Email address')}</label>
        <input id="notify-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="160" placeholder="you@example.com" required>
        <p class="notify-status" data-notify-status aria-live="polite"></p>
        <button class="button button-dark" type="submit">Notify me <span>→</span></button>
      </form>
    </dialog>`;

  if (footer) footer.innerHTML = `
    <section class="email-band newsletter-band"><div class="shell email-band-inner"><div><p class="eyebrow">Stay in the loop</p><h2>Small-batch news,<br>sent occasionally.</h2></div><form class="newsletter-form" data-newsletter-form><label for="newsletter-email">Email address</label><div class="newsletter-row"><input id="newsletter-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="160" pattern="[^@ ]+@[^@ ]+[.][A-Za-z]{2,}" title="Enter a complete email address, such as name@example.com." placeholder="you@example.com" required><button class="button button-light" type="submit">Join the list</button></div><label class="consent-check"><input name="consent" type="checkbox" required><span>I agree to receive occasional promotions from Just B Natural. I can unsubscribe anytime.</span></label><p class="newsletter-status" data-newsletter-status aria-live="polite"></p></form></div></section>
    <footer><div class="shell footer-grid"><div class="footer-brand"><a class="brand brand-light" href="index.html"><img class="brand-logo footer-logo" src="images/just-b-logo.jpg" alt=""><span>JUST B<br>NATURAL</span></a><p>Small-batch, handcrafted soaps and natural care made in Gatineau, Québec.</p></div><div><h2>Explore</h2><a href="shop.html">All products</a><a href="artisan-soap.html">Artisan soaps</a><a href="sugar-scrubs.html">Sugar scrubs</a><a href="roller-oils.html">Botanical oils</a><a href="body-care.html">Body care</a><a href="home-linen.html">Home & linen</a><a href="faq.html">Ingredients & FAQ</a></div><div><h2>Connect</h2><a href="checkout.html">Request an order</a><a href="${STORE.instagramUrl}" target="_blank" rel="noreferrer">Follow @justb.naturals ↗</a><a href="mailto:${STORE.orderEmail}">${STORE.orderEmail}</a><a href="privacy.html">Privacy</a></div></div><div class="shell footer-bottom"><p>© 2026 ${STORE.name}.</p><p>For external use only unless otherwise stated.</p></div></footer>
    <button class="back-to-top" type="button" aria-label="Back to top">↑</button>`;
}

function fallbackArtMarkup(product) {
  if (product.art === "roller") return `<div class="art-object roller-object"><span class="roller-cap"></span><span class="art-label">${product.name.split(" ")[0]}</span></div>`;
  if (product.art === "dish") return `<div class="art-object dish-object"><span class="dish-brush"></span><span class="art-label">${product.label || "Dish Soap"}</span></div>`;
  if (product.art === "tin") return `<div class="art-object tin-object"><span class="art-label">Vanilla<br>Balm</span></div>`;
  if (product.art === "bar") return `<div class="art-object bar-object"><span class="art-label">${product.label || "Natural Soap"}</span></div>`;
  if (product.art === "spray") return `<div class="art-object spray-object"><span class="spray-nozzle"></span><span class="art-label">Rested<br>Linen Spray</span></div>`;
  const jarLabel = product.category === "pantry" ? "Crêpe<br>Mix" : product.name.includes("Scrub") ? "Sugar<br>Scrub" : "Body<br>Butter";
  return `<div class="art-object jar-object"><span class="jar-lid"></span><span class="art-label">${jarLabel}</span></div>`;
}

const PRODUCT_IMAGE_POSITIONS = Object.freeze({
  "almond-milk-mocha-soap": "50% 69%",
  "blue-cedar-soap": "50% 91%",
  "chamomile-soap": "50% 93%",
  "mint-eucalyptus-spa-soap": "50% 93%",
  "forest-soap": "50% 93%",
  "coconut-lavender-soap": "50% 93%",
  "chocolate-pumpkin-pie-soap": "50% 58%",
  "harvest-spa-scrub": "50% 72%",
  "honey-oat-comfort-soap": "50% 93%",
  "ocean-soap": "50% 92%",
  "rose-matter-soap": "50% 92%",
  "spiced-banana-soap": "50% 93%",
  "sweater-weather-soap": "50% 76%",
  "just-b-calm": "50% 50%",
  "just-b-relieved": "50% 54%",
  "cycle-harmony": "50% 50%"
});

const ARTISAN_DISPLAY_ORDER = Object.freeze([
  "matcha-lavender-soap",
  "blue-cedar-soap",
  "rosemary-sage-soap",
  "chamomile-soap",
  "lemon-rosemary-soap",
  "forest-soap",
  "ember-ash-soap",
  "ocean-soap",
  "whisper-citrus-soap",
  "rose-matter-soap",
  "charcoal-blush-soap",
  "sweater-weather-soap",
  "cedar-eucalyptus-loofah-soap",
  "mint-eucalyptus-spa-soap",
  "lemongrass-lavender-soap",
  "spiced-banana-soap",
  "ylang-ylang-soap",
  "coconut-lavender-soap",
  "unscented-loofah-soap",
  "honey-oat-comfort-soap",
  "cedar-lemon-soap",
  "chocolate-pumpkin-pie-soap",
  "almond-milk-mocha-soap"
]);

function productImageStyle(product) {
  return `object-position:${PRODUCT_IMAGE_POSITIONS[product.id] || "50% 50%"}`;
}

function artMarkup(product) {
  return `<img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" style="${productImageStyle(product)}"><div class="art-fallback" hidden>${fallbackArtMarkup(product)}</div>${product.imageNote ? `<span class="photo-note">${product.imageNote}</span>` : ""}<span class="product-image-tagline" aria-hidden="true">Pure · Natural · Handcrafted</span>`;
}

function productCard(product) {
  const availabilityText = productAvailabilityText(product);
  const availability = availabilityText ? `<p class="stock-status${product.availabilityStatus === "preorder" ? " is-preorder" : ""}" data-stock-product="${product.id}">${productAvailabilityMarkup(product)}</p>` : `<p class="stock-status" data-stock-product="${product.id}" hidden></p>`;
  return `<article class="product-card" data-product-id="${product.id}" style="--tone:${product.tone};--accent:${product.accent}">
    <a class="product-art" href="${productPageUrl(product)}" aria-label="View ${product.name}"><span class="art-ring"></span>${artMarkup(product)}<span class="image-hint">View product</span></a>
    <div class="product-copy">
      <p class="product-kicker">${product.kicker}</p>
      <div class="product-title-row"><h2><a href="${productPageUrl(product)}">${product.name}</a></h2>${Number.isFinite(product.price) ? `<span class="product-price">${formatPrice(product.price)}</span>` : ""}</div>
      <p class="product-description">${product.cardDescription || product.description}</p>
      ${availability}
      <div class="product-order-options"><button class="button button-dark add-order-button" type="button" data-add-order="${product.id}">${product.availabilityStatus === "preorder" ? t("Preorder") : t("Add to cart")} <span>＋</span></button><button class="notify-product-button" type="button" data-notify-product="${product.id}" hidden>Notify me when available</button><a class="product-detail-link" href="${productPageUrl(product)}">${t("View full details")}</a></div>
    </div>
  </article>`;
}

function activateImageFallbacks(scope = document) {
  scope.querySelectorAll(".product-image").forEach(image => {
    image.addEventListener("error", () => {
      image.hidden = true;
      const fallback = image.nextElementSibling;
      if (fallback) fallback.hidden = false;
    }, { once: true });
  });
}

function renderProductGrid(grid, matches) {
  grid.innerHTML = matches.map(productCard).join("");
  grid.dataset.productIds = matches.map(product => product.id).join(",");
  const count = grid.closest("section")?.querySelector("[data-product-count]");
  if (count?.hasAttribute("data-category-summary")) {
    count.dataset.visibleProductIds = matches.map(product => product.id).join(",");
    count.textContent = availabilitySummary(matches);
  } else if (count) {
    count.textContent = `${matches.length} product${matches.length === 1 ? "" : "s"}`;
  }
  const empty = grid.closest("section")?.querySelector("[data-catalog-empty]");
  if (empty) empty.hidden = matches.length !== 0;
  activateImageFallbacks(grid);
  observeRevealItems(grid);
  if (STORE.orderListEnabled) renderOrderList();
}

function renderCatalogues() {
  document.querySelectorAll("[data-catalog], [data-category]").forEach(grid => {
    const category = grid.dataset.category;
    const catalogue = grid.dataset.catalog;
    let matches = PRODUCTS;
    if (category) matches = PRODUCTS.filter(product => product.category === category);
    if (catalogue === "featured") matches = featuredProducts();
    renderProductGrid(grid, matches);
    if (catalogue === "featured") initializeFeaturedCarousel(grid);
  });
}

function featuredProducts() {
  return PRODUCTS
    .filter(product => product.active !== false && product.availabilityStatus !== "preorder" && product.availabilityStatus !== "unavailable" && product.stock !== 0)
    .sort(() => Math.random() - .5);
}

function initializeFeaturedCarousel(grid) {
  if (typeof grid._featuredCarouselCleanup === "function") grid._featuredCarouselCleanup();
  grid.classList.add("featured-carousel");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const originals = [...grid.querySelectorAll(":scope > .product-card")];
  if (originals.length < 2 || grid.scrollWidth <= grid.clientWidth) return;
  const clones = originals.map(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a, button, input, select, textarea").forEach(control => control.setAttribute("tabindex", "-1"));
    grid.append(clone);
    return clone;
  });
  let paused = false;
  let resumeTimer = 0;
  let frame = 0;
  let previousTime = 0;
  let position = grid.scrollLeft;
  const tick = time => {
    if (!paused && previousTime) {
      const elapsed = Math.min(time - previousTime, 40);
      const speed = window.matchMedia("(max-width: 620px)").matches ? .034 : .027;
      position += elapsed * speed;
      const loopWidth = clones[0].offsetLeft - originals[0].offsetLeft;
      if (loopWidth > 0 && position >= loopWidth) position -= loopWidth;
      grid.scrollLeft = position;
    }
    previousTime = time;
    frame = requestAnimationFrame(tick);
  };
  const pause = () => {
    window.clearTimeout(resumeTimer);
    paused = true;
    position = grid.scrollLeft;
  };
  const resume = () => {
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      paused = false;
      position = grid.scrollLeft;
      previousTime = performance.now();
    }, 900);
  };
  const syncPosition = () => { if (paused) position = grid.scrollLeft; };
  const handleVisibility = () => { if (document.hidden) pause(); else resume(); };
  grid.addEventListener("focusin", pause);
  grid.addEventListener("focusout", resume);
  grid.addEventListener("pointerdown", pause);
  grid.addEventListener("pointerup", resume);
  grid.addEventListener("pointercancel", resume);
  grid.addEventListener("touchstart", pause, { passive: true });
  grid.addEventListener("touchend", resume, { passive: true });
  grid.addEventListener("scroll", syncPosition, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  frame = requestAnimationFrame(tick);
  grid._featuredCarouselCleanup = () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(resumeTimer);
    grid.removeEventListener("focusin", pause);
    grid.removeEventListener("focusout", resume);
    grid.removeEventListener("pointerdown", pause);
    grid.removeEventListener("pointerup", resume);
    grid.removeEventListener("pointercancel", resume);
    grid.removeEventListener("touchstart", pause);
    grid.removeEventListener("touchend", resume);
    grid.removeEventListener("scroll", syncPosition);
    document.removeEventListener("visibilitychange", handleVisibility);
    clones.forEach(clone => clone.remove());
    delete grid._featuredCarouselCleanup;
  };
}

function orderItemMarkup(item) {
  const product = PRODUCTS.find(candidate => candidate.id === item.id);
  if (!product) return "";
  const key = orderLineKey(item);
  return `<article class="order-list-item" data-order-item="${escapeHtml(key)}">
    <a href="${productPageUrl(product)}" aria-label="View ${product.name}"><img src="${product.image}" alt="" loading="lazy"></a>
    <div class="order-item-copy"><h3><a href="${productPageUrl(product)}">${product.name}</a></h3><p>${t(CATEGORY_LABELS[product.category] || "Just B Natural")}${Number.isFinite(product.price) ? ` · ${formatPrice(product.price * item.quantity)}` : ""}</p>
      <div class="order-item-controls"><div class="quantity-control" aria-label="Quantity for ${product.name}"><button type="button" data-order-quantity="-1" data-order-key="${escapeHtml(key)}" aria-label="Remove one ${product.name}">−</button><strong aria-live="polite">${item.quantity}</strong><button type="button" data-order-quantity="1" data-order-key="${escapeHtml(key)}" aria-label="Add one ${product.name}">+</button></div><button class="remove-order-item" type="button" data-order-remove="${escapeHtml(key)}">${t("Remove")}</button></div>
    </div>
  </article>`;
}

function updateAddButton(button) {
  const product = PRODUCTS.find(candidate => candidate.id === button.dataset.addOrder);
  const unavailable = product && (product.availabilityStatus === "unavailable" || product.active === false || (product.stock === 0 && product.availabilityStatus !== "preorder"));
  const item = findOrderLine(button.dataset.addOrder);
  button.disabled = false;
  button.hidden = Boolean(unavailable);
  button.classList.toggle("is-added", Boolean(item));
  const base = product?.availabilityStatus === "preorder" ? t("Preorder") : t("Add to cart");
  button.innerHTML = `${item ? `${t("Add another","Ajouter encore")} (${item.quantity})` : base} <span>＋</span>`;
}

function renderOrderList() {
  const count = orderItemCount();
  document.querySelectorAll("[data-order-count]").forEach(node => { node.textContent = count; });
  document.querySelectorAll("[data-order-email]").forEach(link => { link.href = fullOrderEmailUrl(); });

  const items = document.querySelectorAll("[data-order-items]");
  const empty = document.querySelectorAll("[data-order-empty]");
  const footer = document.querySelectorAll("[data-order-footer]");
  const notes = document.querySelector("[data-order-notes]");
  const fab = document.querySelector(".order-list-fab");
  items.forEach(node => { node.innerHTML = orderList.map(orderItemMarkup).join(""); });
  empty.forEach(node => { node.hidden = orderList.length > 0; });
  footer.forEach(node => { node.hidden = orderList.length === 0; });
  if (notes && notes.value !== orderNotes) notes.value = orderNotes;
  if (fab) fab.hidden = count === 0;

  document.querySelectorAll("[data-add-order]").forEach(updateAddButton);
  updateCheckoutTotals();
  syncCheckoutState();
}

function showOrderToast(message) {
  const toast = document.querySelector(".order-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showOrderToast.timeout);
  showOrderToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function addToOrderList(productId) {
  const product = PRODUCTS.find(candidate => candidate.id === productId);
  if (!product || product.availabilityStatus === "unavailable" || product.active === false || (product.stock === 0 && product.availabilityStatus !== "preorder")) return null;
  const existing = findOrderLine(productId);
  if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
  else orderList.push({ id: productId, quantity: 1 });
  saveOrderList();
  renderOrderList();
  showOrderToast(`${product.name} added to your cart.`);
  const fab = document.querySelector(".order-list-fab");
  if (fab) {
    fab.classList.remove("is-bumping");
    requestAnimationFrame(() => fab.classList.add("is-bumping"));
  }
  return existing || orderList[orderList.length - 1];
}

function changeOrderQuantity(key, change) {
  const item = orderList.find(candidate => orderLineKey(candidate) === key);
  if (!item) return;
  item.quantity += change;
  if (item.quantity < 1) orderList = orderList.filter(candidate => orderLineKey(candidate) !== key);
  else item.quantity = Math.min(99, item.quantity);
  saveOrderList();
  renderOrderList();
}

function openOrderDrawer(opener) {
  const drawer = document.querySelector(".order-drawer");
  const backdrop = document.querySelector(".order-drawer-backdrop");
  if (!drawer || !backdrop) return;
  orderDrawerOpener = opener || document.activeElement;

  const menu = document.querySelector(".mobile-menu");
  const menuBackdrop = document.querySelector(".menu-backdrop");
  const menuButton = document.querySelector(".menu-button");
  if (menu) { menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); }
  if (menuBackdrop) menuBackdrop.hidden = true;
  if (menuButton) menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");

  renderOrderList();
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  document.body.classList.add("order-open");
  drawer.querySelector(".order-drawer-close")?.focus();
}

function closeOrderDrawer() {
  const drawer = document.querySelector(".order-drawer");
  const backdrop = document.querySelector(".order-drawer-backdrop");
  if (!drawer || !backdrop) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
  document.body.classList.remove("order-open");
  if (orderDrawerOpener instanceof HTMLElement) orderDrawerOpener.focus();
}

function copyOrderSummary(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    try {
      document.execCommand("copy") ? resolve() : reject(new Error("Copy failed"));
    } catch (error) {
      reject(error);
    } finally {
      field.remove();
    }
  });
}

function initializeOrderList() {
  if (!STORE.orderListEnabled) return;
  renderOrderList();

  document.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add-order]");
    if (addButton) {
      event.preventDefault();
      const item = addToOrderList(addButton.dataset.addOrder);
      if (addButton.classList.contains("dialog-add-order")) {
        const status = addButton.closest("dialog")?.querySelector("[data-dialog-add-status]");
        if (status) {
          status.hidden = false;
          const quantity = status.querySelector("[data-dialog-add-quantity]");
          if (quantity) quantity.textContent = item?.quantity || 1;
        }
      }
      return;
    }

    const opener = event.target.closest("[data-order-list-open]");
    if (opener) {
      event.preventDefault();
      openOrderDrawer(opener);
      return;
    }

    if (event.target.closest("[data-order-list-close]")) {
      closeOrderDrawer();
      return;
    }

    const quantityButton = event.target.closest("[data-order-quantity]");
    if (quantityButton) {
      changeOrderQuantity(quantityButton.dataset.orderKey, Number(quantityButton.dataset.orderQuantity));
      return;
    }

    const removeButton = event.target.closest("[data-order-remove]");
    if (removeButton) {
      orderList = orderList.filter(item => orderLineKey(item) !== removeButton.dataset.orderRemove);
      saveOrderList();
      renderOrderList();
      return;
    }

    if (event.target.closest("[data-order-clear]")) {
      if (window.confirm("Clear every item from your cart?")) {
        orderList = [];
        orderNotes = "";
        saveOrderList();
        renderOrderList();
      }
      return;
    }

    if (event.target.closest("[data-order-instagram]")) {
      if (!orderList.length) return;
      const copyPromise = copyOrderSummary(buildOrderSummary());
      window.open(STORE.instagramDmUrl, "_blank", "noopener,noreferrer");
      copyPromise.then(
        () => showOrderToast("Order copied. Paste it into the Instagram DM."),
        () => showOrderToast("Instagram opened. Please copy your order details manually.")
      );
    }
  });

  document.addEventListener("input", event => {
    if (!event.target.matches("[data-order-notes]")) return;
    orderNotes = event.target.value;
    saveOrderList();
    document.querySelectorAll("[data-order-email]").forEach(link => { link.href = fullOrderEmailUrl(); });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("order-open")) closeOrderDrawer();
  });
}

function initializeMenu() {
  const opener = document.querySelector(".menu-button");
  const menu = document.querySelector(".mobile-menu");
  const backdrop = document.querySelector(".menu-backdrop");
  if (!opener || !menu || !backdrop) return;

  const setOpen = open => {
    menu.classList.toggle("is-open", open);
    backdrop.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    opener.setAttribute("aria-expanded", String(open));
  };
  opener.addEventListener("click", () => setOpen(true));
  menu.querySelector("button").addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", event => { if (event.key === "Escape") setOpen(false); });
}

function initializeCatalogueFeatures() {
  const search = document.querySelector("[data-product-search]");
  const sort = document.querySelector("[data-product-sort]");
  const shopGrid = document.querySelector('[data-catalog="all"]');
  const categoryGrid = document.querySelector("[data-category]");
  const requestedSearch = new URLSearchParams(location.search).get("search");
  if (search && requestedSearch && !search.value) search.value = requestedSearch;

  const selectAndSortProducts = (products, query, categoryContext = "") => {
    const matches = products.filter(product => {
      const searchable = [product.name, product.kicker, product.description, ...product.ingredients, ...productTags(product)].join(" ").toLowerCase();
      return searchable.includes(query);
    });
    if (sort?.value === "name") matches.sort((a, b) => a.name.localeCompare(b.name));
    if (sort?.value === "featured" && categoryContext === "artisan-soap") {
      matches.sort((a, b) => ARTISAN_DISPLAY_ORDER.indexOf(a.id) - ARTISAN_DISPLAY_ORDER.indexOf(b.id));
    } else if (sort?.value === "featured") {
      matches.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    if (sort?.value === "price-low") matches.sort((a, b) => (Number.isFinite(a.price) ? a.price : Infinity) - (Number.isFinite(b.price) ? b.price : Infinity) || a.name.localeCompare(b.name));
    if (sort?.value === "price-high") matches.sort((a, b) => (Number.isFinite(b.price) ? b.price : -Infinity) - (Number.isFinite(a.price) ? a.price : -Infinity) || a.name.localeCompare(b.name));
    return sort?.value === "preorder"
      ? matches.filter(product => product.active !== false && product.availabilityStatus === "preorder")
      : matches;
  };

  if (shopGrid) {
    const filterButtons = [...document.querySelectorAll("[data-category-filter]")];
    const hashCategory = window.location.hash.replace("#", "");
    let activeCategory = filterButtons.some(button => button.dataset.categoryFilter === hashCategory) ? hashCategory : "all";

    const updateShopGrid = () => {
      const query = search?.value.trim().toLowerCase() || "";
      const products = PRODUCTS.filter(product => activeCategory === "all" || product.category === activeCategory);
      const visibleMatches = selectAndSortProducts(products, query, activeCategory);
      renderProductGrid(shopGrid, visibleMatches);
      filterButtons.forEach(button => {
        const selected = button.dataset.categoryFilter === activeCategory;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    };

    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.categoryFilter || "all";
        updateShopGrid();
      });
    });
    search?.addEventListener("input", updateShopGrid);
    sort?.addEventListener("change", updateShopGrid);
    updateShopGrid();
  } else if (categoryGrid) {
    const category = categoryGrid.dataset.category;
    const updateCategoryGrid = () => {
      const query = search?.value.trim().toLowerCase() || "";
      const products = PRODUCTS.filter(product => product.category === category);
      renderProductGrid(categoryGrid, selectAndSortProducts(products, query, category));
    };
    search?.addEventListener("input", updateCategoryGrid);
    sort?.addEventListener("change", updateCategoryGrid);
    updateCategoryGrid();
  }


  const dialog = document.querySelector("[data-image-dialog]");
  document.addEventListener("click", event => {
    const imageButton = event.target.closest("[data-image-open]");
    if (!imageButton || !dialog) return;
    const product = PRODUCTS.find(item => item.id === imageButton.dataset.imageOpen);
    if (!product) return;
    const image = dialog.querySelector("img");
    image.src = product.image;
    image.alt = product.name;
    dialog.querySelector("h2").textContent = product.name;
    const dialogAdd = dialog.querySelector(".dialog-add-order");
    dialogAdd.dataset.addOrder = product.id;
    const status = dialog.querySelector("[data-dialog-add-status]");
    if (status) status.hidden = true;
    renderOrderList();
    dialog.showModal();
  });

  if (dialog) {
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  }

  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => backToTop.classList.toggle("is-visible", window.scrollY > 700), { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}

function productGuidance(product) {
  const guidance = {
    "roller-oils": {
      use: "Roll lightly onto pulse points such as wrists or the back of the neck. Use only as directed and avoid the eye area.",
      care: "Store upright in a cool, dry place away from direct sunlight. Patch test before first use.",
      detail: "A portable aromatherapy blend for simple, personal everyday rituals."
    },
    "sugar-scrubs": {
      use: "Massage a small amount over damp skin using gentle circular motions, then rinse well.",
      care: "Keep water out of the jar and store closed in a cool, dry place. Use caution on slippery surfaces.",
      detail: "Organic cane sugar and rich plant oils create a softly polishing, nourishing texture."
    },
    "body-care": {
      use: "Warm a small amount between clean hands and massage into dry skin as needed. A little goes a long way.",
      care: "Store closed in a cool, dry place. Natural products may soften or change texture with temperature.",
      detail: "A concentrated, small-batch moisturizer designed for a simple daily care routine."
    },
    "artisan-soap": {
      use: "Lather with water, wash, and rinse thoroughly. Suitable for everyday cleansing unless otherwise noted.",
      care: "Allow the bar to dry fully between uses to help it stay firm and last longer.",
      detail: "A traditionally made bar cured slowly for a mild, firm and long-lasting soap."
    },
    "home-linen": {
      use: "Shake gently and mist lightly over linens from a safe distance. Test a hidden area before wider use.",
      care: "Store upright away from heat and direct sunlight. Keep away from children and pets.",
      detail: "Thoughtfully selected products for simple home and linen care."
    }
  };
  const selected = guidance[product.category] || {
    use: "Follow the directions provided with the current product.",
    care: "Store in a cool, dry place and confirm current care instructions before use.",
    detail: "Handcrafted in a small batch with thoughtfully selected ingredients."
  };
  if (product.use) selected.use = product.use;
  if (product.safety) selected.care = product.safety;
  return selected;
}

function conciseProductUse(product) {
  const french = Boolean(globalThis.JBN_FR?.isFrench);
  const specific = {
    "solid-dish-soap": french ? "Mouiller la brosse, la frotter sur le savon pour créer une mousse, laver, puis bien rincer." : "Wet the brush, swirl it over the soap to create a lather, wash, then rinse thoroughly.",
    "just-b-rested-room-spray": french ? "Agiter doucement, puis vaporiser légèrement à une distance sécuritaire. Tester d'abord sur une zone peu visible." : "Shake gently and mist lightly from a safe distance. Test a hidden area first."
  };
  if (specific[product.id]) return specific[product.id];
  const byCategory = {
    "artisan-soap": french ? "Faire mousser avec de l'eau, laver, puis bien rincer. Convient au nettoyage quotidien, sauf indication contraire." : "Lather with water, wash and rinse thoroughly. Suitable for everyday cleansing unless otherwise noted.",
    "sugar-scrubs": french ? "Masser une petite quantité sur la peau humide en mouvements circulaires, puis bien rincer." : "Massage a small amount over damp skin using gentle circular motions, then rinse well.",
    "roller-oils": french ? "Appliquer sur les points de pulsation, respirer les arômes, puis renouveler au besoin." : "Apply to pulse points, breathe in the aroma, and reapply as needed.",
    "body-care": french ? "Réchauffer une petite quantité entre les mains, puis masser sur la peau sèche. Une petite quantité suffit." : "Warm a small amount between clean hands, then massage into dry skin. A little goes a long way.",
    "home-linen": french ? "Utiliser une petite quantité selon les besoins et suivre les indications propres au produit." : "Use a small amount as needed and follow the product-specific directions."
  };
  return byCategory[product.category] || product.use || "Follow the directions provided with the product.";
}

function productDetailCards(product, sections) {
  const french = Boolean(globalThis.JBN_FR?.isFrench);
  const labels = {
    "artisan-soap": french ? ["Mousse et fabrication", "Senteur et caractère", "Rituel quotidien"] : ["Craft & lather", "Scent & character", "Daily ritual"],
    "sugar-scrubs": french ? ["Texture et soin", "Senteur et fini", "Rituel quotidien"] : ["Texture & care", "Scent & finish", "Daily ritual"],
    "roller-oils": french ? ["Mélange et intention", "Arômes et rituel", "À emporter"] : ["Blend & purpose", "Aroma & ritual", "Made to travel"],
    "body-care": french ? ["Texture et soin", "Formule simple", "Rituel quotidien"] : ["Texture & care", "Simple formula", "Daily ritual"],
    "home-linen": french ? ["Usage et caractère", "Formule réfléchie", "Au quotidien"] : ["Purpose & character", "Thoughtful formula", "Everyday use"]
  };
  const fallback = french ? ["Ce qui le distingue", "Caractère", "Au quotidien"] : ["What makes it special", "Character", "Everyday use"];
  const headings = labels[product.category] || fallback;
  const paragraphs = sections.flatMap(section => section.paragraphs || []).slice(0, 3);
  return paragraphs.map((paragraph, index) => {
    const sentences = String(paragraph).trim().split(/(?<=[.!?])\s+/).filter(Boolean);
    const copy = sentences.slice(0, 2).join(" ");
    return { heading: headings[index] || headings[headings.length - 1], copy };
  });
}

const PRODUCT_TAG_RULES = Object.freeze([
  { pattern: /calm|sooth|relax|comfort|apais|calm|réconfort/i, en: "Calming", fr: "Apaisant" },
  { pattern: /refresh|cool|peppermint|eucalyptus|mint|frais|menthe|eucalyptus/i, en: "Refreshing", fr: "Rafraîchissant" },
  { pattern: /floral|lavender|rose|geranium|ylang|chamomile|fleur|lavande|géranium|camomille/i, en: "Floral", fr: "Floral" },
  { pattern: /citrus|grapefruit|lemon|orange|agrum|pamplemousse|citron/i, en: "Citrus", fr: "Agrumes" },
  { pattern: /woody|wood|cedar|forest|frankincense|bois|boisé|cèdre|forêt|encens/i, en: "Woody", fr: "Boisé" },
  { pattern: /earthy|resin|patchouli|terreux|résine/i, en: "Earthy", fr: "Terreux" },
  { pattern: /botanical|herbal|rosemary|sage|plant|botanique|herbac|romarin|sauge/i, en: "Botanical", fr: "Botanique" },
  { pattern: /soft|gentle|mild|doux|douce|délicat/i, en: "Soft", fr: "Doux" },
  { pattern: /warm|spice|cinnamon|pumpkin|cocoa|coffee|vanilla|chaleur|épic|cannelle|citrouille|cacao|café|vanille/i, en: "Warm", fr: "Chaleureux" },
  { pattern: /unscented|fragrance.free|essential.oil.free|au naturel/i, en: "Unscented", fr: "Au naturel" }
]);

function productTags(product) {
  const french = Boolean(globalThis.JBN_FR?.isFrench);
  const floralProducts = new Set(["coconut-lavender-soap", "ylang-ylang-soap"]);
  const excludedTags = {
    "rosemary-sage-soap": new Set(["Botanical"]),
    "ember-ash-soap": new Set(["Citrus"]),
    "vanilla-infused-tallow": new Set(["Woody", "Earthy"]),
    "unscented-tallow": new Set(["Botanical", "Soft", "Warm"])
  };
  const overrides = {
    "just-b-rested-room-spray": french ? ["Apaisant", "Boisé", "Terreux", "Botanique", "Doux"] : ["Calming", "Woody", "Earthy", "Botanical", "Soft"],
    "just-b-calm": french ? ["Apaisant", "Ancrant", "Agrumes", "Floral", "Herbacé"] : ["Calming", "Grounding", "Citrus", "Floral", "Herbal"],
    "just-b-relieved": french ? ["Rafraîchissant", "Mentholé", "Herbacé", "Ancrant", "Portatif"] : ["Cooling", "Minty", "Herbal", "Grounding", "Portable"],
    "cycle-harmony": french ? ["Apaisant", "Floral", "Herbacé", "Ancrant", "Soin du cycle"] : ["Soothing", "Floral", "Herbal", "Grounding", "Cycle care"]
  };
  if (overrides[product.id]) return overrides[product.id];
  const categoryTags = {
    "artisan-soap": french ? ["Mousse crémeuse"] : ["Creamy lather"],
    "sugar-scrubs": french ? ["Exfoliant", "Nourrissant"] : ["Exfoliating", "Nourishing"],
    "roller-oils": french ? ["Huile botanique", "Portatif"] : ["Botanical oil", "Portable"],
    "body-care": french ? ["Hydratant", "Sans eau"] : ["Moisturizing", "Water-free"],
    "home-linen": french ? ["Pratique", "Zéro déchet"] : ["Practical", "Zero-waste"]
  };
  const source = [product.name, product.description, product.cardDescription, ...(product.ingredients || []), ...(product.details || [])].join(" ");
  const tags = [...(categoryTags[product.category] || [])];
  PRODUCT_TAG_RULES.forEach(rule => {
    if (rule.en === "Floral" && !floralProducts.has(product.id)) return;
    if (excludedTags[product.id]?.has(rule.en)) return;
    const label = french ? rule.fr : rule.en;
    if (rule.pattern.test(source) && !tags.includes(label)) tags.push(label);
  });
  return tags.slice(0, 5);
}

function renderProductPage() {
  const mount = document.querySelector("[data-product-page]");
  if (!mount) return;
  const product = PRODUCTS.find(item => item.id === document.body.dataset.productId);
  if (!product) {
    mount.innerHTML = `<section class="product-not-found shell"><p class="eyebrow">Product not found</p><h1>This product page is unavailable.</h1><a class="button button-dark" href="shop.html">Browse all products</a></section>`;
    return;
  }

  const guide = productGuidance(product);
  const productSections = Array.isArray(product.sections) && product.sections.length
    ? product.sections
    : [{ title: "About this product", paragraphs: [product.description, ...(product.details || [])] }];
  const fullDescription = String(product.description || "").trim();
  const cardDescription = String(product.cardDescription || "").trim();
  const firstSentence = fullDescription.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || fullDescription;
  const heroDescription = fullDescription.length > 360
    ? (cardDescription && !/[.…]$/.test(cardDescription) ? cardDescription : firstSentence)
    : fullDescription;
  const normalizeCopy = value => String(value || "").trim().replace(/\s+/g, " ");
  const storySections = productSections
    .filter(section => !["How to use", "Before using"].includes(section.title))
    .map(section => ({
      ...section,
      paragraphs: section.paragraphs.map(paragraph => {
        if (normalizeCopy(paragraph) !== normalizeCopy(fullDescription)) return paragraph;
        if (normalizeCopy(heroDescription) === normalizeCopy(fullDescription)) return "";
        return fullDescription.startsWith(heroDescription) ? fullDescription.slice(heroDescription.length).trim() : paragraph;
      }).filter(Boolean)
    }))
    .filter(section => section.paragraphs.length);
  const howTo = conciseProductUse(product);
  const beforeUsing = productSections.find(section => section.title === "Before using")?.paragraphs.join(" ") || product.safety || "Review the complete ingredient list before use. Stop use if irritation occurs. For external use only.";
  const availabilityText = productAvailabilityText(product);
  const stockMarkup = availabilityText ? `<p class="stock-status product-detail-stock${product.availabilityStatus === "preorder" ? " is-preorder" : ""}" data-stock-product="${product.id}">${productAvailabilityMarkup(product)}</p>` : `<p class="stock-status product-detail-stock" data-stock-product="${product.id}" hidden></p>`;
  const categoryLabel = CATEGORY_LABELS[product.category] || "Just B Natural";
  const related = PRODUCTS.filter(item => item.category === product.category && item.id !== product.id).slice(0, 3);
  const ingredientsText = product.ingredients.join(" ");
  const tags = productTags(product);
  const useDetailsOpen = window.matchMedia("(max-width: 620px)").matches ? "" : " open";
  const detailCards = productDetailCards(product, storySections);
  const storyMarkup = storySections.length ? `
    <section class="product-story-section">
      <details class="shell product-more-details">
        <summary><span><small>Product details</small><strong>More about this product</strong></span><b aria-hidden="true">＋</b></summary>
        <div class="product-more-copy product-more-copy--${Math.min(detailCards.length, 3)}">${detailCards.map(card => `<article class="product-detail-highlight"><strong>${card.heading}</strong><p>${card.copy}</p></article>`).join("")}</div>
      </details>
    </section>` : "";
  document.title = `${product.name} | ${STORE.name}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = product.description;

  mount.innerHTML = `
    <div class="shell product-detail-shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="shop.html#${product.category}">${categoryLabel}</a><span>/</span><span>${product.name}</span></nav>
      <section class="product-detail-hero" style="--tone:${product.tone};--accent:${product.accent}">
        <div class="product-detail-media"><span class="product-detail-ring" aria-hidden="true"></span><img src="${product.image}" alt="${product.name}" style="${productImageStyle(product)}"><span class="product-image-tagline product-image-tagline--detail" aria-hidden="true">Pure · Natural · Handcrafted</span></div>
        <div class="product-detail-purchase">
          <p class="eyebrow">${product.kicker}</p>
          <h1>${product.name}</h1>
          <p class="product-detail-kicker">${categoryLabel}</p>
          ${Number.isFinite(product.price) ? `<p class="product-detail-price" data-price-product="${product.id}">${formatPrice(product.price)}</p>` : `<p class="product-detail-price" data-price-product="${product.id}" hidden></p>`}
          <p class="product-detail-description">${heroDescription}</p>
          <div class="product-ingredients-card">
            <strong>Ingredients</strong>
            <p>${ingredientsText}</p>
            ${product.note ? `<small>${product.note}</small>` : ""}
          </div>
          ${stockMarkup}
          <button class="button button-dark product-detail-add" type="button" data-add-order="${product.id}">${product.availabilityStatus === "preorder" ? t("Preorder") : t("Add to cart")} <span>＋</span></button>
          <button class="notify-product-button notify-product-button--detail" type="button" data-notify-product="${product.id}" hidden>Notify me when available</button>
          <div class="product-detail-tags" aria-label="Product tags">${tags.map(tag => `<a href="shop.html?search=${encodeURIComponent(tag)}">${tag}</a>`).join("")}</div>
        </div>
      </section>
    </div>
    ${storyMarkup}
    <section class="shell product-use-section">
      <details class="product-use-item"${useDetailsOpen}><summary><h2>How to use</h2><span aria-hidden="true">＋</span></summary><p>${howTo}</p></details>
      <details class="product-use-item"${useDetailsOpen}><summary><h2>Care & storage</h2><span aria-hidden="true">＋</span></summary><p>${guide.care}</p></details>
      <details class="product-use-item"${useDetailsOpen}><summary><h2>Before using</h2><span aria-hidden="true">＋</span></summary><p>${beforeUsing}</p></details>
    </section>
    <section class="related-products section shell" ${related.length ? "" : "hidden"}>
      <div class="section-heading"><div><p class="eyebrow">You may also like</p><h2>More from ${categoryLabel}</h2></div><a class="text-link" href="shop.html#${product.category}">View category <span>→</span></a></div>
      <div class="product-grid">${related.map(productCard).join("")}</div>
    </section>`;
  activateImageFallbacks(mount);
}

function checkoutPayload(form) {
  const data = new FormData(form);
  const fulfillment = String(data.get("fulfillment") || "pickup");
  const deliveryAddress = String(data.get("deliveryAddress") || "").trim();
  const deliveryDistanceKm = Number(data.get("deliveryDistanceKm"));
  const deliveryFeeCents = Number(data.get("deliveryFeeCents"));
  return {
    language: campaignLanguage,
    firstName: String(data.get("firstName") || "").trim(),
    lastName: String(data.get("lastName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    area: fulfillment === "delivery" ? deliveryAddress : String(data.get("area") || "").trim(),
    fulfillment,
    deliveryAddress,
    deliveryPlaceId: String(data.get("deliveryPlaceId") || "").trim(),
    deliveryDistanceKm: Number.isFinite(deliveryDistanceKm) && deliveryDistanceKm > 0 ? deliveryDistanceKm : null,
    deliveryFeeCents: Number.isInteger(deliveryFeeCents) && deliveryFeeCents >= 0 ? deliveryFeeCents : null,
    payment: String(data.get("payment") || "etransfer"),
    notes: String(data.get("notes") || "").trim(),
    marketingConsent: data.get("marketingConsent") === "on",
    locale: globalThis.JBN_FR?.isFrench ? "fr" : "en",
    language: campaignLanguage,
    consentText: globalThis.JBN_FR?.isFrench ? "J'accepte de recevoir occasionnellement des nouvelles et promotions de Just B Natural. Je peux me désabonner en tout temps." : "I agree to receive occasional promotions from Just B Natural. I can unsubscribe anytime.",
    consentedAt: new Date().toISOString(),
    website: String(data.get("website") || ""),
    items: orderList.map(item => ({ id: item.id, quantity: item.quantity }))
  };
}

function initializeDeliveryEstimator(form) {
  const panel = form.querySelector("[data-delivery-estimator]");
  const pickupArea = form.querySelector("[data-pickup-area]");
  const address = form.querySelector("[data-delivery-address]");
  const suggestions = form.querySelector("[data-delivery-suggestions]");
  const status = form.querySelector("[data-delivery-estimate-status]");
  if (!panel || !address || !suggestions || !status) return;

  const placeId = form.elements.deliveryPlaceId;
  const distance = form.elements.deliveryDistanceKm;
  const fee = form.elements.deliveryFeeCents;
  const sessionToken = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let timer = 0;
  let requestNumber = 0;

  const closeSuggestions = () => {
    suggestions.hidden = true;
    address.setAttribute("aria-expanded", "false");
  };

  const clearEstimate = () => {
    placeId.value = "";
    distance.value = "";
    fee.value = "";
    status.textContent = "Choose the matching address from the suggestion list to confirm local delivery.";
    status.classList.remove("is-ready", "is-error");
    if (form.elements.fulfillment.value === "delivery") address.setCustomValidity("Please select a suggested address so we can confirm local delivery.");
    updateCheckoutTotals();
  };

  const showUnavailable = () => {
    closeSuggestions();
    status.textContent = "We could not confirm local delivery for this address. Choose a suggested address before placing the order.";
    status.classList.add("is-error");
    status.classList.remove("is-ready");
    address.setCustomValidity("Please select a suggested address so we can confirm local delivery.");
  };

  const estimate = async (selectedPlaceId, selectedAddress) => {
    status.textContent = "Confirming the local delivery zone…";
    status.classList.remove("is-ready", "is-error");
    try {
      const response = await fetch(STORE.deliveryEstimateEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: selectedPlaceId, address: selectedAddress, subtotalCents: cartSubtotalCents() })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Estimate unavailable");
      distance.value = String(result.distanceKm);
      fee.value = String(result.feeCents);
      status.textContent = Number(result.feeCents) === 0
        ? `Address confirmed: ${Number(result.distanceKm).toFixed(1)} km from Aylmer • Free local delivery`
        : `Address confirmed: ${Number(result.distanceKm).toFixed(1)} km from Aylmer • $10.00 local delivery`;
      status.classList.add("is-ready");
      status.classList.remove("is-error");
      address.setCustomValidity("");
      address.dispatchEvent(new Event("change", { bubbles: true }));
      updateCheckoutTotals();
    } catch (_) {
      showUnavailable();
    }
  };

  const renderSuggestions = (predictions, provider = "OpenStreetMap") => {
    if (!predictions.length) {
      closeSuggestions();
      return;
    }
    suggestions.innerHTML = `${predictions.map(prediction => `<button type="button" role="option" data-place-id="${escapeHtml(prediction.placeId)}" data-address="${escapeHtml(prediction.text)}">${escapeHtml(prediction.text)}</button>`).join("")}<p class="delivery-google">Address data © ${escapeHtml(provider)}</p>`;
    suggestions.querySelectorAll("button[data-place-id]").forEach(option => {
      const selectOption = () => {
        if (placeId.value === option.dataset.placeId && address.value === option.dataset.address) return;
        address.value = option.dataset.address || "";
        placeId.value = option.dataset.placeId || "";
        closeSuggestions();
        estimate(placeId.value, address.value);
      };
      option.addEventListener("pointerdown", event => { event.preventDefault(); selectOption(); });
      option.addEventListener("click", selectOption);
      option.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectOption(); } });
    });
    suggestions.hidden = false;
    address.setAttribute("aria-expanded", "true");
    const bounds = address.getBoundingClientRect();
    const headerClearance = window.innerWidth <= 720 ? 165 : 110;
    if (bounds.top < headerClearance || bounds.bottom > window.innerHeight - 150) address.scrollIntoView({ behavior: "auto", block: "center" });
  };

  address.addEventListener("input", () => {
    clearEstimate();
    window.clearTimeout(timer);
    const input = address.value.trim();
    if (input.length < 3) {
      closeSuggestions();
      return;
    }
    const currentRequest = ++requestNumber;
    timer = window.setTimeout(async () => {
      try {
        const response = await fetch(STORE.deliveryAutocompleteEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, sessionToken })
        });
        const result = await response.json().catch(() => ({}));
        if (currentRequest !== requestNumber) return;
        if (!response.ok) throw new Error(result.error || "Suggestions unavailable");
        renderSuggestions(Array.isArray(result.predictions) ? result.predictions : [], result.provider || "OpenStreetMap");
      } catch (_) {
        if (currentRequest === requestNumber) showUnavailable();
      }
    }, 250);
  });

  const syncFulfillment = () => {
    const deliverySelected = form.elements.fulfillment.value === "delivery";
    panel.hidden = !deliverySelected;
    if (pickupArea) pickupArea.hidden = deliverySelected;
    address.required = deliverySelected;
    address.setCustomValidity(deliverySelected && !distance.value ? "Please select a suggested address so we can confirm local delivery." : "");
    if (!deliverySelected) {
      closeSuggestions();
      clearEstimate();
    }
    updateCheckoutTotals();
  };

  form.querySelectorAll('input[name="fulfillment"]').forEach(radio => radio.addEventListener("change", syncFulfillment));
  document.addEventListener("click", event => {
    if (!event.target.closest(".delivery-address-wrap")) closeSuggestions();
  });
  syncFulfillment();
}

function initializeInlineValidation(form) {
  const fields = [...form.elements].filter(field => field.willValidate && !["radio", "checkbox", "hidden", "submit"].includes(field.type));

  const fieldName = field => {
    const names = { firstName: "First name", lastName: "Last name", email: "Email address", phone: "Phone number", area: "Neighbourhood or general area", deliveryAddress: "Delivery address", notes: "Order notes" };
    return names[field.name] || "This field";
  };

  const messageFor = field => {
    const validity = field.validity;
    if (validity.valid) return "";
    if (validity.customError) return field.validationMessage;
    if (validity.valueMissing) return `${fieldName(field)} is required.`;
    if (field.type === "email" || field.name === "email") return "Enter a complete email address, such as name@example.com.";
    if (field.name === "firstName" || field.name === "lastName") return `${fieldName(field)} must use letters, spaces, apostrophes or hyphens.`;
    if (field.name === "phone") return "Enter a valid phone number using numbers and standard phone punctuation.";
    if (validity.tooShort) return `${fieldName(field)} is too short.`;
    if (validity.tooLong) return `${fieldName(field)} is too long.`;
    return field.validationMessage || `Check ${fieldName(field).toLowerCase()} and try again.`;
  };

  const errorFor = (field, index) => {
    const parent = field.closest("label") || field.parentElement;
    let error = parent?.querySelector(":scope > .field-error");
    if (!error && parent) {
      error = document.createElement("small");
      error.className = "field-error";
      error.id = `field-error-${field.name || index}-${index}`;
      error.setAttribute("aria-live", "polite");
      parent.append(error);
      const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      describedBy.add(error.id);
      field.setAttribute("aria-describedby", [...describedBy].join(" "));
    }
    return error;
  };

  const controls = fields.map((field, index) => ({ field, error: errorFor(field, index) }));
  const update = (field, error, force = false) => {
    const message = messageFor(field);
    const visible = Boolean(message) && (force || form.classList.contains("was-validated") || document.activeElement !== field);
    error.textContent = visible ? message : "";
    error.classList.toggle("is-visible", visible);
    field.setAttribute("aria-invalid", visible ? "true" : "false");
  };

  controls.forEach(({ field, error }) => {
    field.addEventListener("invalid", event => { event.preventDefault(); update(field, error, true); });
    field.addEventListener("input", () => update(field, error));
    field.addEventListener("change", () => update(field, error));
    field.addEventListener("blur", () => update(field, error, Boolean(field.value)));
  });

  return (force = false) => controls.forEach(({ field, error }) => update(field, error, force));
}

function checkoutEmailUrl(details) {
  const subject = `Guest order – ${details.firstName || "Customer"}`;
  return `mailto:${STORE.orderEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildOrderSummary(details))}`;
}

function focusFirstInvalidCheckoutField(form) {
  const field = [...form.elements].find(control => control.willValidate && !control.checkValidity() && control.type !== "hidden");
  if (!(field instanceof HTMLElement)) return;
  const headerClearance = window.innerWidth <= 900 ? 150 : 105;
  const targetTop = Math.max(0, field.getBoundingClientRect().top + window.scrollY - headerClearance);
  field.focus({ preventScroll: true });
  window.scrollTo({ top: targetTop, behavior: "smooth" });
  window.setTimeout(() => {
    field.focus({ preventScroll: true });
    if (field instanceof HTMLInputElement && typeof field.setSelectionRange === "function") {
      try { field.setSelectionRange(field.value.length, field.value.length); } catch (_) {}
    }
  }, 360);
}

function syncCheckoutState() {
  const checkout = document.querySelector("[data-checkout]");
  if (!checkout) return;
  const empty = checkout.querySelector("[data-checkout-empty]");
  const content = checkout.querySelector("[data-checkout-content]");
  if (checkout.dataset.completed === "true") {
    if (empty) empty.hidden = true;
    if (content) content.hidden = true;
    return;
  }
  if (empty) empty.hidden = orderList.length > 0;
  if (content) content.hidden = orderList.length === 0;
  checkout.querySelectorAll("[data-checkout-count]").forEach(node => { node.textContent = orderItemCount(); });
  updateCheckoutTotals();
  const submit = checkout.querySelector('.checkout-submit');
  if (submit && !submit.disabled) submit.textContent = "Request order";
}

function showCheckoutSuccess(orderId) {
  const checkout = document.querySelector("[data-checkout]");
  const content = document.querySelector("[data-checkout-content]");
  const success = document.querySelector("[data-checkout-success]");
  if (checkout) checkout.dataset.completed = "true";
  if (content) content.hidden = true;
  if (success) {
    success.hidden = false;
    const id = success.querySelector("[data-order-id]");
    if (id) id.textContent = orderId;
    success.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  orderList = [];
  orderNotes = "";
  saveOrderList();
  renderOrderList();
}

function initializeCheckout() {
  const checkout = document.querySelector("[data-checkout]");
  const form = document.querySelector("[data-checkout-form]");
  if (!checkout || !form) return;
  initializeDeliveryEstimator(form);
  const updateValidation = initializeInlineValidation(form);
  renderOrderList();
  syncCheckoutState();

  form.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.target.closest("textarea, button")) event.preventDefault();
  });

  let invalidFocusQueued = false;
  form.addEventListener("invalid", () => {
    form.classList.add("was-validated");
    if (invalidFocusQueued) return;
    invalidFocusQueued = true;
    requestAnimationFrame(() => {
      updateValidation(true);
      focusFirstInvalidCheckoutField(form);
      const invalidStatus = form.querySelector("[data-checkout-status]");
      if (invalidStatus) {
        invalidStatus.textContent = "Please correct the highlighted information before sending your request.";
        invalidStatus.classList.add("is-error");
      }
      invalidFocusQueued = false;
    });
  }, true);

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!event.submitter?.matches(".checkout-submit")) return;
    form.classList.add("was-validated");
    if (!form.reportValidity() || !orderList.length) {
      updateValidation(true);
      focusFirstInvalidCheckoutField(form);
      const invalidStatus = form.querySelector("[data-checkout-status]");
      if (invalidStatus) {
        invalidStatus.textContent = "Please correct the highlighted information before sending your request.";
        invalidStatus.classList.add("is-error");
      }
      return;
    }
    const details = checkoutPayload(form);
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector("[data-checkout-status]");
    const fallback = form.querySelector("[data-checkout-fallback]");
    button.disabled = true;
    button.textContent = "Sending request…";
    if (status) { status.textContent = ""; status.classList.remove("is-error"); }
    if (fallback) fallback.hidden = true;

    if (window.location.protocol === "file:") {
      if (status) status.textContent = "This saved copy cannot submit automatically. Use the prepared email to send your request; no payment is due yet.";
      if (fallback) {
        fallback.href = checkoutEmailUrl(details);
        fallback.hidden = false;
      }
      button.disabled = false;
      button.textContent = "Request order";
      return;
    }

    try {
      const response = await fetch(STORE.orderEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Order could not be sent.");
      showCheckoutSuccess(result.orderId || "Submitted");
    } catch (error) {
      if (status) { status.textContent = "We could not send the request automatically. You can send the prepared request by email instead."; status.classList.add("is-error"); }
      if (fallback) {
        fallback.href = checkoutEmailUrl(details);
        fallback.hidden = false;
      }
    } finally {
      button.disabled = false;
      button.textContent = "Request order";
    }
  });
}

function initializeNewsletter() {
  document.querySelectorAll("[data-newsletter-form]").forEach(form => {
    const updateValidation = initializeInlineValidation(form);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      form.classList.add("was-validated");
      if (!form.reportValidity()) {
        updateValidation(true);
        return;
      }
      const button = form.querySelector('[type="submit"]');
      const status = form.querySelector("[data-newsletter-status]");
      const email = String(new FormData(form).get("email") || "").trim();
      button.disabled = true;
      status.textContent = "Joining…";

      if (window.location.protocol === "file:") {
        status.textContent = "The signup form is ready and will collect emails once the website is published.";
        button.disabled = false;
        return;
      }

      try {
        const response = await fetch(STORE.subscribeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            consent: true,
            consentText: "I agree to receive occasional promotions from Just B Natural. I can unsubscribe anytime.",
            consentedAt: new Date().toISOString(),
            source: "website-footer"
          })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Signup could not be completed.");
        status.textContent = "You are on the list. Thank you.";
        form.reset();
      } catch (error) {
        status.textContent = `We could not add this email right now. Please contact ${STORE.orderEmail}.`;
      } finally {
        button.disabled = false;
      }
    });
  });
}

let revealObserver;

function observeRevealItems(scope = document) {
  const selectors = [
    ".section-heading",
    ".category-card",
    ".product-card",
    ".instagram-copy",
    ".instagram-menu-card",
    ".order-steps > li",
    ".category-icon-card",
    ".category-note > *",
    "[data-reveal]"
  ].join(",");
  const items = [...scope.querySelectorAll(selectors)].filter(item => !item.dataset.revealBound);
  if (!items.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!revealObserver && "IntersectionObserver" in window && !reducedMotion) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
  }

  items.forEach((item, index) => {
    item.dataset.revealBound = "true";
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${(index % 4) * 65}ms`);
    if (revealObserver) revealObserver.observe(item);
    else item.classList.add("is-revealed");
  });
}

function initializeScrollLife() {
  observeRevealItems();
  const progress = document.querySelector(".scroll-progress span");
  const header = document.querySelector(".site-header");
  const heroArt = document.querySelector(".hero-art");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;

  const updateScrollEffects = () => {
    const scrollTop = window.scrollY;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (progress) progress.style.transform = `scaleX(${Math.min(scrollTop / scrollable, 1)})`;
    if (header) header.classList.toggle("is-scrolled", scrollTop > 45);
    if (heroArt && !reducedMotion) {
      const drift = Math.min(scrollTop, 780);
      heroArt.style.setProperty("--drift-main", `${drift * -0.035}px`);
      heroArt.style.setProperty("--drift-left", `${drift * 0.018}px`);
      heroArt.style.setProperty("--drift-right", `${drift * -0.016}px`);
    }
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollEffects);
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  updateScrollEffects();

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion) {
    document.querySelectorAll(".category-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
        card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      });
    });
  }
}

async function loadInventory() {
  try {
    const response = await fetch("/api/products", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const payload = await response.json();
    const inventory = new Map((payload.products || []).map(item => [item.id, item]));
    PRODUCTS.forEach(product => {
      const record = inventory.get(product.id);
      if (!record) return;
      product.stock = Number.isInteger(record.stock) ? record.stock : null;
      product.price = Number.isInteger(record.priceCents) ? record.priceCents / 100 : product.price;
      product.active = record.active !== false;
      product.availabilityStatus = record.availabilityStatus || (record.active === false ? "unavailable" : "available");
      product.availableDate = record.availableDate || null;
      product.availability = productAvailabilityText(product);
    });
    const catalogueSort = document.querySelector("[data-product-sort]");
    if (catalogueSort) catalogueSort.dispatchEvent(new Event("change"));
    document.querySelectorAll('[data-catalog="featured"]').forEach(grid => {
      renderProductGrid(grid, featuredProducts());
      initializeFeaturedCarousel(grid);
    });
    document.querySelectorAll(".product-card").forEach(card => {
      const product = PRODUCTS.find(item => item.id === card.dataset.productId);
      if (!product) return;
      const titleRow = card.querySelector(".product-title-row");
      let price = titleRow?.querySelector(".product-price");
      if (!Number.isFinite(product.price)) { if (price) price.remove(); return; }
      if (!price) { price = document.createElement("span"); price.className = "product-price"; titleRow?.append(price); }
      price.textContent = formatPrice(product.price);
    });
    document.querySelectorAll("[data-price-product]").forEach(node => {
      const product = PRODUCTS.find(item => item.id === node.dataset.priceProduct);
      node.textContent = product && Number.isFinite(product.price) ? formatPrice(product.price) : "";
      node.hidden = !node.textContent;
    });
    document.querySelectorAll("[data-stock-product]").forEach(node => {
      const product = PRODUCTS.find(item => item.id === node.dataset.stockProduct);
      if (!product) return;
      const text = productAvailabilityText(product);
      node.innerHTML = productAvailabilityMarkup(product);
      node.classList.toggle("is-preorder", product.availabilityStatus === "preorder" && Boolean(product.availableDate));
      node.hidden = !text;
    });
    document.querySelectorAll("[data-notify-product]").forEach(button => {
      const product = PRODUCTS.find(item => item.id === button.dataset.notifyProduct);
      const unavailable = product && (product.availabilityStatus === "unavailable" || product.active === false || (product.stock === 0 && product.availabilityStatus !== "preorder"));
      const show = product && unavailable;
      button.hidden = !show;
      button.textContent = "Notify me when available";
      button.classList.toggle("notify-product-button--primary", Boolean(unavailable));
    });
    document.querySelectorAll("[data-add-order]").forEach(updateAddButton);
    updateAvailabilitySummaries();
    renderCampaignProducts();
    renderOrderList();
  } catch (_) {
    // The catalog remains usable if inventory status is temporarily unavailable.
  }
}

function initializeAvailabilityNotifications() {
  const dialog = document.querySelector("[data-notify-dialog]");
  const form = dialog?.querySelector("[data-notify-form]");
  if (!dialog || !form) return;
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-notify-product]");
    if (!button) return;
    const product = PRODUCTS.find(item => item.id === button.dataset.notifyProduct);
    if (!product) return;
    form.reset();
    form.elements.productId.value = product.id;
    form.querySelector("[data-notify-product-name]").textContent = product.name;
    form.querySelector("[data-notify-status]").textContent = product.availableDate ? `Currently expected ${formatReadyDate(product.availableDate)}.` : "";
    dialog.showModal();
    form.elements.email.focus();
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const email = form.elements.email;
    const status = form.querySelector("[data-notify-status]");
    email.setCustomValidity(completeEmail(email.value) ? "" : "Enter a complete email address, such as name@example.com.");
    if (!form.reportValidity()) return;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    status.textContent = "Saving your notification…";
    try {
      const response = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ productId: form.elements.productId.value, email: email.value.trim() }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The notification could not be saved.");
      status.textContent = "You’re all set. Check your inbox for confirmation.";
      submit.hidden = true;
    } catch (error) {
      status.textContent = error.message;
    } finally { submit.disabled = false; }
  });
  dialog.addEventListener("close", () => { form.querySelector('button[type="submit"]').hidden = false; });
}

globalThis.JBN_FR?.prepare(PRODUCTS);
renderSiteChrome();
initializeCampaignLanguage();
renderCampaign();
renderCatalogues();
renderProductPage();
initializeMenu();
initializeOrderList();
initializeCheckout();
initializeCatalogueFeatures();
initializeNewsletter();
initializeScrollLife();
initializeAvailabilityNotifications();
loadInventory();



function renderCampaignProducts(){
  const grid=document.querySelector('[data-campaign-products]');
  if(!grid)return;
  const products=PRODUCTS.filter(p=>p.category==='artisan-soap'&&p.active!==false&&p.availabilityStatus!=='unavailable'&&p.availabilityStatus!=='preorder'&&p.stock!==0);
  renderProductGrid(grid,products);
  const stock=document.querySelector('[data-campaign-stock-note]');
  if(stock){stock.hidden=products.length>0;stock.textContent=products.length?'':t('No soaps are available right now. Please check back soon.','Aucun savon disponible en ce moment. Revenez bientôt.');}
  grid.querySelectorAll('[data-stock-product]').forEach(n=>{const p=PRODUCTS.find(p=>p.id===n.dataset.stockProduct);n.hidden=false;n.textContent=Number.isInteger(p.stock)?t(`${p.stock} in stock`,`${p.stock} en stock`):t('Available to order','Disponible à commander');});
  initializeFeaturedCarousel(grid);
}
function renderCampaign(){
  const active=campaignActive(soapCampaign);
  const announcement=document.querySelector('[data-pink-announcement]');
  if(announcement){announcement.hidden=!active;announcement.innerHTML=`<a href="artisan-soap.html" data-promo-open>${t('October with love','Octobre, avec amour')} · ${t('2 artisan soaps for','2 savons artisanaux pour')} ${formatPrice(soapCampaign.pairPriceCents/100)} · ${formatPrice(soapCampaign.donationPerPairCents/100)} ${t('to Ruban Rose per pair','au Ruban Rose par paire')} <span aria-hidden="true">→</span></a>`;}
  const home=document.querySelector('[data-home-campaign]');
  if(home){home.hidden=!active;const regular=document.querySelector('.home-hero');if(regular)regular.hidden=false;const key=JSON.stringify(soapCampaign);if(active&&home.dataset.campaign!==key){home._carouselAbort?.abort();home._carouselAbort=new AbortController();home.innerHTML=octoberHomeCard(soapCampaign);home.dataset.campaign=key;let slide=0;home.addEventListener('click',event=>{const button=event.target.closest('[data-october-step]');if(!button)return;slide=(slide+Number(button.dataset.octoberStep)+2)%2;const image=home.querySelector('[data-october-photo]');image.src=`images/october/slide-${slide===0?1:6}.webp`;image.alt=slide===0?t('Handmade soaps arranged as a pink awareness ribbon','Savons artisanaux disposés en ruban rose'):t('Handmade soaps with pink ribbons','Savons artisanaux avec des rubans roses');home.querySelector('[data-october-position]').textContent=`${slide+1} / 2`;},{signal:home._carouselAbort?.signal});}if(active)initializePromotionPopup();}
  const hero=document.querySelector('[data-campaign-hero]');
  if(hero)hero.innerHTML=campaignHero(soapCampaign,{active});
  const awareness=document.querySelector('[data-awareness-gallery]');
  if(awareness&&!awareness.dataset.rendered){const content=awarenessContent();awareness.innerHTML=content.slides.map((slide,i)=>`<button type="button" data-awareness-slide="${slide}" aria-label="${t('Enlarge','Agrandir')} ${content.labels[i]}"><img src="images/october/slide-${slide}.webp" width="1080" height="1350" loading="lazy" alt="${content.labels[i]}. ${t('Full text and current guidance below.','Texte complet et conseils actuels ci-dessous.')}"/><span>${content.labels[i]} · ${t('Tap to enlarge','Agrandir')} ↗</span></button>`).join('');document.querySelector('[data-awareness-text]').innerHTML=content.text;awareness.dataset.rendered='true';
    const dialog=document.querySelector('[data-awareness-dialog]');
    awareness.addEventListener('click',event=>{const button=event.target.closest('[data-awareness-slide]');if(!button)return;const image=dialog.querySelector('img');image.src=`images/october/slide-${button.dataset.awarenessSlide}.webp`;image.alt=button.getAttribute('aria-label');dialog.showModal();});
    dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  }
  const step=document.querySelector('.pink-steps .shell>div:last-child p');
  if(step)step.textContent=t(`Just B donates ${formatPrice(soapCampaign.donationPerPairCents/100)} per qualifying pair after payment.`,`Just B verse ${formatPrice(soapCampaign.donationPerPairCents/100)} par paire admissible après paiement.`);
  renderCampaignProducts();
  updateCheckoutTotals();
}
async function loadCampaign(){
  try{const response=await fetch('/api/campaign',{cache:'no-store'});if(!response.ok)throw new Error('unavailable');const payload=await response.json();soapCampaign=payload.config;}
  catch(_){soapCampaign={...CAMPAIGN_DEFAULTS,enabled:false};}
  renderCampaign();
}
loadCampaign();
// Refresh date-sensitive pricing in tabs left open across midnight or inventory edits.
setInterval(()=>{loadCampaign();},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadCampaign();});

function initializePromotionPopup(){
  let dialog=document.querySelector('[data-promo-popup]');
  if(!dialog){document.body.insertAdjacentHTML('beforeend',campaignPopup(soapCampaign));dialog=document.querySelector('[data-promo-popup]');dialog.querySelectorAll('[data-promo-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});}
  const key=`jbn-promo-seen-${soapCampaign.startDate}-${soapCampaign.endDate}`;
  let seen=initializePromotionPopup.seen;try{seen=seen||sessionStorage.getItem(key);}catch(_){}
  if(!seen){initializePromotionPopup.seen=true;try{sessionStorage.setItem(key,'1');}catch(_){}dialog.showModal();}
}
document.addEventListener('click',event=>{const opener=event.target.closest('[data-promo-open]');if(!opener||!campaignActive(soapCampaign))return;event.preventDefault();initializePromotionPopup();document.querySelector('[data-promo-popup]').showModal();});
