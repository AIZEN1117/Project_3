// --- Seed data (first load) ---
const DEFAULT_BOOKS = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin", available: true },
  { id: 2, title: "You Don't Know JS", author: "Kyle Simpson", available: true },
  { id: 3, title: "Eloquent JavaScript", author: "Marijn Haverbeke", available: false },
  { id: 4, title: "Introduction to Algorithms", author: "Cormen et al.", available: true },
  { id: 5, title: "The Pragmatic Programmer", author: "Andrew Hunt", available: true },
  { id: 6, title: "Design Patterns", author: "Gamma et al.", available: false }
];

const STORAGE_KEY = "library_books_v1";

// --- State helpers ---
function loadBooks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BOOKS));
    return [...DEFAULT_BOOKS];
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BOOKS));
    return [...DEFAULT_BOOKS];
  }
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// --- Render catalog ---
function renderCatalog(books) {
  const catalog = document.getElementById("catalog");
  catalog.innerHTML = "";

  if (!books.length) {
    catalog.innerHTML = `<div class="card"><p>No books found.</p></div>`;
    return;
  }

  books.forEach(book => {
    const card = document.createElement("div");
    card.className = "card";

    const statusClass = book.available ? "available" : "borrowed";
    const statusText = book.available ? "Available" : "Borrowed";

    card.innerHTML = `
      <h3>${book.title}</h3>
      <div class="meta">by ${book.author}</div>
      <span class="badge ${statusClass}">${statusText}</span>
      <div class="card-actions">
        <button class="action borrow" ${book.available ? "" : "disabled"}>Borrow</button>
        <button class="action return" ${book.available ? "disabled" : ""}>Return</button>
      </div>
    `;

    const borrowBtn = card.querySelector(".borrow");
    const returnBtn = card.querySelector(".return");

    borrowBtn.addEventListener("click", () => updateAvailability(book.id, false));
    returnBtn.addEventListener("click", () => updateAvailability(book.id, true));

    catalog.appendChild(card);
  });
}

// --- Update availability ---
function updateAvailability(id, makeAvailable) {
  const books = loadBooks();
  const idx = books.findIndex(b => b.id === id);
  if (idx !== -1) {
    books[idx].available = makeAvailable;
    saveBooks(books);
    applyFiltersAndRender(); // re-render with current filters
  }
}

// --- Filters & search ---
function applyFiltersAndRender() {
  const books = loadBooks();
  const query = document.getElementById("searchInput")?.value.trim().toLowerCase() || "";
  const filter = document.getElementById("filterSelect")?.value || "all";

  let filtered = books.filter(b =>
    b.title.toLowerCase().includes(query) ||
    b.author.toLowerCase().includes(query)
  );

  if (filter === "available") filtered = filtered.filter(b => b.available);
  if (filter === "borrowed") filtered = filtered.filter(b => !b.available);

  renderCatalog(filtered);
}

// --- Init on library page ---
document.addEventListener("DOMContentLoaded", () => {
  const catalogEl = document.getElementById("catalog");
  if (!catalogEl) return; // we're not on library.html

  // Initial render
  applyFiltersAndRender();

  // Wire controls
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  const resetBtn = document.getElementById("resetBtn");

  searchInput.add
