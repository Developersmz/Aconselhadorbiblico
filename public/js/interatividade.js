document.addEventListener("DOMContentLoaded", () => {
	settBtn = document.querySelector('.settings')
	moreBtn = document.querySelectorAll('.btn-see')
	moreContent = document.querySelector('#more-content')
	settBtn.onclick = () => {
		document.querySelector('.settings-sec').classList.toggle('active')
	}

	// Mostrar mais conteudo (Estudo Section)
	moreBtn.forEach((button) => {
		button.addEventListener('click', (event) => {
			const parentDiv = event.target.closest(".estudo-item")
			parentDiv.classList.toggle('active')

			// Verifica se o item está ativo e altera o texto do botão
			if (parentDiv.classList.contains('active')) {
				button.textContent = 'Ocultar';
			} else {
				button.textContent = 'Ver mais';
			}
		})
	})

})

let navbar = document.querySelector('.nav');

window.onscroll = () =>{
	navbar.classList.remove('active');
	document.querySelector('.settings-sec').classList.remove('active')
}

document.querySelector('#menu-btn').addEventListener("click", () => {
	navbar.classList.toggle('active')
})


// Settings
//	* Theme *
themeButton = document.querySelector('.theme-btn')

themeButton.onclick = () => {
	themeButton.classList.toggle('dark-mode-on')
	document.body.classList.toggle('dark-theme')

	if (localStorage.getItem("theme") == "light"){
		localStorage.setItem("theme", "dark")
	} else {
		localStorage.setItem("theme", "light")
	}
}

if (localStorage.getItem("theme") == "light"){
	themeButton.classList.remove('dark-mode-on')
	document.body.classList.remove('dark-theme')
} else if (localStorage.getItem("theme") == "dark"){
	themeButton.classList.add("dark-mode-on")
	document.body.classList.add("dark-theme")
} else {
	localStorage.setItem("theme", "light")
}
