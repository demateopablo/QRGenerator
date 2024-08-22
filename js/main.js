        // Variable para verificar si se generó un QR
        let qrGenerated = false;

        // Actualizar el tamaño del QR en el DOM
        document.getElementById('sizeInput').addEventListener('input', function() {
            document.getElementById('sizeLabel').textContent = `Tamaño: ${this.value}px`;
        });

        // Obtener el diálogo y los botones de opciones
        var qrOptionsDialog = document.getElementById("qrOptionsDialog");
        var hintIcon = document.getElementById("hintIcon");
        var closeQRDialog = document.getElementById("closeQRDialog");
        var downloadQRButton = document.getElementById("downloadQRButton");
        var closeDialog = document.getElementById("closeDialog");

        // Obtener el diálogo para niveles de corrección de errores
        var dialog = document.getElementById("myDialog");

        // Mostrar el diálogo de opciones cuando se haga clic en el canvas
        document.getElementById('qrCanvas').onclick = function() {
            if (qrGenerated) {
                qrOptionsDialog.showModal();
            } else {
                alert("Por favor, generá un QR para continuar.")
            }
        }

        // Descargar el QR como imagen PNG
        downloadQRButton.onclick = function() {
            var canvas = document.getElementById('qrCanvas');
            var dataURL = canvas.toDataURL('image/png');
            var link = document.createElement('a');
            link.href = dataURL;
            link.download = 'qr-code.png';
            link.click();
        }

        // Cerrar el diálogo de opciones
        closeQRDialog.onclick = function() {
            qrOptionsDialog.close();
        }

        // Mostrar el diálogo de niveles de corrección de errores cuando se haga clic en el icono de ayuda
        hintIcon.onclick = function() {
            dialog.showModal();
        }

        // Cerrar el diálogo de niveles de corrección de errores
        closeDialog.onclick = function() {
            dialog.close();
        }

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

            var qr = new QRious({
                element: document.getElementById('qrCanvas'),
                value: url,
                size: size,
                level: level,
                foreground: color,
                background: bgColor
            });

            qrGenerated = true; // Marcar que se ha generado un QR
        }
