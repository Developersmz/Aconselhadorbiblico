document.addEventListener('DOMContentLoaded', () => {
    const historyButton = document.querySelector('#history-btn')

    historyButton.addEventListener('click', () => {
        document.querySelector('.history').classList.toggle('opened')
    })

    document.querySelector('.send-state').addEventListener('click', () => {
        document.querySelector('.counsel').classList.add('active')
    })

})