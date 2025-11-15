// ИМПОРТЫ
import fs from "fs/promises"
import { load } from "cheerio"
import { BASE_URL, SELECTORS, SECTION_MAPPING, DEBUG_HTML_PATH } from "./config.js"

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
    // Добавил $ как параметр
    const title = $section.find("h2").text().trim()
    const groups = []

    $section.find(SELECTORS.topicGroups).each((index, group) => {
        const $group = $(group)
        const groupData = parseArticleGroup($group, $) // Передаем $
        groups.push(groupData)
    })

    return { title, groups }
}

function parseArticleGroup($group, $) {
    // Добавил $ как параметр
    const $groupTitleChEl = $group.find(".list__title")
    const groupTitle = $groupTitleChEl.text().trim()
    const groupHref = $groupTitleChEl.find("a").attr("href")
    const groupId = groupHref ? groupHref.slice(1) : groupTitle.toLowerCase().replace(/\s+/g, "-")

    const articles = []
    $group.find(".list-sub__link").each((ind, article) => {
        const $article = $(article)
        const articleData = parseArticle($article, $) // Передаем $
        articles.push(articleData)
    })

    return {
        groupTitle,
        groupId,
        articles,
    }
}

function parseArticle($article, $) {
    // Добавил $ как параметр
    const href = $article.attr("href")
    const id = href ? href.slice(1) : "unknown"
    const title = $article.text().trim()
    const url = href ? `${BASE_URL}${href}` : ""

    return { id, title, url, applied: false }
}

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

            group.articles.forEach((article) => {
                result[categoryId].articles.push(article)
            })
        })
    })

    return result
}

async function parseLearnJSToCourses() {
    const $ = await loadPageHTML()
    const sections = getLearningSections($)

    const allParsedData = []

    for (const $section of sections) {
        const sectionData = parseSection($section, $) // Передаем $

        const parsedGroups = []
        for (const group of sectionData.groups) {
            const parsedGroup = {
                ...group,
            }
            parsedGroups.push(parsedGroup)
        }

        const parsedSection = {
            title: sectionData.title,
            groups: parsedGroups,
        }
        allParsedData.push(parsedSection)

        console.log(`📖 Раздел: ${sectionData.title} - ${parsedGroups.length} групп`)
    }

    const finalJSON = transformToTargetStructure(allParsedData)

    await fs.writeFile("knowledge-base-generated.json", JSON.stringify(finalJSON, null, 2))

    const totalCategories = Object.keys(finalJSON).length
    const totalArticles = Object.values(finalJSON).reduce((sum, category) => sum + category.articles.length, 0)

    console.log(`\n🎉 JSON сгенерирован успешно!`)
    console.log(`📊 Категорий: ${totalCategories}`)
    console.log(`📚 Статей: ${totalArticles}`)
    console.log(`💾 Файл: knowledge-base-generated.json`)

    console.log(`\n🔍 Примеры категорий:`)
    Object.entries(finalJSON)
        .slice(0, 3)
        .forEach(([categoryId, category]) => {
            console.log(`  ${categoryId}: "${category.title}" - ${category.articles.length} статей`)
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
