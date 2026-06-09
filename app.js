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

let expenses = [];
let editingIndex = -1;

function loadExpenses() {
    const rawExpenses = localStorage.getItem("financeTrackerExpenses");
    if (!rawExpenses) {
        return [];
    }

    try {
        return JSON.parse(rawExpenses);
    } catch {
        return [];
    }
}

function saveExpenses() {
    localStorage.setItem("financeTrackerExpenses", JSON.stringify(expenses));
}

function getStoredIncomes() {
    const rawIncomes = localStorage.getItem("financeTrackerIncomes");
    if (!rawIncomes) {
        return [];
    }

    try {
        return JSON.parse(rawIncomes);
    } catch {
        return [];
    }
}

function computeStoredIncomeTotal() {
    const incomes = getStoredIncomes();
    return incomes.reduce((sum, income) => sum + Number(income.amount || 0), 0);
}

function formatCurrency(value) {
    return value.toFixed(2) + " лв";
}

function computeSummary() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = expenses.length;
    const average = count === 0 ? 0 : total / count;
    const highest = count === 0 ? 0 : Math.max(...expenses.map(expense => expense.amount));

    return {
        total,
        count,
        average,
        highest,
    };
}

function showError(message) {
    if (!formError) return;
    formError.textContent = message;
    formError.style.display = "block";
}

function clearError() {
    if (!formError) return;
    formError.textContent = "";
    formError.style.display = "none";
}

function validateExpense(category, amount) {
    const normalizedCategory = category.trim();
    const amountText = amount.trim();

    if (normalizedCategory === "") {
        return "Моля въведете име или категория на разхода.";
    }

    if (amountText === "") {
        return "Моля въведете сума.";
    }

    const normalizedAmount = Number(amountText);

    if (Number.isNaN(normalizedAmount)) {
        return "Моля въведете валидно число за сумата.";
    }

    if (normalizedAmount <= 0) {
        return "Сумата трябва да бъде по-голяма от 0.";
    }

    return "";
}

function renderExpenseList() {
    expenseList.innerHTML = "";

    if (expenses.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    expenses.forEach((expense, index) => {
        const item = document.createElement("li");
        item.className = "expense-item";

        const content = document.createElement("div");
        content.className = "expense-item-content";

        const category = document.createElement("span");
        category.className = "expense-category";
        category.textContent = expense.category;

        const amount = document.createElement("span");
        amount.className = "expense-amount";
        amount.textContent = formatCurrency(expense.amount);

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "button button--secondary expense-edit-button";
        editButton.textContent = "Редактирай";
        editButton.setAttribute("aria-label", `Редактирай разход ${expense.category} ${formatCurrency(expense.amount)}`);
        editButton.addEventListener("click", () => {
            setFormToEdit(index);
        });

        const buttonGroup = document.createElement("div");
        buttonGroup.className = "expense-actions";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "button button--danger expense-delete-button";
        deleteButton.textContent = "Изтрий";
        deleteButton.setAttribute("aria-label", `Изтрий разход ${expense.category} ${formatCurrency(expense.amount)}`);
        deleteButton.addEventListener("click", () => {
            removeExpense(index);
        });

        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);

        content.appendChild(category);
        content.appendChild(amount);
        item.appendChild(content);
        item.appendChild(buttonGroup);

        expenseList.appendChild(item);
    });
}

function setFormToEdit(index) {
    const expense = expenses[index];
    categoryInput.value = expense.category;
    amountInput.value = expense.amount;
    editingIndex = index;
    submitButton.textContent = "💾 Запази";
    categoryInput.focus();
}

function resetEditState() {
    editingIndex = -1;
    submitButton.textContent = "➕ Добавить разход";
}

function removeExpense(index) {
    expenses.splice(index, 1);
    saveExpenses();
    renderExpenseList();
    updateTotals();
}

function updateExpense(index, category, amount) {
    const validationMessage = validateExpense(category, amount);

    if (validationMessage) {
        showError(validationMessage);
        return false;
    }

    clearError();

    const normalizedCategory = category.trim();
    const normalizedAmount = Number(amount);

    expenses[index] = {
        category: normalizedCategory,
        amount: normalizedAmount,
    };

    renderExpenseList();
    updateTotals();
    resetEditState();

    return true;
}

function updateTotals() {
    const { total, count, average, highest } = computeSummary();
    const incomeTotal = computeStoredIncomeTotal();
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

function addExpense(category, amount) {
    const validationMessage = validateExpense(category, amount);

    if (validationMessage) {
        showError(validationMessage);
        return false;
    }

    clearError();

    const normalizedCategory = category.trim();
    const normalizedAmount = Number(amount);

    expenses.push({ category: normalizedCategory, amount: normalizedAmount });
    saveExpenses();
    renderExpenseList();
    updateTotals();
    return true;
}

function clearAllExpenses() {
    expenses = [];
    saveExpenses();
    renderExpenseList();
    updateTotals();
}

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let success;

    if (editingIndex !== -1) {
        success = updateExpense(editingIndex, categoryInput.value, amountInput.value);
    } else {
        success = addExpense(categoryInput.value, amountInput.value);
    }

    if (!success) {
        return;
    }

    categoryInput.value = "";
    amountInput.value = "";
    resetEditState();
    categoryInput.focus();
});

clearAllButton.addEventListener("click", function () {
    clearAllExpenses();
});

expenses = loadExpenses();
renderExpenseList();
updateTotals();
