//Variables
const selectCategorias = document.querySelector('#categorias');
const resultado = document.querySelector('#resultado');
const modal = new bootstrap.Modal('#modal', {});
//Eventos
if(selectCategorias){
    selectCategorias.addEventListener('change', consultarRecetas);
    document.addEventListener('DOMContentLoaded', consultarCategorias);
}
// ----- Favoritos -----
const favoritosDiv = document.querySelector('.favoritos');
if(favoritosDiv){
    obtnerFavoritos();
}
function obtnerFavoritos(){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    console.log(favoritos);
    mostrarRecetas(favoritos);
}

//Funciones
//----- Categorias -----
function consultarCategorias(){
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => llenarSelect(datos.categories))
}

function llenarSelect(categorias){
    categorias.forEach(categoria => {
        const {strCategory} = categoria;
        const option = document.createElement('OPTION');
        option.value = strCategory;
        option.textContent = strCategory;

        selectCategorias.appendChild(option);
    })
}
//----- Recetas -----
function consultarRecetas(e){
    const categoria = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

    fetch(url)
        .then(respueta => respueta.json())
        .then(datos => mostrarRecetas(datos.meals))
}

function mostrarRecetas(recetas){
    limpiarHTML(resultado);

    recetas.forEach(receta => {
        const {idMeal, strMeal, strMealThumb} = receta;
        const {id, title, img} = receta;

        const recetaContenedor = document.createElement('DIV');
        recetaContenedor.classList.add('col-md-4');

        const recetaCard = document.createElement('DIV');
        recetaCard.classList.add('card', 'mb-4');

        const recetaImg = document.createElement('IMG');
        recetaImg.classList.add('card-img-top');
        recetaImg.alt = `Imagen de ${strMeal ?? title}`;
        recetaImg.src = strMealThumb ?? img;

        const recetaCardBody = document.createElement('DIV');
        recetaCardBody.classList.add('card-body');  

        const recetaHeading = document.createElement('H3');
        recetaHeading.classList.add('card-title', 'mb-3');
        recetaHeading.textContent = strMeal ?? title;

        const recetaBtn = document.createElement('BUTTON');
        recetaBtn.classList.add('btn', 'btn-danger', 'w-100');
        recetaBtn.textContent = 'Ver Receta';
        
        recetaBtn.onclick = () => {
            consultarReceta(idMeal ?? id);
        }

        recetaCardBody.appendChild(recetaHeading);
        recetaCardBody.appendChild(recetaBtn);

        recetaCard.appendChild(recetaImg);
        recetaCard.appendChild(recetaCardBody);

        recetaContenedor.appendChild(recetaCard);
        resultado.appendChild(recetaContenedor);
    })
}

function consultarReceta(idMeal){
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`;

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => mostrarReceta(datos.meals[0]))
}

function mostrarReceta(receta){
    const { idMeal, strMeal, strInstructions, strMealThumb } = receta;

    //Modal
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    //Inyectar al modal
    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="${strMeal}" />
        <h3 class"my-3">Instrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class"my-3">Ingrendientes y Cantidades</h3>
    `;
    //Ingredientes
    const listGroup = document.createElement('UL');
    listGroup.classList.add('list-group');

    for(let i = 1; i <= 20; i++){
        if(receta[`strIngredient${i}`]){
            const ingrediente = receta[`strIngredient${i}`];
            const cantidad = receta[`strMeasure${i}`];

            const ingredienteLi = document.createElement('LI');
            ingredienteLi.classList.add('list-group-item');
            ingredienteLi.textContent = `${ingrediente} ─­─­─ ${cantidad}`;

            listGroup.appendChild(ingredienteLi);
        }
    }

    modalBody.appendChild(listGroup);

    //Botones
    const modalFooter = document.querySelector('.modal-footer');
    limpiarHTML(modalFooter);

    const btnGuardar = document.createElement('BUTTON');
    btnGuardar.classList.add('btn', 'btn-danger', 'col');
    btnGuardar.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';
    btnGuardar.onclick = () => {
        if(existeStorage(idMeal)){
            eliminarStorage(idMeal);
            mostrarToast('Eliminado Correctamente')
            btnGuardar.textContent = 'Guardar Favorito';
            return;
        }
        guardarFavorito({
            id: idMeal,
            title: strMeal,
            img: strMealThumb
        })
        mostrarToast('Guardado Correctamente')
        btnGuardar.textContent = 'Eliminar Favorito';
    }

    const btnCerrar = document.createElement('BUTTON');
    btnCerrar.classList.add('btn', 'btn-secondary', 'col');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.onclick = () => {
        modal.hide();
    }

    modalFooter.appendChild(btnGuardar);
    modalFooter.appendChild(btnCerrar);

    //Modal Show
    modal.show();
}

function guardarFavorito(receta){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
}
function existeStorage(id){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    const resultado = favoritos.some(favorito => favorito.id === id);
    return resultado;
}
function eliminarStorage(id){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
    localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
}

//Funciones Complementarias
function limpiarHTML(div){
    while(div.firstChild){
        div.removeChild(div.firstChild);
    }
}

function mostrarToast(mensaje){
    const toastDiv = document.querySelector('#toast');
    const toastBody = document.querySelector('.toast-body');

    const toast = new bootstrap.Toast(toastDiv);

    toastBody.textContent = mensaje;
    toast.show();

    setTimeout(() => {
        toast.hide();
    }, 3000);

}