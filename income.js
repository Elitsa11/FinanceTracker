const incomeForm = document.getElementById("incomeForm");
const incomeDescriptionInput = document.getElementById("incomeDescriptionInput");
const incomeAmountInput = document.getElementById("incomeAmountInput");
const incomeList = document.getElementById("incomeList");
const emptyIncomeState = document.getElementById("emptyIncomeState");
const totalIncomeAmountEl = document.getElementById("totalIncomeAmount");
const totalIncomeCountEl = document.getElementById("totalIncomeCount");
const incomeFormError = document.getElementById("incomeFormError");

let incomes = [];

function formatCurrency(value) {
    return value.toFixed(2) + " лв";
}

function showIncomeError(message) {
    if (!incomeFormError) return;
    incomeFormError.textContent = message;
    incomeFormError.style.display = "block";
}

function clearIncomeError() {
    if (!incomeFormError) return;
    incomeFormError.textContent = "";
    incomeFormError.style.display = "none";
}

function validateIncome(description, amount) {
    const normalizedDescription = description.trim();
    const amountText = amount.trim();

    if (normalizedDescription === "") {
        return "Моля въведете описание на прихода.";
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

function renderIncomeList() {
    incomeList.innerHTML = "";

    if (incomes.length === 0) {
        emptyIncomeState.style.display = "block";
        return;
    }

    emptyIncomeState.style.display = "none";

    incomes.forEach((income, index) => {
        const item = document.createElement("li");
        item.className = "expense-item";

        const content = document.createElement("div");
        content.className = "expense-item-content";

        const description = document.createElement("span");
        description.className = "expense-category";
        description.textContent = income.description;

        const amount = document.createElement("span");
        amount.className = "expense-amount";
        amount.textContent = formatCurrency(income.amount);

        const buttonGroup = document.createElement("div");
        buttonGroup.className = "expense-actions";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "button button--danger expense-delete-button";
        deleteButton.textContent = "Изтрий";
        deleteButton.setAttribute("aria-label", `Изтрий приход ${income.description} ${formatCurrency(income.amount)}`);
        deleteButton.addEventListener("click", () => {
            removeIncome(index);
        });

        buttonGroup.appendChild(deleteButton);
        content.appendChild(description);
        content.appendChild(amount);
        item.appendChild(content);
        item.appendChild(buttonGroup);

        incomeList.appendChild(item);
    });
}

function removeIncome(index) {
    incomes.splice(index, 1);
    renderIncomeList();
    updateIncomeTotals();
}

function computeIncomeSummary() {
    const total = incomes.reduce((sum, income) => sum + income.amount, 0);
    const count = incomes.length;

    return { total, count };
}

function updateIncomeTotals() {
    const { total, count } = computeIncomeSummary();
    totalIncomeAmountEl.textContent = formatCurrency(total);
    totalIncomeCountEl.textContent = count.toString();
}

function addIncome(description, amount) {
    const validationMessage = validateIncome(description, amount);

    if (validationMessage) {
        showIncomeError(validationMessage);
        return false;
    }

    clearIncomeError();

    const normalizedDescription = description.trim();
    const normalizedAmount = Number(amount);

    incomes.push({ description: normalizedDescription, amount: normalizedAmount });
    renderIncomeList();
    updateIncomeTotals();
    return true;
}

incomeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const added = addIncome(incomeDescriptionInput.value, incomeAmountInput.value);
    if (!added) {
        return;
    }

    incomeDescriptionInput.value = "";
    incomeAmountInput.value = "";
    incomeDescriptionInput.focus();
});

renderIncomeList();
updateIncomeTotals();
