const historyEl = document.getElementById('history');
const currentEl = document.getElementById('current');

let currentInput = '0';
let previousInput = '';
let operator = null;
let justEvaluated = false;
let lastOperator = null;
let lastOperand = null;

function formatForDisplay(str) {
  if (str === 'Error') return str;
  const num = parseFloat(str);
  if (isNaN(num)) return str;
  // keep trailing dot while user is typing (e.g. "3.")
  const hasTrailingDot = str.endsWith('.');
  const formatted = num.toLocaleString('en-US', { maximumFractionDigits: 10 });
  return hasTrailingDot ? formatted + '.' : formatted;
}

function updateDisplay() {
  currentEl.textContent = formatForDisplay(currentInput);
  if (operator && previousInput) {
    const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[operator] || operator;
    historyEl.textContent = formatForDisplay(previousInput) + ' ' + opSymbol;
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
  // after evaluation, use result as left operand
  if (justEvaluated) {
    justEvaluated = false;
  } else if (operator && previousInput) {
    // chain: evaluate pending operation first
    calculate(true);
  }
  previousInput = currentInput;
  operator = op;
  currentInput = '0';
  updateDisplay();
}

function evaluate(a, op, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
  }
}

function calculate(chaining = false) {
  if (!operator || !previousInput) {
    // repeat last operation on subsequent "=" presses
    if (justEvaluated && lastOperator !== null && lastOperand !== null) {
      const a = parseFloat(currentInput);
      if (lastOperator === '/' && lastOperand === 0) {
        currentInput = 'Error';
        justEvaluated = true;
        updateDisplay();
        return;
      }
      const result = evaluate(a, lastOperator, lastOperand);
      currentInput = String(parseFloat(result.toPrecision(10)));
      updateDisplay();
    }
    return;
  }

  const a = parseFloat(previousInput);
  const b = parseFloat(currentInput);

  if (operator === '/' && b === 0) {
    currentInput = 'Error';
    previousInput = '';
    operator = null;
    justEvaluated = true;
    updateDisplay();
    return;
  }

  const result = evaluate(a, operator, b);

  if (!chaining) {
    lastOperator = operator;
    lastOperand = b;
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
  lastOperator = null;
  lastOperand = null;
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
    case 'digit':     appendDigit(value); break;
    case 'decimal':   appendDecimal();    break;
    case 'operator':  setOperator(value); break;
    case 'equals':    calculate();        break;
    case 'clear':     clearAll();         break;
    case 'backspace': backspace();        break;
    case 'percent':   percent();          break;
  }
});

updateDisplay();

// keyboard support
const keyMap = {
  '0': ['digit', '0'], '1': ['digit', '1'], '2': ['digit', '2'],
  '3': ['digit', '3'], '4': ['digit', '4'], '5': ['digit', '5'],
  '6': ['digit', '6'], '7': ['digit', '7'], '8': ['digit', '8'],
  '9': ['digit', '9'],
  '.': ['decimal'],
  ',': ['decimal'],
  '+': ['operator', '+'],
  '-': ['operator', '-'],
  '*': ['operator', '*'],
  '/': ['operator', '/'],
  'Enter': ['equals'],
  '=': ['equals'],
  'Backspace': ['backspace'],
  'Escape': ['clear'],
  'Delete': ['clear'],
  '%': ['percent'],
};

document.addEventListener('keydown', (e) => {
  const mapping = keyMap[e.key];
  if (!mapping) return;
  e.preventDefault();

  const [action, value] = mapping;
  switch (action) {
    case 'digit':     appendDigit(value); break;
    case 'decimal':   appendDecimal();    break;
    case 'operator':  setOperator(value); break;
    case 'equals':    calculate();        break;
    case 'clear':     clearAll();         break;
    case 'backspace': backspace();        break;
    case 'percent':   percent();          break;
  }

  // flash the corresponding button
  const selector = value
    ? `button[data-action="${action}"][data-value="${value}"]`
    : `button[data-action="${action}"]`;
  const btn = document.querySelector(selector);
  if (btn) {
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 100);
  }
});
