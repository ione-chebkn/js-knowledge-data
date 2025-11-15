// ИМПОРТЫ
import fs from "fs/promises"
import { load } from "cheerio"
import { BASE_URL, SELECTORS, DEBUG_HTML_PATH } from "./config.js"

// ✅ SYNTAX - финальный список
const SYNTAX_ARTICLES = [
    // 1. База и теоретические статьи
    "intro",
    "manuals-specifications",
    "code-editors",
    "devtools",
    "hello-world",
    "structure",
    "strict-mode",

    // 2. Переменные и типы
    "variables",
    "types",
    "type-conversions",

    // 3. Операторы
    "operators",
    "comparison",
    "logical-operators",
    "nullish-operators",
    "bitwise-operators",

    // 4. Условия и циклы
    "ifelse",
    "switch",
    "while-for",

    // 5. Функции
    "function-basics",
    "function-expressions",
    "arrow-functions-basics",
    "arrow-functions",
    "recursion",
    "rest-parameters-spread-operator",
    "function-object",
    "new-function",

    // 6. Исключения
    "try-catch",
    "custom-errors",

    // 7. JSON
    "json",

    // 8. Итерируемость / базовые структуры
    "iterable",
    "array-methods",
    "map-set",
    "weakmap-weakset",
    "arraybuffer-binary-arrays",

    // 9. Строки и RegExp
    "string",
    "unicode",
    "regexp-introduction",
    "regexp-character-classes",
    "regexp-quantifiers",
    "regexp-alternation",
    "regexp-anchors",
    "regexp-unicode",
    "regexp-lookahead-lookbehind",
    "regexp-groups",
    "regexp-methods",
    "regexp-multiline-mode",
    "regexp-boundary",
    "regexp-escaping",
    "regexp-character-sets-and-ranges",
    "regexp-greedy-and-lazy",
    "regexp-backreferences",
    "regexp-sticky",

    // 10. Модули
    "modules-intro",
    "import-export",
    "modules-dynamic-imports",

    // 11. Прочие темы, перенесённые из концепций → в синтаксис
    "ninja-code",
    "coding-style",
    "comments",
    "debugging-chrome",

    // 12. Особенности JavaScript
    "javascript-specials",

    // 13. Устаревшие конструкции
    "var",
]

// Функция классификации статьи
function classifyArticle(articleId) {
    return SYNTAX_ARTICLES.includes(articleId) ? "syntax" : "concept"
}

// ОСНОВНЫЕ ФУНКЦИИ ПАРСЕРА:

async function loadPageHTML() {
    const htmlContent = await fs.readFile(DEBUG_HTML_PATH, "utf-8")
    const $ = load(htmlContent)
    return $
}

function getLearningSections($) {
    const learningSections = []

    $(SELECTORS.sections).each((index, section) => {
        const $section = $(section)
        const sectionName = $section.find("h2").html()

        if (sectionName) {
            learningSections.push($section)
        }
    })

    return learningSections
}

function parseSection($section, $) {
    const title = $section.find("h2").text().trim()
    const groups = []

    $section.find(SELECTORS.topicGroups).each((index, group) => {
        const $group = $(group)
        const groupData = parseArticleGroup($group, $)
        groups.push(groupData)
    })

    return { title, groups }
}

function parseArticleGroup($group, $) {
    const $groupTitleChEl = $group.find(".list__title")
    const groupTitle = $groupTitleChEl.text().trim()
    const groupHref = $groupTitleChEl.find("a").attr("href")
    const groupId = groupHref ? groupHref.slice(1) : groupTitle.toLowerCase().replace(/\s+/g, "-")

    const articles = []
    $group.find(".list-sub__link").each((ind, article) => {
        const $article = $(article)
        articles.push($article)
    })

    return {
        groupTitle,
        groupId,
        articles,
    }
}

// ФУНКЦИЯ: Парсинг секций статьи (только для concept статей)
async function parseArticleSections(articleUrl, isSyntax) {
    // Для синтаксических статей не парсим секции
    if (isSyntax) {
        return []
    }

    try {
        console.log(`  🔍 Парсим секции: ${articleUrl}`)

        const response = await fetch(articleUrl)
        const html = await response.text()
        const $ = load(html)

        const sections = []

        $(".sidebar__navigation-links .sidebar__link").each((index, element) => {
            const $link = $(element)
            const sectionTitle = $link.text().trim()
            const sectionHref = $link.attr("href")

            if (sectionTitle && sectionHref && sectionHref.startsWith("#")) {
                const sectionId = sectionHref.slice(1)

                const shouldSkip =
                    ["itogo", "comments", "comments-html", "summary", "tasks"].includes(sectionId) ||
                    sectionTitle.toLowerCase().includes("итого") ||
                    sectionTitle.toLowerCase().includes("комментарии") ||
                    sectionTitle.toLowerCase().includes("summary") ||
                    sectionTitle.toLowerCase().includes("резюме") ||
                    sectionTitle.toLowerCase().includes("задачи")

                if (!shouldSkip) {
                    sections.push({
                        id: sectionId,
                        title: sectionTitle,
                        url: `${articleUrl}${sectionHref}`,
                        applications: [],
                    })
                }
            }
        })

        return sections
    } catch (error) {
        console.log(`  ❌ Ошибка парсинга секций: ${articleUrl}`, error.message)
        return []
    }
}

// ФУНКЦИЯ: Парсинг статьи с классификацией
async function parseArticleFromCheerio($article) {
    const href = $article.attr("href")
    const id = href ? href.slice(1) : "unknown"
    const title = $article.text().trim()
    const url = href ? `${BASE_URL}${href}` : ""

    // КЛАССИФИКАЦИЯ по синтаксису
    const level = classifyArticle(id)
    const isSyntax = level === "syntax"

    // Для синтаксических статей не парсим секции, для концептуальных - парсим
    const sections = await parseArticleSections(url, isSyntax)

    // Для синтаксических статей progress = 100, для концептуальных = 0
    const progress = isSyntax ? 100 : 0

    return {
        id,
        title,
        url,
        level,
        sections, // пустой массив для syntax, с секциями для concept
        progress,
    }
}

// ФУНКЦИЯ: Преобразование в целевую структуру
function transformToTargetStructure(allParsedData) {
    const result = {}

    allParsedData.forEach((section) => {
        section.groups.forEach((group) => {
            const categoryId = group.groupId

            if (!result[categoryId]) {
                result[categoryId] = {
                    title: group.groupTitle,
                    articles: [],
                }
            }

            // Добавляем только распарсенные статьи (не Cheerio объекты)
            if (typeof group.articles[0] === "object" && group.articles[0].id) {
                group.articles.forEach((article) => {
                    result[categoryId].articles.push(article)
                })
            }
        })
    })

    return result
}

// ФУНКЦИЯ: Статистика классификации
function showClassificationStats(finalJSON) {
    let syntaxCount = 0
    let conceptCount = 0
    let totalSections = 0

    Object.values(finalJSON).forEach((category) => {
        category.articles.forEach((article) => {
            if (article.level === "syntax") {
                syntaxCount++
            } else {
                conceptCount++
            }
            totalSections += article.sections.length
        })
    })

    console.log(`\n📊 СТАТИСТИКА КЛАССИФИКАЦИИ:`)
    console.log(`✅ SYNTAX: ${syntaxCount} статей (progress: 100%, без секций)`)
    console.log(`🔵 CONCEPT: ${conceptCount} статей (progress: 0%, с секциями)`)
    console.log(`🔖 Всего секций: ${totalSections} (только в concept статьях)`)
    console.log(`📈 Соотношение: ${((syntaxCount / (syntaxCount + conceptCount)) * 100).toFixed(1)}% синтаксиса`)
}

// УПРОЩЕННАЯ ФУНКЦИЯ: Основная логика
async function parseLearnJSToCourses() {
    const $ = await loadPageHTML()
    const sections = getLearningSections($)

    const allParsedData = []
    let totalArticles = 0

    console.log("🚀 Запуск парсера с оптимизированной классификацией...")

    // ОДИН ПРОХОД: сразу парсим всё
    for (const $section of sections) {
        const sectionData = parseSection($section, $)

        const parsedGroups = []
        for (const group of sectionData.groups) {
            const parsedArticles = []

            // Парсим каждую статью в группе
            for (const $article of group.articles) {
                const articleData = await parseArticleFromCheerio($article)
                parsedArticles.push(articleData)
                totalArticles++

                // Показываем прогресс с разными иконками
                const symbol = articleData.level === "syntax" ? "✅" : "🔵"
                const sectionsInfo =
                    articleData.level === "syntax" ? "без секций" : `${articleData.sections.length} секций`
                console.log(`  ${symbol} ${articleData.id} - ${articleData.level} (${sectionsInfo})`)
            }

            parsedGroups.push({
                ...group,
                articles: parsedArticles, // заменяем Cheerio объекты на данные
            })
        }

        allParsedData.push({
            title: sectionData.title,
            groups: parsedGroups,
        })

        console.log(`📖 Раздел: ${sectionData.title} - ${parsedGroups.length} групп`)
    }

    const finalJSON = transformToTargetStructure(allParsedData)

    await fs.writeFile("knowledge-base.json", JSON.stringify(finalJSON, null, 2))

    const totalCategories = Object.keys(finalJSON).length

    console.log(`\n🎉 JSON сгенерирован успешно!`)
    console.log(`📊 Категорий: ${totalCategories}`)
    console.log(`📚 Статей: ${totalArticles}`)

    // Показываем статистику
    showClassificationStats(finalJSON)

    // Показываем примеры
    console.log(`\n🔍 Примеры статей:`)
    Object.values(finalJSON)
        .slice(0, 2)
        .forEach((category) => {
            category.articles.slice(0, 2).forEach((article) => {
                const symbol = article.level === "syntax" ? "✅" : "🔵"
                const progressInfo = article.level === "syntax" ? "progress: 100%" : "progress: 0%"
                const sectionsInfo = article.level === "syntax" ? "без секций" : `${article.sections.length} секций`
                console.log(`  ${symbol} ${article.id} - ${article.level} (${progressInfo}, ${sectionsInfo})`)
            })
        })

    return finalJSON
}

// Точка входа
async function main() {
    try {
        await parseLearnJSToCourses()
    } catch (error) {
        console.error("❌ Ошибка:", error)
    }
}

main()

// ЭКСПОРТ
export { parseLearnJSToCourses }
