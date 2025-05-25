let collection = [];
const collectionContainer = document.getElementById("collectionCards");

async function getUserId() {
  const res = await fetch('../../app/php/session_user.php');
  const data = await res.json();
  return data.user_id; // null si no está logueado
}

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

getUserId().then(userId => {
  if (userId) {
    // Ya tienes el userId para tus peticiones
    getCollection();
    // Aquí puedes cargar la colección del usuario, etc.
  } else {
    // Redirige a login o muestra mensaje
    window.location.href = "../../app/php/login.php";
  }
});

async function getCollection() {
  // Pide los IDs de cartas del usuario
  const res = await fetch('../../app/php/get_user_collection.php');
  const data = await res.json();
  if (!data.success || !data.cards.length) {
    collectionContainer.innerHTML = "<p>No tienes cartas en tu colección.</p>";
    return;
  }

  // Ahora pide los datos de cada carta a la API de Pokémon TCG
  const cardPromises = data.cards.map(cardId =>
    fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`)
      .then(res => res.json())
      .then(cardData => cardData.data)
      .catch(() => null)
  );
  collection = (await Promise.all(cardPromises)).filter(card => card);

  // Asigna el precio a cada carta
  collection = collection.map(card => ({
    ...card,
    price: getCardPrice(card)
  }));

  renderCollection();
}

// Elementos del popup
const confirmPopup = document.getElementById("confirmPopup");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

// Variable para almacenar el índice temporal
let cardToDeleteIndex = null;

async function renderCollection() {
  collectionContainer.innerHTML = "";

  console.log("Colección:", collection);

  if (!collection || collection.length === 0) {
    collectionContainer.innerHTML = "<p>No tienes cartas en tu colección.</p>";
    return;
  }

  collection.forEach((card, index) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${card.images.small}" alt="${card.name}" />
      <h4>${card.name} (${card.number})</h4>
      <h6>Expansión: ${card.set.name}</h6>
      <p>Precio: ${card.price}€</p>
      <button onclick="confirmRemoveCard(${index})">Eliminar</button>
    `;

    collectionContainer.appendChild(div);
  });

  
}

// Muestra el popup
function confirmRemoveCard(index) {
  cardToDeleteIndex = index;
  confirmPopup.classList.remove("hidden");
}

// Confirma eliminación
confirmYes.addEventListener("click", async () => {
  if (cardToDeleteIndex !== null) {
    const card = collection[cardToDeleteIndex];
    // Llama al backend para eliminar la carta de la colección del usuario
    const res = await fetch('../../app/php/delete_of_collection.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: card.id }) // Usa el id de la carta
    });
    const data = await res.json();
    if (data.success) {
      collection.splice(cardToDeleteIndex, 1);
      renderCollection();
    } else {
      alert("No se pudo eliminar la carta.");
    }
    cardToDeleteIndex = null;
  }
  confirmPopup.classList.add("hidden");
});

// Cancela eliminación
confirmNo.addEventListener("click", () => {
  cardToDeleteIndex = null;
  confirmPopup.classList.add("hidden");
});

// Inicial
renderCollection(collection);
