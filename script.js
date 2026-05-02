const historyEl = document.getElementById('history');
const currentEl = document.getElementById('current');

let currentInput = '0';
let previousInput = '';
let operator = null;
let justEvaluated = false;

function updateDisplay() {
  currentEl.textContent = currentInput;
  if (operator && previousInput) {
    const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[operator] || operator;
    historyEl.textContent = previousInput + ' ' + opSymbol;
  } else {
    historyEl.textContent = '';
  }
}

function appendDigit(digit) {
  if (justEvaluated) {
    currentInput = digit;
    justEvaluated = false;
  } else if (currentInput === '0') {
    currentInput = digit;
  } else if (currentInput.length >= 12) {
    return;
  } else {
    currentInput += digit;
  }
  updateDisplay();
}

function appendDecimal() {
  if (justEvaluated) {
    currentInput = '0.';
    justEvaluated = false;
    updateDisplay();
    return;
  }
  if (!currentInput.includes('.')) {
    currentInput += '.';
    updateDisplay();
  }
}

function setOperator(op) {
  if (operator && !justEvaluated && previousInput) {
    calculate(true);
  }
  previousInput = currentInput;
  operator = op;
  justEvaluated = false;
  currentInput = '0';
  updateDisplay();
}

function calculate(chaining = false) {
  if (!operator || !previousInput) return;

  const a = parseFloat(previousInput);
  const b = parseFloat(currentInput);
  let result;

  if (operator === '/' && b === 0) {
    currentInput = 'Error';
    previousInput = '';
    operator = null;
    justEvaluated = true;
    updateDisplay();
    return;
  }

  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = a / b; break;
  }

  currentInput = String(parseFloat(result.toPrecision(10)));
  if (!chaining) {
    previousInput = '';
    operator = null;
    justEvaluated = true;
  }
  updateDisplay();
}

function clearAll() {
  currentInput = '0';
  previousInput = '';
  operator = null;
  justEvaluated = false;
  updateDisplay();
}

function backspace() {
  if (justEvaluated || currentInput === 'Error') {
    clearAll();
    return;
  }
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
  updateDisplay();
}

function percent() {
  const val = parseFloat(currentInput);
  if (!isNaN(val)) {
    currentInput = String(val / 100);
    updateDisplay();
  }
}

document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case 'digit':    appendDigit(value); break;
    case 'decimal':  appendDecimal();    break;
    case 'operator': setOperator(value); break;
    case 'equals':   calculate();        break;
    case 'clear':    clearAll();         break;
    case 'backspace': backspace();       break;
    case 'percent':  percent();          break;
  }
});

updateDisplay();
