let people = JSON.parse(localStorage.getItem('settlePeople')) || [];
let expenses = JSON.parse(localStorage.getItem('settleExpenses')) || [];

function saveData() {
  localStorage.setItem('settlePeople', JSON.stringify(people));
  localStorage.setItem('settleExpenses', JSON.stringify(expenses));
}

function addPerson() {
  let name = document.getElementById('personName').value.trim();
  if(name &&!people.includes(name)) {
    people.push(name);
    document.getElementById('personName').value = '';
    saveData();
    render();
  } else {
    alert("Name already exists or field is empty!")
  }
}

function addExpense() {
  let paidBy = document.getElementById('paidBy').value.trim();
  let amount = parseFloat(document.getElementById('amount').value);
  let reason = document.getElementById('reason').value.trim();
  if(paidBy && amount > 0 && reason && people.includes(paidBy)) {
    expenses.push({paidBy, amount, reason, date: new Date().toLocaleDateString()});
    document.getElementById('paidBy').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('reason').value = '';
    saveData();
    render();
  } else {
    alert("Please fill all fields correctly! 'Who Paid' name must be in Friends list")
  }
}

function calculateSettlements() {
  if(people.length < 2) return [];
  let balances = {};
  people.forEach(p => balances[p] = 0);

  expenses.forEach(exp => {
    let share = exp.amount / people.length;
    people.forEach(p => {
      if(p === exp.paidBy) balances[p] += exp.amount - share;
      else balances[p] -= share;
    });
  });

  let result = [];
  let tempBalances = {...balances};
  people.forEach(debtor => {
    people.forEach(creditor => {
      if(tempBalances[debtor] < -0.5 && tempBalances[creditor] > 0.5) {
        let amt = Math.min(-tempBalances[debtor], tempBalances[creditor]);
        result.push({from: debtor, to: creditor, amount: amt.toFixed(0)});
        tempBalances[debtor] += amt;
        tempBalances[creditor] -= amt;
      }
    });
  });
  return result;
}

function clearAll() {
  if(confirm("Are you sure you want to delete all data?")) {
    people = [];
    expenses = [];
    saveData();
    render();
  }
}

function render() {
  document.getElementById('peopleList').innerHTML = people.map(p => `<span>${p}</span>`).join('') || "<p style='font-size:13px;'>Add at least 2 people</p>";

  document.getElementById('expenseList').innerHTML = expenses.map(e =>
    `<div class="expense-item"><span>${e.paidBy} paid ₹${e.amount} for ${e.reason}</span><span style="opacity:0.6;">${e.date}</span></div>`
  ).join('') || "<p>No expenses added yet</p>";

  let settlements = calculateSettlements();
  document.getElementById('settleList').innerHTML = settlements.map(s =>
    `<div class="settle">${s.from} → ${s.to}: ₹${s.amount} <a href="upi://pay?pa=yourupi@upi&pn=${s.to}&am=${s.amount}" class="upi-link">Pay</a></div>`
  ).join('') || '<p style="color:green;">All settled! 🎉</p>';
}

render();