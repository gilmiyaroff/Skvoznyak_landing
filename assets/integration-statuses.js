/* Single source of truth for connector readiness.
 * Set individual values to 'pilot' only when tested and genuinely available.
 * 'development' means no live connector is promised by this landing page.
 */
window.SKVOZNYAK_CONNECTORS = Object.freeze({
  statuses: Object.freeze({
    "meta": "development",
    "googleads": "development",
    "youtubeads": "development",
    "tiktokads": "development",
    "youtube": "development",
    "tiktok": "development",
    "instagram": "development",
    "telegram": "development",
    "amocrm": "development",
    "bitrix24": "development",
    "whatsapp": "development",
    "wazzup": "development",
    "sipuni": "development",
    "kelesu": "development",
    "tilda": "development",
    "googleanalytics": "development",
    "googlesheets": "development",
    "googlesearchconsole": "development"
  }),
  labels: Object.freeze({
    kk: Object.freeze({ development: "Әзірлену үстінде", pilot: "Пилотта қолжетімді" }),
    ru: Object.freeze({ development: "В разработке", pilot: "Доступно в пилоте" }),
    en: Object.freeze({ development: "In development", pilot: "Available in pilot" })
  })
});
