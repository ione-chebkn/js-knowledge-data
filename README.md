# JS Knowledge Data 📚

База знаний JavaScript с автоматической синхронизацией статей learn.javascript.ru и трекингом практического применения.

## 🎯 Назначение

Централизованное хранилище для:

-   Статей и подтем learn.javascript.ru
-   Связей "теория → практика" (коммиты проектов)
-   Прогресса изучения JavaScript

## 🏗️ Структура данных

```json
{
    "article-id": {
        "id": "closures",
        "title": "Замыкания",
        "url": "https://learn.javascript.ru/closures",
        "level": "concept",
        "progress": 75,
        "sections": [
            {
                "id": "lexical-environment",
                "title": "Лексическое окружение",
                "applications": [
                    {
                        "project": "js-calculator",
                        "commit": "abc123",
                        "commitUrl": "https://github.com/.../commit/abc123"
                    }
                ]
            }
        ]
    }
}
```

## 🔧 Использование

Данные автоматически обновляются из:

🔗 Ваших проектов (через js-knowledge-tracker)
https://github.com/ione-chebkn/js-knowledge-tracker

## 📈 В планах

Визуализация прогресса (графики, дашборд)

API для доступа к данным

Интеграция с другими учебными ресурсами
