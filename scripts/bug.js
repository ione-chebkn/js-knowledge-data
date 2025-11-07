#!/usr/bin/env node
import { execSync } from "child_process"

const args = process.argv.slice(2)
const title = args.join(" ")

if (!title) {
    console.log('Usage: npm run bug -- "описание бага"')
    process.exit(1)
}

// Создаем issue в GitHub
execSync(`gh issue create --title "Bug: ${title}" --body "Баг обнаружен" --label "bug" --assignee "@me"`, {
    stdio: "inherit",
})

console.log("🐛 Баг зарегистрирован!")
