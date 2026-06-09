function loadJsonStorage(key) {
    const rawData = localStorage.getItem(key);
    if (!rawData) {
        return [];
    }

    try {
        return JSON.parse(rawData);
    } catch {
        return [];
    }
}

function saveJsonStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function parseAmount(value) {
    const parsed = Number(String(value).trim());
    return Number.isNaN(parsed) ? null : parsed;
}

function formatCurrency(value) {
    return Number(value || 0).toFixed(2) + " лв";
}

function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

function createActionButton(label, className, ariaLabel, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `button ${className}`;
    button.textContent = label;
    button.setAttribute("aria-label", ariaLabel);
    button.addEventListener("click", onClick);
    return button;
}

function computeStoredItemTotal(storageKey) {
    const items = loadJsonStorage(storageKey);
    return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}
