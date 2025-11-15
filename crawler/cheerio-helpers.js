import { load } from "cheerio"

/**
 * Хелперы для работы с Cheerio
 */

// 1. findAll - работает с корневым $ или Cheerio объектом
export function findAll($context, selector) {
    // Если это корневой $ объект
    if (typeof $context === "function") {
        const elements = []
        $context(selector).each((i, el) => {
            elements.push($context(el))
        })
        return elements
    }
    // Если это уже Cheerio объект
    else {
        const elements = []
        $context.find(selector).each((i, el) => {
            elements.push($context.constructor(el))
        })
        return elements
    }
}

// 2. Безопасное получение атрибута
export function getAttr($element, attrName) {
    return $element.attr(attrName) || ""
}

// 3. Преобразование Cheerio коллекции в массив Cheerio объектов
export function toArray($collection) {
    const result = []
    $collection.each((i, el) => {
        result.push($collection.constructor(el))
    })
    return result
}

// 4. ForEach для Cheerio коллекций
export function forEach($collection, callback) {
    $collection.each((i, el) => {
        callback($collection.constructor(el), i)
    })
}

// 5. Map для Cheerio коллекций
export function map($collection, callback) {
    const result = []
    $collection.each((i, el) => {
        result.push(callback($collection.constructor(el), i))
    })
    return result
}
