const STORAGE_KEY_INCOMES = "financeTrackerIncomes";
const STORAGE_KEY_EXPENSES = "financeTrackerExpenses";

const incomeForm = document.getElementById("incomeForm");
const incomeDescriptionInput = document.getElementById("incomeDescriptionInput");
const incomeAmountInput = document.getElementById("incomeAmountInput");
const incomeList = document.getElementById("incomeList");
const emptyIncomeState = document.getElementById("emptyIncomeState");
const totalIncomeAmountEl = document.getElementById("totalIncomeAmount");
const totalExpensesAmountEl = document.getElementById("totalExpensesAmount");
const balanceAmountEl = document.getElementById("balanceAmount");
const totalIncomeCountEl = document.getElementById("totalIncomeCount");
const incomeFormError = document.getElementById("incomeFormError");

const state = {
    incomes: [],
};

function loadIncomesFromStorage() {
    state.incomes = loadJsonStorage(STORAGE_KEY_INCOMES);
}

function saveIncomesToStorage() {
    saveJsonStorage(STORAGE_KEY_INCOMES, state.incomes);
}

function computeIncomeMetrics() {
    const total = state.incomes.reduce((sum, income) => sum + income.amount, 0);
    const count = state.incomes.length;
    return { total, count };
}

function setIncomeError(message) {
    if (!incomeFormError) return;
    incomeFormError.textContent = message;
    incomeFormError.style.display = "block";
}

function clearIncomeError() {
    if (!incomeFormError) return;
    incomeFormError.textContent = "";
    incomeFormError.style.display = "none";
}

function validateIncomeEntry(description, amountValue) {
    const descriptionValue = description.trim();
    if (descriptionValue === "") {
        return "Моля въведете описание на прихода.";
    }

    const parsedAmount = parseAmount(amountValue);
    if (parsedAmount === null) {
        return "Моля въведете валидно число за сумата.";
    }

    if (parsedAmount <= 0) {
        return "Сумата трябва да бъде по-голяма от 0.";
    }

    return "";
}

function createIncomeListItem(income, index) {
    const item = document.createElement("li");
    item.className = "expense-item";

    const content = document.createElement("div");
    content.className = "expense-item-content";
    content.append(
        createTextElement("span", "expense-category", income.description),
        createTextElement("span", "expense-amount", formatCurrency(income.amount))
    );

    const buttons = document.createElement("div");
    buttons.className = "expense-actions";
    buttons.append(
        createActionButton(
            "Изтрий",
            "button--danger expense-delete-button",
            `Изтрий приход ${income.description} ${formatCurrency(income.amount)}`,
            () => removeIncome(index)
        )
    );

    item.append(content, buttons);
    return item;
}

function renderIncomeList() {
    incomeList.innerHTML = "";

    if (state.incomes.length === 0) {
        emptyIncomeState.style.display = "block";
        return;
    }

    emptyIncomeState.style.display = "none";
    state.incomes.forEach((income, index) => incomeList.appendChild(createIncomeListItem(income, index)));
}

function removeIncome(index) {
    state.incomes.splice(index, 1);
    saveIncomesToStorage();
    renderIncomeList();
    refreshIncomeSummary();
}

function refreshIncomeSummary() {
    const { total, count } = computeIncomeMetrics();
    const expenseTotal = computeStoredItemTotal(STORAGE_KEY_EXPENSES);
    const balance = total - expenseTotal;

    totalIncomeAmountEl.textContent = formatCurrency(total);
    totalExpensesAmountEl.textContent = formatCurrency(expenseTotal);
    balanceAmountEl.textContent = formatCurrency(balance);
    totalIncomeCountEl.textContent = count.toString();
}

function addIncomeEntry(description, amountValue) {
    const validationMessage = validateIncomeEntry(description, amountValue);
    if (validationMessage) {
        setIncomeError(validationMessage);
        return false;
    }

    clearIncomeError();
    state.incomes.push({ description: description.trim(), amount: parseAmount(amountValue) });
    saveIncomesToStorage();
    renderIncomeList();
    refreshIncomeSummary();
    return true;
}

function handleIncomeFormSubmit(event) {
    event.preventDefault();

    const added = addIncomeEntry(incomeDescriptionInput.value, incomeAmountInput.value);
    if (!added) {
        return;
    }

    incomeDescriptionInput.value = "";
    incomeAmountInput.value = "";
    incomeDescriptionInput.focus();
}

incomeForm.addEventListener("submit", handleIncomeFormSubmit);

loadIncomesFromStorage();
renderIncomeList();
refreshIncomeSummary();
