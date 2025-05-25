// Obtiene el parámetro "id" de la URL para saber qué expansión mostrar
const urlParams = new URLSearchParams(window.location.search);
const setId = urlParams.get("id");

// Obtiene el contenedor donde se mostrarán las cartas y el título del set
const cardsContainer = document.getElementById("cardsContainer");
const setTitle = document.getElementById("setTitle");

// Carga todas las cartas de un set específico desde la API
async function loadSetCards() {
  cardsContainer.innerHTML = "Cargando cartas del set...";

  try {
    // Consulta a la API usando el ID de la expansión
    const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`);
    const data = await response.json();

    // Si no hay datos o error
    if (!data.data || data.data.length === 0) {
      cardsContainer.innerHTML = "No se encontraron cartas para este set.";
      return;
    }

    // Obtiene las cartas de la expansión
    // Obtiene las cartas de la expansión y las ordena por número
    const cards = data.data
      .map(card => ({
        ...card,
        price: getCardPrice(card)
      }))
      .sort((a, b) => {
        // Intenta convertir el número a entero para orden numérico
        const numA = parseInt(a.number);
        const numB = parseInt(b.number);
        return numA - numB;
      });

    // Muestra el título de la expansión
    setTitle.textContent = cards[0]?.set?.name || "Set sin nombre";

    // Renderiza cada carta
    cardsContainer.innerHTML = "";
    cards.forEach(card => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <img src="${card.images.small}" alt="${card.name}" />
        <h4>${card.name} (${card.number})</h4>
        <h6>Expansión: ${card.set.name}</h6>
        <p>Precio: ${card.price}€</p>
        <button>Agregar a colección</button>
      `;

      div.querySelector("button").addEventListener("click", () => addToCollection(card));
      cardsContainer.appendChild(div);
    });

  } catch (error) {
    cardsContainer.innerHTML = "Error al cargar las cartas del set.";
    console.error(error);
  }
}

// Genera un precio para una carta basado en su info de TCGPlayer o aleatorio
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
  console.log("Añadiendo carta a la colección:", cardToAdd);
  if (cardToAdd) {
    // Llama al backend para guardar la carta en la colección del usuario
    const res = await fetch('../../app/php/add_to_collection.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card_id: cardToAdd.id,
        card_name: cardToAdd.name
      })
    });
    console.log("Respuesta del servidor:", res);
    const data = await res.json();
    if (data.success) {
      alert("Carta añadida a tu colección.");
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


// Llama la función principal al cargar el documento
loadSetCards();