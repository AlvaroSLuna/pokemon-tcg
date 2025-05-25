const generationSelect = document.getElementById("generationSelect");
const pokedexContainer = document.getElementById("pokedexContainer");

// Colores por tipo de Pokémon
const typeColors = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD"
};

// Mapa de generación a la URL de PokéAPI
const generationUrls = {
    1: "https://pokeapi.co/api/v2/generation/1/",
    2: "https://pokeapi.co/api/v2/generation/2/",
    3: "https://pokeapi.co/api/v2/generation/3/",
    4: "https://pokeapi.co/api/v2/generation/4/",
    5: "https://pokeapi.co/api/v2/generation/5/",
    6: "https://pokeapi.co/api/v2/generation/6/",
    7: "https://pokeapi.co/api/v2/generation/7/",
    8: "https://pokeapi.co/api/v2/generation/8/",
    9: "https://pokeapi.co/api/v2/generation/9/",
};

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
        loadAllPokemon(); // Si está vacío, volver a mostrar todos
        return;
    }

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!res.ok) {
            pokedexContainer.innerHTML = `<p style="color:white">No se encontró el Pokémon "${query}"</p>`;
            return;
        }

        const pokemon = await res.json();
        renderOptimizedPokemonList([pokemon]);
    } catch (error) {
        pokedexContainer.innerHTML = `<p style="color:white">Error al buscar el Pokémon.</p>`;
    }
});

// Al cambiar la selección
generationSelect.addEventListener("change", async () => {
    const gen = generationSelect.value;
    pokedexContainer.innerHTML = "Cargando Pokémon...";
    if (gen === "all") {
        loadAllPokemon();
    } else {
        loadGeneration(gen);
    }
});

// Carga todos los Pokémon existentes
async function loadAllPokemon() {
    try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
        const data = await res.json();
        const pokemonList = data.results;

        const detailedList = await Promise.all(pokemonList.map(pokemon =>
            fetch(pokemon.url).then(res => res.json())
        ));

        detailedList.sort((a, b) => a.id - b.id);

        renderOptimizedPokemonList(detailedList);
    } catch (error) {
        console.error("Error al cargar Pokémon:", error);
        pokedexContainer.innerHTML = "Error al cargar datos.";
    }
}

// Carga solo los Pokémon de una generación
async function loadGeneration(gen) {
    try {
        const res = await fetch(generationUrls[gen]);
        const data = await res.json();
        const speciesList = data.pokemon_species;

        const detailedList = await Promise.all(speciesList.map(async (species) => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.name}`);
                if (!response.ok) {
                    console.warn(`No se pudo cargar ${species.name}`);
                    return null;
                }
                return await response.json();
            } catch (error) {
                console.warn(`Error al obtener detalles de ${species.name}`, error);
                return null;
            }
        }));

        const validList = detailedList.filter(pokemon => pokemon !== null);
        validList.sort((a, b) => a.id - b.id);
        renderOptimizedPokemonList(validList);
    } catch (error) {
        console.error("Error al cargar la generación:", error);
        pokedexContainer.innerHTML = "Error al cargar datos.";
    }
}

// Renderiza la lista con tipos coloreados
async function renderOptimizedPokemonList(pokemonList) {
    pokedexContainer.innerHTML = "";

    const table = document.createElement("table");
    table.className = "pokedex-table";
    table.innerHTML = `
        <thead>
            <tr>
                <th>Número Pokédex</th>
                <th>Pokémon</th>
                <th>Tipos</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    for (const pokemon of pokemonList) {
        const name = capitalize(pokemon.name);
        const imageUrl = pokemon.sprites.front_default;

        // Extraer tipos
        const typesHtml = pokemon.types.map(typeInfo => {
            const typeName = typeInfo.type.name;
            const color = typeColors[typeName] || "#AAA";
            return `<span style="background-color:${color}; color:white; padding:4px 8px; border-radius:8px; margin-right:4px; font-weight:bold; display:inline-block;">
                        ${capitalize(typeName)}
                    </span>`;
        }).join("");

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${pokemon.id}</td>
            <td><img src="${imageUrl}" alt="${name}" class="pokemon-image"/> ${name}</td>
            <td>${typesHtml}</td>
        `;
        tbody.appendChild(row);
    }

    pokedexContainer.appendChild(table);
}

// Capitaliza el primer carácter del nombre
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Carga por defecto "Todas las generaciones"
loadAllPokemon();
