const expenseForm = document.getElementById("expenseForm");
const categoryInput = document.getElementById("categoryInput");
const amountInput = document.getElementById("amountInput");
const expenseList = document.getElementById("expenseList");
const emptyState = document.getElementById("emptyState");
const totalAmountEl = document.getElementById("totalAmount");
const totalCountEl = document.getElementById("totalCount");
const averageAmountEl = document.getElementById("averageAmount");
const statisticsTotal = document.getElementById("statisticsTotal");
const statisticsCount = document.getElementById("statisticsCount");
const statisticsHighest = document.getElementById("statisticsHighest");
const clearAllButton = document.getElementById("clearAllButton");
const formError = document.getElementById("formError");

let expenses = [];

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
        item.innerHTML = `
            <div class="expense-item-content">
                <span class="expense-category">${expense.category}</span>
                <span class="expense-amount">${formatCurrency(expense.amount)}</span>
            </div>
        `;

        expenseList.appendChild(item);
    });
}

function updateTotals() {
    const { total, count, average, highest } = computeSummary();

    totalAmountEl.textContent = formatCurrency(total);
    totalCountEl.textContent = count.toString();
    averageAmountEl.textContent = formatCurrency(average);

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
    renderExpenseList();
    updateTotals();
    return true;
}

function clearAllExpenses() {
    expenses = [];
    renderExpenseList();
    updateTotals();
}

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const added = addExpense(categoryInput.value, amountInput.value);

    if (!added) {
        return;
    }

    categoryInput.value = "";
    amountInput.value = "";
    categoryInput.focus();
});

clearAllButton.addEventListener("click", function () {
    clearAllExpenses();
});

renderExpenseList();
updateTotals();
