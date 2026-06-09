const STORAGE_KEY_EXPENSES = "financeTrackerExpenses";
const STORAGE_KEY_INCOMES = "financeTrackerIncomes";

const expenseForm = document.getElementById("expenseForm");
const categoryInput = document.getElementById("categoryInput");
const amountInput = document.getElementById("amountInput");
const expenseList = document.getElementById("expenseList");
const emptyState = document.getElementById("emptyState");
const totalAmountEl = document.getElementById("totalAmount");
const totalCountEl = document.getElementById("totalCount");
const averageAmountEl = document.getElementById("averageAmount");
const overallIncomeEl = document.getElementById("overallIncome");
const overallExpensesEl = document.getElementById("overallExpenses");
const balanceAmountEl = document.getElementById("balanceAmount");
const statisticsTotal = document.getElementById("statisticsTotal");
const statisticsCount = document.getElementById("statisticsCount");
const statisticsHighest = document.getElementById("statisticsHighest");
const clearAllButton = document.getElementById("clearAllButton");
const formError = document.getElementById("formError");
const submitButton = expenseForm.querySelector("button[type='submit']");

const state = {
    expenses: [],
    editingIndex: -1,
};

function loadExpensesFromStorage() {
    state.expenses = loadJsonStorage(STORAGE_KEY_EXPENSES);
}

function saveExpensesToStorage() {
    saveJsonStorage(STORAGE_KEY_EXPENSES, state.expenses);
}

function computeExpenseMetrics() {
    const total = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = state.expenses.length;
    const average = count === 0 ? 0 : total / count;
    const highest = count === 0 ? 0 : Math.max(...state.expenses.map(expense => expense.amount));

    return { total, count, average, highest };
}

function setError(message) {
    if (!formError) return;
    formError.textContent = message;
    formError.style.display = "block";
}

function clearError() {
    if (!formError) return;
    formError.textContent = "";
    formError.style.display = "none";
}

function validateExpenseEntry(category, amountValue) {
    const categoryValue = category.trim();
    if (categoryValue === "") {
        return "Моля въведете име или категория на разхода.";
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

function createExpenseListItem(expense, index) {
    const item = document.createElement("li");
    item.className = "expense-item";

    const content = document.createElement("div");
    content.className = "expense-item-content";
    content.append(
        createTextElement("span", "expense-category", expense.category),
        createTextElement("span", "expense-amount", formatCurrency(expense.amount))
    );

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "expense-actions";

    const editButton = createActionButton(
        "Редактирай",
        "button--secondary expense-edit-button",
        `Редактирай разход ${expense.category} ${formatCurrency(expense.amount)}`,
        () => setExpenseEditMode(index)
    );

    const deleteButton = createActionButton(
        "Изтрий",
        "button--danger expense-delete-button",
        `Изтрий разход ${expense.category} ${formatCurrency(expense.amount)}`,
        () => removeExpense(index)
    );

    buttonGroup.append(editButton, deleteButton);
    item.append(content, buttonGroup);
    return item;
}

function renderExpenseList() {
    expenseList.innerHTML = "";

    if (state.expenses.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    state.expenses.forEach((expense, index) => {
        expenseList.appendChild(createExpenseListItem(expense, index));
    });
}

function setExpenseEditMode(index) {
    const expense = state.expenses[index];
    categoryInput.value = expense.category;
    amountInput.value = expense.amount;
    state.editingIndex = index;
    submitButton.textContent = "💾 Запази";
    categoryInput.focus();
}

function resetExpenseFormState() {
    state.editingIndex = -1;
    submitButton.textContent = "➕ Добави разход";
}

function removeExpense(index) {
    state.expenses.splice(index, 1);
    saveExpensesToStorage();
    renderExpenseList();
    refreshExpenseSummary();
}

function addExpenseEntry(category, amountValue) {
    const validationMessage = validateExpenseEntry(category, amountValue);
    if (validationMessage) {
        setError(validationMessage);
        return false;
    }

    clearError();
    state.expenses.push({ category: category.trim(), amount: parseAmount(amountValue) });
    saveExpensesToStorage();
    renderExpenseList();
    refreshExpenseSummary();
    return true;
}

function updateExpenseEntry(index, category, amountValue) {
    const validationMessage = validateExpenseEntry(category, amountValue);
    if (validationMessage) {
        setError(validationMessage);
        return false;
    }

    clearError();
    state.expenses[index] = { category: category.trim(), amount: parseAmount(amountValue) };
    saveExpensesToStorage();
    renderExpenseList();
    refreshExpenseSummary();
    resetExpenseFormState();
    return true;
}

function refreshExpenseSummary() {
    const { total, count, average, highest } = computeExpenseMetrics();
    const incomeTotal = computeStoredItemTotal(STORAGE_KEY_INCOMES);
    const balance = incomeTotal - total;

    totalAmountEl.textContent = formatCurrency(total);
    totalCountEl.textContent = count.toString();
    averageAmountEl.textContent = formatCurrency(average);
    overallIncomeEl.textContent = formatCurrency(incomeTotal);
    overallExpensesEl.textContent = formatCurrency(total);
    balanceAmountEl.textContent = formatCurrency(balance);

    statisticsTotal.textContent = formatCurrency(total);
    statisticsCount.textContent = count.toString();
    statisticsHighest.textContent = formatCurrency(highest);
}

function clearAllExpenses() {
    state.expenses = [];
    saveExpensesToStorage();
    renderExpenseList();
    refreshExpenseSummary();
}

function handleExpenseFormSubmit(event) {
    event.preventDefault();

    const categoryValue = categoryInput.value;
    const amountValue = amountInput.value;
    const isUpdate = state.editingIndex !== -1;

    const success = isUpdate
        ? updateExpenseEntry(state.editingIndex, categoryValue, amountValue)
        : addExpenseEntry(categoryValue, amountValue);

    if (!success) {
        return;
    }

    categoryInput.value = "";
    amountInput.value = "";
    resetExpenseFormState();
    categoryInput.focus();
}

expenseForm.addEventListener("submit", handleExpenseFormSubmit);
clearAllButton.addEventListener("click", clearAllExpenses);

loadExpensesFromStorage();
renderExpenseList();
refreshExpenseSummary();
