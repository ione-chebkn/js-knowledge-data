import fs from "fs/promises"
import { load } from "cheerio"
import { DEBUG_HTML_PATH } from "./config.js"

// 1. Проверить есть ли сохраненный HTML файл
let htmlContent
try {
    // Пытаемся прочитать существующий файл
    htmlContent = await fs.readFile(DEBUG_HTML_PATH, "utf-8")
    console.log("📁 Используем сохраненный HTML файл")
} catch (error) {
    // Если файла нет - скачиваем и сохраняем
    console.log("🌐 Скачиваем свежий HTML")
    htmlContent = await fetch("https://learn.javascript.ru/").then((data) => data.text())
    await fs.writeFile(DEBUG_HTML_PATH, htmlContent)
    console.log("💾 HTML сохранен в файл")
}

// 2. Парсим HTML (из файла или сети)
const $ = load(htmlContent)

// СТРУКТУРА САЙТА:
// - Раздел 1: "Язык JavaScript" (96 статей) → basics
// - Раздел 2: "" (0 статей) → ИСКЛЮЧИТЬ
// - Раздел 3: "Браузер: документ, события, интерфейсы" (32 статьи) → browser
// - Раздел 4: "Тематические разделы" (66 статей) → additional

console.log("🎯 Найдено разделов:", $(".tabs__content-inner").length)

// 3. Анализируем разделы (исключая пустой раздел 2)
$(".tabs__content-inner").each((sectionIndex, section) => {
    const $section = $(section)
    const title = $section.find("h2").text().trim()
    const articleCount = $section.find(".list-sub__link").length

    // Пропускаем пустые разделы
    if (articleCount === 0) return

    console.log(`\n📖 Раздел ${sectionIndex + 1}: "${title}"`)
    console.log(`   📚 Статей: ${articleCount}`)

    // Покажем первые 3 статьи для идентификации
    $section
        .find(".list-sub__link")
        .slice(0, 3)
        .each((i, el) => {
            const $el = $(el)
            console.log(`   - ${$el.text().trim()} (${$el.attr("href")})`)
        })
})

console.log("\n🔍 Для обновления HTML удали файл: crawler/debug-page.html")
