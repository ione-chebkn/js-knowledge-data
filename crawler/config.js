// СТРУКТУРА САЙТА:
// - Раздел 1: "Язык JavaScript" (96 статей) → basics
// - Раздел 2: "" (0 статей) → ИСКЛЮЧИТЬ
// - Раздел 3: "Браузер: документ, события, интерфейсы" (32 статьи) → browser
// - Раздел 4: "Тематические разделы" (66 статей) → additional

export const BASE_URL = "https://learn.javascript.ru"
export const SELECTORS = {
    sections: ".tabs__content-inner", // 4 раздела (2й пустой - исключить)
    sectionTitle: "h2:first-child", // название раздела
    topicGroups: ".list__item", // группы статей
    topicTitle: ".list__title", // название темы
    articles: ".list-sub__link", // ссылки на статьи
    articleUrl: "href", // атрибут href статьи
    articleTitle: "text", // текст ссычки статьи
}

// МАППИНГ РАЗДЕЛОВ В ID (как в твоем ручном JSON)
export const SECTION_MAPPING = {
    "Язык JavaScript": "basics",
    "Браузер: документ, события, интерфейсы": "browser",
    "Тематические разделы": "additional",
    // functions, objects, advanced, events, arrays - будут внутри этих разделов
}

export const DEBUG_HTML_PATH = "crawler/debug-page.html"
