

// Function to Dynamic Content Forms

function createDynamicComponent(operation, formAction, formFields) {
    var dynamicContainer = document.querySelector('#form')
    var sectionSelect = document.querySelector('.sec-form')

    // Limpar o container
    dynamicContainer.innerHTML = ''

    // Logica para renderizar
    dynamicContainer.innerHTML = `
        <div class="section-title">
            <h1>${operation.toUpperCase()}</h1>
        </div>
        <div class="container">
            <div class="row">
                <form method="post" action="${formAction}">
                    ${formFields}
                    <button type="submit">${operation}</button>
                </form>
            </div>
        </div>
    `
}

function createDynamicEdition(title, formAction, formFields){

    var firstsec = document.querySelector('.sec-form')
    var lastsec = document.querySelector('.content')
    var editsec = document.querySelector('.edit-sec')

    firstsec.innerHTML = ''
    lastsec.innerHTML = ''

    editsec.innerHTML = `
    <div class="section-title">
      <h1>${title.toUpperCase()}</h1>
    </div>
    <div class="container">
      <div class="row">
        <form method="post" action="${formAction}">
            ${formFields}
            <button type="submit">Editar</button>
        </form>
       </div>
    </div>
    
    `
}

// Edit Section
function cleanSection(section){
	document.querySelector(`${section}`).innerHTML = ''
}

function sectionActions(section){
    document.querySelector(`${section}`)
}
