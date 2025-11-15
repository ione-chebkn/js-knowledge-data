#!/usr/bin/env node
import { execSync } from "child_process"

const args = process.argv.slice(2)
const title = args.join(" ")

if (!title) {
    console.log('Usage: npm run task -- "описание задачи"')
    process.exit(1)
}

try {
    console.log("📝 Создаю задачу...")

    // Проверяем существует ли label 'task'
    try {
        execSync('gh label list | grep -q "task"', { stdio: "pipe" })
        console.log("✅ Label 'task' найден")
    } catch (error) {
        console.log("🔧 Создаю label 'task'...")
        execSync('gh label create "task" --description "Development task" --color "0E8A16"', {
            stdio: "inherit",
        })
    }

    // Создаем issue с лейблом task
    execSync(`gh issue create --title "Task: ${title}" --body "Задача: ${title}" --label "task"`, {
        stdio: "inherit",
    })

    console.log("✅ Задача создана! Используй номер в коммитах: feat: #номер описание")

    // Получаем номер созданной задачи для удобства
    console.log("\n🎯 Пример использования в коммите:")
    const issues = execSync("gh issue list --limit 1 --json number,title", { encoding: "utf8" })
    const issueData = JSON.parse(issues)
    if (issueData.length > 0) {
        const issueNumber = issueData[0].number
        console.log(`git commit -m "feat: #${issueNumber} ${title}"`)
    }
} catch (error) {
    console.log("❌ Ошибка:", error.message)
    console.log("\n💡 Проверь что:")
    console.log("   - Установлен GitHub CLI (gh)")
    console.log("   - Выполнен вход: gh auth login")
    console.log("   - Есть доступ к репозиторию")
}
