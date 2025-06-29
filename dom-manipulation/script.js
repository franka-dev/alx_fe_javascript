let quotes = [];
let currentCategory = "all";

// Load quotes from localStorage or initialize
function loadQuotes() {
  const savedQuotes = localStorage.getItem("quotes");
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  } else {
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Don't cry because it's over, smile because it happened.", category: "Wisdom" }
    ];
    saveQuotes();
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save selected filter to localStorage
function saveCategoryFilter(category) {
  localStorage.setItem("selectedCategory", category);
}

// Restore last selected filter
function loadCategoryFilter() {
  const stored = localStorage.getItem("selectedCategory");
  if (stored) {
    currentCategory = stored;
    document.getElementById("categoryFilter").value = stored;
  }
}

// Populate unique categories in dropdown
function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  // Clear current options
  dropdown.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    dropdown.appendChild(option);
  });

  loadCategoryFilter(); // Set dropdown to saved value
}

// Show one random quote based on filter
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

// Filter quotes when category is selected
function filterQuotes() {
  currentCategory = document.getElementById("categoryFilter").value;
  saveCategoryFilter(currentCategory);
  showRandomQuote();
}

// Create form dynamically
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

// Add new quote, update dropdown if needed
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

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Export quotes to JSON
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

// Import from JSON file
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

// Restore last quote from session
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

// On load
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  loadLastViewedQuote();
  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
});
