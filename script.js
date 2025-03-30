const numberButtons = document.querySelectorAll('.number-button');
let selectedNumbers = []; // Cambiar a un array para almacenar múltiples números
let adminMode = false;
let soldNumbers = JSON.parse(localStorage.getItem('soldNumbers')) || [];

// Marcar los números vendidos al cargar la página
function updateNumberStates() {
    numberButtons.forEach(button => {
        if (soldNumbers.includes(button.value)) {
            button.classList.add('sold');
            button.disabled = true; // Deshabilitar el botón
        } else {
            button.classList.remove('sold');
            button.disabled = false; // Habilitar el botón
        }
    });
}
updateNumberStates();

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (adminMode) {
            const index = soldNumbers.indexOf(button.value);
            if (index !== -1) {
                // Habilitar el número vendido en modo administrador
                button.classList.remove('sold');
                button.disabled = false;
                soldNumbers.splice(index, 1); // Eliminar el número de la lista de vendidos
                localStorage.setItem('soldNumbers', JSON.stringify(soldNumbers)); // Actualizar localStorage
                updateNumberStates(); // Actualizar la UI
                alert(`Número ${button.value} habilitado.`);
                displaySoldNumbers(); // Actualizar la lista de números vendidos
            } else {
                alert(`El número ${button.value} no está vendido.`);
            }
        } else {
            // Si no estamos en modo administrador
            if (!soldNumbers.includes(button.value)) {
                // Agregar o quitar el número de la selección
                if (selectedNumbers.includes(button.value)) {
                    button.classList.remove('selected');
                    selectedNumbers = selectedNumbers.filter(num => num !== button.value); // Eliminar el número de la selección
                } else {
                    button.classList.add('selected');
                    selectedNumbers.push(button.value); // Agregar el número a la selección
                }
            }
        }
    });
});

document.getElementById('payButton').addEventListener('click', () => {
    if (selectedNumbers.length > 0) {
        const message = `Hola, me interesa participar en la rifa con los números: ${selectedNumbers.join(', ')}.`;
        if (confirm(`¿Estás seguro de comprar los números: ${selectedNumbers.join(', ')}?`)) {
            selectedNumbers.forEach(number => {
                soldNumbers.push(number); // Agregar cada número a la lista de vendidos
            });
            localStorage.setItem('soldNumbers', JSON.stringify(soldNumbers)); // Guardar en localStorage
            updateNumberStates(); // Actualizar la UI
            sendWhatsAppMessage(message); // Enviar mensaje por WhatsApp
            selectedNumbers = []; // Limpiar la selección
        }
    } else {
        alert('Por favor, selecciona al menos un número disponible antes de pagar.');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'Y') {
        adminMode = !adminMode;
        alert(adminMode ? 'Modo administrador activado' : 'Modo administrador desactivado');
        displaySoldNumbers(); // Mostrar la lista de números vendidos al activar el modo administrador
    }
});

// Función para mostrar la lista de números vendidos
function displaySoldNumbers() {
    const soldNumbersUl = document.getElementById('soldNumbersUl');
    soldNumbersUl.innerHTML = ''; // Limpiar la lista actual

    if (adminMode) {
        document.getElementById('soldNumbersList').style.display = 'block'; // Mostrar la lista
        soldNumbers.forEach(number => {
            const li = document.createElement('li');
            li.textContent = number;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Eliminar';
            removeButton.onclick = () => {
                soldNumbers.splice(soldNumbers.indexOf(number), 1); // Eliminar el número de la lista
                localStorage.setItem('soldNumbers', JSON.stringify(soldNumbers)); // Actualizar localStorage
                updateNumberStates(); // Actualizar la UI
                displaySoldNumbers(); // Actualizar la lista de números vendidos
            };
            li.appendChild(removeButton);
            soldNumbersUl.appendChild(li);
        });
    } else {
        document.getElementById('soldNumbersList').style.display = 'none'; // Ocultar la lista
    }
}

function sendWhatsAppMessage(message) {
    const whatsappUrl = `https://api.whatsapp.com/send?phone=573024990764&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}