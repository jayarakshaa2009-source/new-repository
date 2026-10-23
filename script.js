// 1. Select DOM Elements (using IDs from Part 1)
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");

// Optional Enhancement: Create or target a result count container
let resultCountEl = document.getElementById("result-count");
if (!resultCountEl) {
  resultCountEl = document.createElement("p");
  resultCountEl.id = "result-count";
  resultCountEl.className = "result-count";
  searchForm.after(resultCountEl);
}

// 2. Catch the Search & Event Listener
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent full page reload

  const query = searchInput.value.trim();

  // Task 4: Ignore empty searches
  if (!query) {
    return;
  }

  try {
    // Task 2: Fetch the Data
    const items = await fetchImages(query);

    // Task 3 & 5: Render Results & Enhancement
    renderResults(items, query);
  } catch (error) {
    console.error("Error fetching images:", error);
  }
});

// Helper function to handle API Request
async function fetchImages(query) {
  // Use encodeURIComponent to safely support multi-word queries (e.g., "new york")
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query" +
    "&generator=search&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

  const response = await fetch(url);

  // Check if request was successful before proceeding
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Wikimedia API returns results as an object map under query.pages
  if (data.query && data.query.pages) {
    return Object.values(data.query.pages);
  }

  return [];
}

// 3. Render Results to DOM
function renderResults(items, query) {
  // Task 3: Clear previous results so they don't pile up
  resultsContainer.innerHTML = "";

  // Task 5 (Enhancement): Display result count / summary
  if (items.length === 0) {
    resultCountEl.textContent = `No results found for "${query}".`;
    return;
  }

  resultCountEl.textContent = `Showing ${items.length} results for "${query}"`;

  // Task 3: Loop through items and create card DOM elements
  items.forEach((item) => {
    // Verify image info exists
    if (!item.imageinfo || item.imageinfo.length === 0) return;

    const imgData = item.imageinfo[0];

    // Create Card Container
    const card = document.createElement("article");
    card.className = "card";

    // Create Link Wrapper (Enhancement: clickable image opening full image in new tab)
    const link = document.createElement("a");
    link.href = imgData.descriptionurl || imgData.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // Create Image Element
    const img = document.createElement("img");
    img.src = imgData.thumburl || imgData.url;
    img.alt = item.title.replace(/^File:/, ""); // Clean title prefix

    // Create Caption Element
    const caption = document.createElement("p");
    caption.textContent = item.title.replace(/^File:/, "");

    // Build DOM structure
    link.appendChild(img);
    card.appendChild(link);
    card.appendChild(caption);

    // Append Card to Grid Container
    resultsContainer.appendChild(card);
  });
}
