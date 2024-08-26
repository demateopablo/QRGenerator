// Variable para verificar si se generó un QR
let qrGenerated = false;

// Actualizar el tamaño del QR en el DOM
document.getElementById('sizeInput').addEventListener('input', function () {
    document.getElementById('sizeLabel').textContent = `Tamaño: ${this.value}px`;
});

// Obtener el diálogo y los botones de opciones
var qrOptionsDialog = document.getElementById("qrOptionsDialog");
var hintIcon = document.getElementById("hintIcon");
var closeQRDialog = document.getElementById("closeQRDialog");
var downloadQRButton = document.getElementById("downloadQRButton");
var closeDialog = document.getElementById("closeDialog");

// Obtener el diálogo para niveles de corrección de errores
var dialog = document.getElementById("hintDialog");

// Mostrar el diálogo de opciones cuando se haga clic en el canvas
document.getElementById('qrCanvas').onclick = function () {
    if (qrGenerated) {
        qrOptionsDialog.showModal();
    } else {
        alert("Por favor, generá un QR para continuar.")
    }
}

// Descargar el QR como imagen PNG
downloadQRButton.onclick = function () {
    var canvas = document.getElementById('qrCanvas');
    var dataURL = canvas.toDataURL('image/png');
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = 'qr-code.png';
    link.click();
}

// Cerrar el diálogo de opciones
closeQRDialog.onclick = function () {
    qrOptionsDialog.close();
}

// Mostrar el diálogo de niveles de corrección de errores cuando se haga clic en el icono de ayuda
hintIcon.onclick = function () {
    dialog.showModal();
}

// Cerrar el diálogo de niveles de corrección de errores
closeDialog.onclick = function () {
    dialog.close();
}

// Habilitar o deshabilitar el input de logo según el nivel de corrección
document.getElementById('levelSelect').addEventListener('change', function () {
    var logoInput = document.getElementById('logoInput');
    if (this.value === 'H' || this.value === 'Q') {
        logoInput.disabled = false;
    } else {
        logoInput.disabled = true;
        logoInput.value = ''; // Limpiar la selección del logo si se cambia el nivel de corrección
    }
});

// Función para generar el código QR
function generateQR() {
    var url = document.getElementById('urlInput').value;
    if (!url.trim()) { // Verificar si la URL está vacía
        alert("Por favor, ingresá una URL válida.");
        return;
    }

    var size = parseInt(document.getElementById('sizeInput').value);
    var level = document.getElementById('levelSelect').value;
    var color = document.getElementById('colorInput').value;
    var bgColor = document.getElementById('bgColorInput').value;
    var logoInput = document.getElementById('logoInput').files[0]; // Obtener el archivo de logo subido

    var qr = new QRious({
        element: document.getElementById('qrCanvas'),
        value: url,
        size: size,
        level: level,
        foreground: color,
        background: bgColor
    });

    qrGenerated = true; // Marcar que se ha generado un QR

    // Si se ha subido un logo y el nivel de corrección es 'ALTO'
    if (logoInput && level === 'H' || level === 'Q') {
        var context = document.getElementById('qrCanvas').getContext('2d');
        var logo = new Image();
        var reader = new FileReader();

        reader.onload = function (event) {
            logo.src = event.target.result;
            logo.onload = function () {
                // Redibujar el QR para asegurar que se muestre
                qr.update();

                // Ajustar el tamaño del logo
                if (level === 'H') {
                    var logoSize = Math.min(size * 0.45, size * 0.35); // El logo no puede ser mayor al 40% del tamaño del QR
                } else {
                    var logoSize = Math.min(size * 0.4, size * 0.3); // El logo no puede ser mayor al 40% del tamaño del QR
                }
                var x = (size - logoSize) / 2;
                var y = (size - logoSize) / 2;

                context.drawImage(logo, x, y, logoSize, logoSize);
            };
        };

        reader.readAsDataURL(logoInput);
    }
}
