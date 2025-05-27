const searchInput = document.getElementById("searchInput");
const cardsContainer = document.getElementById("cardsContainer");

// URL base de la API
const apiUrl = "https://api.pokemontcg.io/v2/cards?q=name:";

// Obtener la colección del localStorage o iniciar vacía
let collection = JSON.parse(localStorage.getItem("collection")) || [];
let allResults = [];
let currentPage = 2;
const cardsPerPage = 28;

// Devuelve el precio de una carta, basado en los datos de TCGPlayer o genera uno aleatorio si no hay datos
function getCardPrice(card) {
  if (card.tcgplayer && card.tcgplayer.prices) {
    const priceTypes = Object.values(card.tcgplayer.prices);
    const firstPrice = priceTypes.find(p => p.market || p.mid || p.low);
    if (firstPrice) {
      return firstPrice.market || firstPrice.mid || firstPrice.low;
    }
  }
  return parseFloat((Math.random() * 5 + 1).toFixed(2));
}

// Busca cartas por nombre y filtros adicionales (set, tipo, orden)
async function searchCards(query, filters = {}) {
  cardsContainer.innerHTML = "Cargando...";
  let q = "";

  if (query) q += `name:${query}`;
  if (filters.set) q += `${q ? " " : ""}set.id:${filters.set}`;
  if (filters.type) q += `${q ? " " : ""}types:${filters.type}`;

  try {
    const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=${q}`);
    const data = await response.json();
    cardsContainer.innerHTML = "";

    if (!data.data) {
      cardsContainer.innerHTML = "No se encontraron cartas.";
      allResults = []; // <-- Limpia los resultados anteriores
      renderCurrentPage();
      return;
    }

    let cards = data.data.map(card => ({
      ...card,
      price: getCardPrice(card)
    }));

    // Ordenar resultados por precio o nombre si se indicó
    if (filters.sort === "high") {
      cards.sort((a, b) => b.price - a.price);
    } else if (filters.sort === "low") {
      cards.sort((a, b) => a.price - b.price);
    } else if (filters.sort === "AZ") {
      cards.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "ZA") {
      cards.sort((a, b) => b.name.localeCompare(a.name));
    }

    allResults = cards; //Solo los nuevos resultados
    currentPage = 1;
    renderCurrentPage();

  } catch (error) {
    cardsContainer.innerHTML = "Ocurrió un error al buscar cartas.";
    allResults = []; //Limpia los resultados en caso de error
    renderCurrentPage();
    console.error(error);
  }
}

// Carga cartas más recientes, ordenadas por fecha de lanzamiento
async function loadAllCardsSortedByDate() {
  cardsContainer.innerHTML = "Cargando cartas más recientes...";
  allResults = [];
  currentPage = 1;

  let hasMore = true;
  let page = 1;
  const maxPages = 2;

  try {
    while (hasMore && page <= maxPages) {
      const response = await fetch(`https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=100&orderBy=-set.releaseDate`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const cards = data.data.map(card => ({
          ...card,
          price: getCardPrice(card)
        }));
        allResults.push(...cards);
        page++;
      } else {
        hasMore = false;
      }
    }

    renderCurrentPage();

  } catch (error) {
    cardsContainer.innerHTML = "Error al cargar cartas.";
    console.error(error);
  }
}

// Muestra las cartas correspondientes a la página actual
function renderCurrentPage() {
  cardsContainer.innerHTML = "";

  const start = (currentPage - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const pageCards = allResults.slice(start, end);

  pageCards.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${card.images.small}" alt="${card.name}" />
      <h4>${card.name} (${card.number})</h4>
      <h6>Expansión: ${card.set.name}</h6>
      <p>Precio: ${card.price}€</p>
      <button>Agregar a colección</button>
    `;

    console.log(card);

    div.querySelector("button").addEventListener("click", () => addToCollection(card));
    cardsContainer.appendChild(div);
  });

  renderPagination();
}

// Renderiza la paginación y sus controles
function renderPagination() {
  let paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination";
    paginationContainer.className = "pagination";
    cardsContainer.after(paginationContainer);
  }

  const totalPages = Math.ceil(allResults.length / cardsPerPage);
  paginationContainer.innerHTML = "";

  // Botón anterior
  const prevButton = document.createElement("button");
  prevButton.textContent = "◀";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderCurrentPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // Selector de página
  const pageSelector = document.createElement("select");
  pageSelector.className = "page-selector";

  for (let i = 1; i <= totalPages; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Página ${i}`;
    if (i === currentPage) option.selected = true;
    pageSelector.appendChild(option);
  }

  pageSelector.addEventListener("change", (e) => {
    currentPage = parseInt(e.target.value);
    renderCurrentPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Botón siguiente
  const nextButton = document.createElement("button");
  nextButton.textContent = "▶";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderCurrentPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  const info = document.createElement("span");

  paginationContainer.appendChild(prevButton);
  paginationContainer.appendChild(pageSelector);
  paginationContainer.appendChild(nextButton);
  paginationContainer.appendChild(info);
}

// Elementos del popup
const confirmPopup = document.getElementById("confirmPopup");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

let cardToAdd = null;

function addToCollection(card) {
  cardToAdd = card;
  confirmPopup.classList.remove("hidden");
}

// Confirmar adición
confirmYes.addEventListener("click", async () => {
  if (cardToAdd) {
    const res = await fetch('../../app/php/add_to_collection.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card_id: cardToAdd.id,
        card_name: cardToAdd.name
      })
    });
    const data = await res.json();
    if (data.success) {
      alert("Carta añadida a tu colección.");
    } else if (data.error === "La carta ya estaba agregada a la colección") {
      alert("La carta ya estaba agregada a la colección.");
    } else {
      alert("No se pudo añadir la carta.");
    }
    cardToAdd = null;
  }
  confirmPopup.classList.add("hidden");
});

// Cancelar adición
confirmNo.addEventListener("click", () => {
  cardToAdd = null;
  confirmPopup.classList.add("hidden");
});


// Evento para buscar cartas cuando se escribe en el input
searchInput.addEventListener("input", (e) => {
  const value = e.target.value.trim();
  const filters = getFilters();

  // Elimina esta línea:
  // localStorage.setItem("lastSearch", value);

  if (value.length >= 3 || Object.values(filters).some(f => f)) {
    searchCards(value, filters);
  } else {
    loadAllCardsSortedByDate();
  }
});

// Obtiene los filtros aplicados en el UI
function getFilters() {
  return {
    set: document.getElementById("setFilter").value,
    type: document.getElementById("typeFilter").value,
    sort: document.getElementById("priceSort").value
  };
}

// Aplicar los filtros al cambiar cualquier select
["setFilter", "typeFilter", "priceSort"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {
    const query = searchInput.value.trim();
    const filters = getFilters();

    if (query.length >= 3 || Object.values(filters).some(f => f)) {
      searchCards(query, filters);
    } else {
      loadAllCardsSortedByDate();
    }
  });
});

// Cargar lista de expansiones para mostrar logos y opciones de filtro
async function loadSets() {
  const response = await fetch("https://api.pokemontcg.io/v2/sets");
  const data = await response.json();
  const sets = data.data;

  const setsList = document.getElementById("setsList");
  const setSearchInput = document.getElementById("setSearchInput");

  function renderSets(filteredSets) {
    setsList.innerHTML = "";
    filteredSets.forEach(set => {
      if (set.images.logo) {
        const wrapper = document.createElement("div");
        wrapper.className = "set-item";

        const img = document.createElement("img");
        img.src = set.images.logo;
        img.alt = set.name;
        img.title = set.name;
        img.addEventListener("click", () => {
          window.location.href = `set.html?id=${set.id}`;
        });

        const label = document.createElement("p");
        label.textContent = set.name;

        wrapper.appendChild(img);
        wrapper.appendChild(label);
        setsList.appendChild(wrapper);
      }
    });
  }

  // Agregar opciones al filtro de expansión
  const setFilter = document.getElementById("setFilter");
  sets.forEach(set => {
    const option = document.createElement("option");
    option.value = set.id;
    option.textContent = set.name;
    setFilter.appendChild(option);
  });

  renderSets(sets);

  // Buscar entre expansiones por nombre
  setSearchInput.addEventListener("input", () => {
    const query = setSearchInput.value.toLowerCase();
    const filtered = sets.filter(set => set.name.toLowerCase().includes(query));
    renderSets(filtered);
  });
}

loadSets();

// Al cargar la página, decide si mostrar últimos resultados o búsqueda anterior
window.addEventListener("DOMContentLoaded", () => {
  searchInput.value = "";
  loadAllCardsSortedByDate();
});
