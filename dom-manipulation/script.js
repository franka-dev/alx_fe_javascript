// script.js - Updated with correct JSONPlaceholder URL

let quotes = [];
let currentCategory = "all";

function loadQuotes() {
  const savedQuotes = localStorage.getItem("quotes");
  quotes = savedQuotes ? JSON.parse(savedQuotes) : [];
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveCategoryFilter(category) {
  localStorage.setItem("selectedCategory", category);
}

function loadCategoryFilter() {
  const stored = localStorage.getItem("selectedCategory");
  if (stored) {
    currentCategory = stored;
    document.getElementById("categoryFilter").value = stored;
  }
}

function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  dropdown.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });
  loadCategoryFilter();
}

function showRandomQuote() {
  const filtered = currentCategory === "all" ? quotes : quotes.filter(q => q.category === currentCategory);
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes available in this category.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `
    <p><strong>Quote:</strong> ${quote.text}</p>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function filterQuotes() {
  currentCategory = document.getElementById("categoryFilter").value;
  saveCategoryFilter(currentCategory);
  showRandomQuote();
}

function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = "";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addBtn);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Both fields are required.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added!");
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid file format");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Import failed. Check file format.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

function loadLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    document.getElementById("quoteDisplay").innerHTML = `
      <p><strong>Quote:</strong> ${quote.text}</p>
      <p><strong>Category:</strong> ${quote.category}</p>
    `;
  }
}

function showNotification(message) {
  const div = document.createElement("div");
  div.textContent = message;
  div.style.cssText = "position:fixed;bottom:10px;right:10px;background:#333;color:white;padding:10px;border-radius:5px;z-index:1000";
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// ✅ fetchQuotesFromServer - using JSONPlaceholder
async function fetchQuotesFromServer() {
  const url = "https://jsonplaceholder.typicode.com/posts";
  try {
    const response = await fetch(url);
    const serverQuotes = await response.json();

    let changes = 0;
    serverQuotes.forEach(serverQuote => {
      const newQuote = {
        text: serverQuote.title,
        category: "Server"
      };
      const exists = quotes.find(q => q.text === newQuote.text);
      if (!exists) {
        quotes.push(newQuote);
        changes++;
      }
    });

    if (changes > 0) {
      saveQuotes();
      populateCategories();
      showNotification(`🔄 Synced ${changes} new quote(s) from server`);
    }
  } catch (error) {
    showNotification("⚠️ Failed to fetch from server");
    console.error("Server fetch error:", error);
  }
}

// ✅ INIT

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  loadLastViewedQuote();
  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  fetchQuotesFromServer(); // Initial fetch
  setInterval(fetchQuotesFromServer, 30000); // Sync every 30 seconds
});
