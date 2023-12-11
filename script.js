const ApiCategorias = `https://www.themealdb.com/api/json/v1/1/categories.php`;
const ApiPlatosCategorias = `https://www.themealdb.com/api/json/v1/1/filter.php?c=`;
const ApiBuscarPorNombres = `https://www.themealdb.com/api/json/v1/1/search.php?s=`;
const ApiPlatoId = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=`;

const INDEXDB_NAME = "Comidas Favoritas";
const INDEXDB_VERSION = 1;
const STORE_NAME = "Favoritos";

let db = null;

openDB()
  .then(() => {
    botonEstrellaGeneral.addEventListener("click", loadFavoritos);
  })
  .catch((error) => {
    console.error("Error al abrir la base de datos: " + error);
  });

function openDB() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(INDEXDB_NAME, INDEXDB_VERSION);

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        let objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

let mainElement = document.getElementsByTagName("main")[0];

let categorias = document.getElementById("categorias");
let rowDiv = document.getElementById("row");
let search = document.querySelector(".search");
let botonEstrellaGeneral = document.getElementById("botonEstrella");
let formulario = document.getElementById("formulario");
let estrellaColoreada = document.querySelector(".botonEstrella img");

formulario.addEventListener("submit", (event) => {
  event.preventDefault();
});

search.addEventListener("input", (event) => {
  event.preventDefault();

  let urlBusquedaPorNombres = `${ApiBuscarPorNombres}${search.value}`;

  fetch(urlBusquedaPorNombres)
    .then((response) => response.json())
    .then((data) => {
      rowDiv.innerHTML = "";

      data.meals.forEach((plato) => {
        let imagenPlato = plato.strMealThumb;
        let nombrePlato = plato.strMeal;
        let idPlato = plato.idMeal;

        let cardDiv = document.createElement("div");
        cardDiv.className =
          "card col-lg-4 col-md-6 col-sm-6 col-12 rounded mb-4 g-2";

        cardDiv.innerHTML = `
                    <div class="card-body" value="${idPlato}">
                        <div class="row">
                            <h4 class="card-title col-9 nombrePlato">${nombrePlato}</h4>
                            <button type="submit" class="col-2 botonEstrellaCard">
                                <img src="imagenes/estrellaPng.png" alt="" class="estrellaColoreadaCard brilloBajo">
                            </button>
                        </div>
                    </div>
                    <img class="card-img-top align-items-center h-100 p-4 imagenCard" src="${imagenPlato}">
                `;

        let estrellaColoreadaCard = cardDiv.querySelector(
          ".estrellaColoreadaCard"
        );
        estrellaColoreadaCard.addEventListener("click", () => {
          if (estrellaColoreadaCard.classList.contains("brilloBajo")) {
            estrellaColoreadaCard.classList.remove("brilloBajo");
            estrellaColoreadaCard.classList.add("brilloNormal");
            guardarEnFavoritos(idPlato);
          } else {
            estrellaColoreadaCard.classList.remove("brilloNormal");
            estrellaColoreadaCard.classList.add("brilloBajo");
            borrarEnFavoritos(idPlato);
          }
        });

        let imagen = cardDiv.querySelector(".imagenCard");
        imagen.addEventListener("click", () => {
          todoSobrePlato(idPlato);
        });

        rowDiv.appendChild(cardDiv);
      });
    });
});

cargarCategorias();

function cargarCategorias() {
  fetch(ApiCategorias)
    .then((response) => response.json())
    .then((data) => {
      let opcionesArray = [];

      data.categories.forEach((categoria) => {
        let strCategory = categoria.strCategory;
        opcionesArray.push(
          `<option value="${strCategory}">${strCategory}</option>`
        );
      });

      categorias.innerHTML = opcionesArray.join("");
      generarCard();
    })
    .catch((error) => console.error("Error al cargar categorías:", error));
}

function generarCard() {
  categorias.addEventListener("change", (event) => {
    let urlPlatosCategoria = `${ApiPlatosCategorias}${event.target.value}`;

    fetch(urlPlatosCategoria)
      .then((response) => response.json())
      .then((data) => {
        rowDiv.innerHTML = "";

        data.meals.forEach((plato) => {
          let imagenPlato = plato.strMealThumb;
          let nombrePlato = plato.strMeal;
          let idPlato = plato.idMeal;

          let cardDiv = document.createElement("div");
          cardDiv.className =
            "card col-lg-4 col-md-6 col-sm-6 col-12 rounded mb-4 g-3";

          cardDiv.innerHTML = `
                        <div class="card-body" value="${idPlato}">
                            <div class="row">
                                <h4 class="card-title col-9">${nombrePlato}</h4>
                                <button type="submit" class="col-2 botonEstrellaCard">
                                    <img src="imagenes/estrellaPng.png" alt="" class="estrellaColoreadaCard brilloBajo">
                                </button>
                            </div>
                        </div>
                        <img class="card-img-top align-items-center h-100 p-4" src="${imagenPlato}">
                    `;

          let estrellaColoreadaCard = cardDiv.querySelector(
            ".estrellaColoreadaCard"
          );
          estrellaColoreadaCard.addEventListener("click", () => {
            if (estrellaColoreadaCard.classList.contains("brilloBajo")) {
              estrellaColoreadaCard.classList.remove("brilloBajo");
              estrellaColoreadaCard.classList.add("brilloNormal");
              guardarEnFavoritos(idPlato);
            } else {
              estrellaColoreadaCard.classList.remove("brilloNormal");
              estrellaColoreadaCard.classList.add("brilloBajo");
              borrarEnFavoritos(idPlato);
            }
          });

          let imagen = cardDiv.querySelector(".card-img-top");
          imagen.addEventListener("click", () => {
            todoSobrePlato(idPlato);
          });

          rowDiv.appendChild(cardDiv);
        });
      })
      .catch((error) =>
        console.error("Error al cargar platos por categoría:", error)
      );
  });
}

function todoSobrePlato(idPlato) {
  rowDiv.innerHTML = "";

  let urlPlatosId = `${ApiPlatoId}${idPlato}`;

  fetch(urlPlatosId)
    .then((response) => response.json())
    .then((data) => {
      rowDiv.innerHTML = "";

      data.meals.forEach((plato) => {
        let imagenPlato = plato.strMealThumb;
        let nombrePlato = plato.strMeal;
        let idPlato = plato.idMeal;
        let ingredientes = [];
        let instrucciones = plato.strInstructions;

        for (let i = 1; i <= 20; i++) {
          let ingrediente = plato[`strIngredient${i}`];
          if (ingrediente && ingrediente.trim() !== "") {
            ingredientes.push(ingrediente);
          }
        }

        let cardDiv = document.createElement("div");
        cardDiv.className =
          "card-todo col-lg-4 col-md-6 col-sm-12 rounded mb-4 w-100 h-100 d-flex align-items-center";

        cardDiv.innerHTML = `
    <div class="card-body" style="margin-top: 50px;" value="${idPlato}">
        <div class="row">
            <div class="col-4">
                <img class="card-img rounded-circle" src="${imagenPlato}" alt="${nombrePlato}">
            </div>
            <div class="col-8">
                <div class="d-flex flex-column align-items-start h-100">
                    <h1 class="card-title mb-3">${nombrePlato}</h1>
                    <h2 class="mb-2">Ingredientes</h2>
                    <p class="card-text">${ingredientes}</p>
                    <h2 class="mb-2">Instrucciones:</h2>
                    <p class="card-text overflow-auto" style="height: 33%;">${instrucciones}</p>
                </div>
            </div>
        </div>
    </div>
`;

        rowDiv.appendChild(cardDiv);
      });
    });
}

botonEstrellaGeneral.addEventListener("click", loadFavoritos);

const idTextarea = 5;

function addBlur(idTextarea, tituloFavorito){

  let textarea = tituloFavorito.value.trim();
  
  if (textarea !== "") {
    addData(idTextarea, textarea)
      .then(() => {
        console.log("Nota añadida a la base de datos:", textarea);
      })
      .catch((error) => {
        console.error("Error al añadir nota a la base de datos: " + error);
      });
  } else {
    alert("Por favor, escribe algo en la nota antes de guardar.");
  }
}

function loadNotaFromDB(idTextarea) {
  if (!db) {
    return Promise.reject(new Error("La base de datos no está abierta."));
  }

  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORE_NAME], "readonly");
    let objectStore = transaction.objectStore(STORE_NAME);
    let request = objectStore.get(idTextarea);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function addData(notaId, data) {
  if (!db) {
    return Promise.reject(new Error("La base de datos no está abierta."));
  }

  return new Promise((resolve, reject) => {
    let transaction = db.transaction([STORE_NAME], "readwrite");
    let objectStore = transaction.objectStore(STORE_NAME);
    let request = objectStore.put({ id: notaId, content: data });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function loadFavoritos() {
  loadNotaFromDB(idTextarea)
  .then((nota) => {

    if (nota) {
      tituloFavorito.value = nota.content;
    }
  })
  .catch((error) => {
    console.error("Error al cargar la nota desde la base de datos: " + error);
  });

  rowDiv.innerHTML = `
  <div class="tituloFavoritos d-flex align-items-center justify-content-center g-2">
    <textarea class="textarea w-50 text-center">MIS PLATOS FAVORITOS</textarea>
  </div>`;


let tituloFavorito = rowDiv.querySelector(".textarea");
tituloFavorito.addEventListener("blur", () => addBlur(idTextarea, tituloFavorito));

  favoritosActivate();

  let transaction = db.transaction(STORE_NAME, "readonly");
  let store = transaction.objectStore(STORE_NAME);

  store.openCursor().onsuccess = (event) => {
    let cursor = event.target.result;
    if (cursor) {
      cargarCartaDesdeBD(cursor.value.id);
      cursor.continue();
    }
  };
}

function cargarCartaDesdeBD(idPlato) {
  let urlPlatosId = `${ApiPlatoId}${idPlato}`;

  fetch(urlPlatosId)
    .then((response) => response.json())
    .then((data) => {
      data.meals.forEach((plato) => {
        let imagenPlato = plato.strMealThumb;
        let nombrePlato = plato.strMeal;
        let idPlato = plato.idMeal;
        let ingredientes = [];
        let instrucciones = plato.strInstructions;

        for (let i = 1; i <= 20; i++) {
          let ingrediente = plato[`strIngredient${i}`];
          if (ingrediente && ingrediente.trim() !== "") {
            ingredientes.push(ingrediente);
          }
        }

        let cardDiv = document.createElement("div");
        cardDiv.className =
          "card col-lg-4 col-md-6 col-sm-6 col-12 rounded mb-4 g-3";

        cardDiv.innerHTML = `
                <div class="card-body" value="${idPlato}">
                    <div class="row">
                        <h4 class="card-title col-9">${nombrePlato}</h4>
                        <button type="submit" class="col-2 botonEstrellaCard">
                            <img src="imagenes/estrellaPng.png" alt="" class="estrellaColoreadaCard brilloNormal">
                        </button>
                    </div>
                </div>
                <img class="card-img-top align-items-center h-100 p-4" src="${imagenPlato}">
            `;

        let estrellaColoreadaCard = cardDiv.querySelector(
          ".estrellaColoreadaCard"
        );
        estrellaColoreadaCard.addEventListener("click", () => {
          if (estrellaColoreadaCard.classList.contains("brilloBajo")) {
            estrellaColoreadaCard.classList.remove("brilloBajo");
            estrellaColoreadaCard.classList.add("brilloNormal");
            guardarEnFavoritos(idPlato);
          } else {
            estrellaColoreadaCard.classList.remove("brilloNormal");
            estrellaColoreadaCard.classList.add("brilloBajo");
            borrarEnFavoritos(idPlato);
          }
        });

        let imagen = cardDiv.querySelector(".card-img-top");
        imagen.addEventListener("click", () => {
          todoSobrePlato(idPlato);
        });

        rowDiv.appendChild(cardDiv);
      });
    });
}

function guardarEnFavoritos(idPlato) {
  let transaction = db.transaction(STORE_NAME, "readwrite");
  let store = transaction.objectStore(STORE_NAME);

  let request = store.get(idPlato);
  request.onsuccess = (event) => {
    if (!request.result) {
      store.add({ id: idPlato });
    }
  };
}

function borrarEnFavoritos(idPlato) {
  let transaction = db.transaction(STORE_NAME, "readwrite");
  let store = transaction.objectStore(STORE_NAME);

  let request = store.get(idPlato);
  request.onsuccess = (event) => {
    if (request.result) {
      store.delete(idPlato);
      favoritosActivate(false);
    }
    loadFavoritos();
  };
}

function favoritosActivate(activar) {
  if (activar === undefined) {
    if (estrellaColoreada.classList.contains("brilloBajo")) {
      estrellaColoreada.classList.remove("brilloBajo");
      estrellaColoreada.classList.add("brilloNormal");
    } else {
      estrellaColoreada.classList.remove("brilloNormal");
      estrellaColoreada.classList.add("brilloBajo");
    }
  } else if (activar) {
    estrellaColoreada.classList.remove("brilloBajo");
    estrellaColoreada.classList.add("brilloNormal");
  } else {
    estrellaColoreada.classList.remove("brilloNormal");
    estrellaColoreada.classList.add("brilloBajo");
  }
}
