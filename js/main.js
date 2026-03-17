// ── Estado ──────────────────────────────────────────────
let qrGenerated = false;

// ── Helpers ─────────────────────────────────────────────
const $ = id => document.getElementById(id);

function triggerRevealAnimation() {
  const canvas = $('qrCanvas');
  canvas.classList.remove('qr-reveal');
  void canvas.offsetWidth;
  canvas.classList.add('qr-reveal');
}

function buildQR(value) {
  if (!value?.trim()) return null;
  return new QRious({
    element:    $('qrCanvas'),
    value,
    size:       parseInt($('sizeInput').value),
    level:      $('levelSelect').value,
    foreground: $('colorInput').value,
    background: $('bgColorInput').value,
  });
}

function overlayLogo(qr, logoFile) {
  if (!logoFile) return;
  const level   = $('levelSelect').value;
  const size    = parseInt($('sizeInput').value);
  const context = $('qrCanvas').getContext('2d');
  const reader  = new FileReader();
  reader.onload = ({ target }) => {
    const logo = new Image();
    logo.src   = target.result;
    logo.onload = () => {
      qr.update();
      const logoSize = size * (level === 'H' ? 0.35 : 0.30);
      const offset   = (size - logoSize) / 2;
      context.drawImage(logo, offset, offset, logoSize, logoSize);
    };
  };
  reader.readAsDataURL(logoFile);
}

// ── Slider fill ──────────────────────────────────────────
// Actualiza la custom property --val que el CSS usa para el gradiente
function updateSliderFill(input) {
  const min = parseFloat(input.min) || 0;
  const max = parseFloat(input.max) || 100;
  const pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
  input.style.setProperty('--val', `${pct}%`);
}

// ── Modo activo ──────────────────────────────────────────
let activeMode = 'url';

function setMode(mode) {
  activeMode = mode;
  $('panel-url').hidden  = mode !== 'url';
  $('panel-wifi').hidden = mode !== 'wifi';
  $('panel-mp').hidden   = mode !== 'mp';
  document.querySelectorAll('.tab-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.mode === mode)
  );
}

// ── Construir valor del QR según modo ───────────────────
function buildQRValue() {
  if (activeMode === 'url') {
    const url = $('urlInput').value.trim();
    if (!url) { alert('Por favor, ingresá una URL válida.'); return null; }
    return url;
  }

  if (activeMode === 'wifi') {
    const ssid     = $('wifiSSID').value.trim();
    const password = $('wifiPassword').value; // no trim: espacios son válidos en contraseñas
    const security = $('wifiSecurity').value;
    if (!ssid) { alert('Por favor, ingresá el nombre de la red (SSID).'); return null; }
    if (security === 'nopass') return `WIFI:T:nopass;S:${ssid};;`;
    return `WIFI:T:${security};S:${ssid};P:${password};;`;
  }

  if (activeMode === 'mp') {
    const alias = $('mpAlias').value.trim();
    if (!alias) { alert('Por favor, ingresá tu alias o CBU/CVU.'); return null; }
    /*
      Mercado Pago no tiene un deep link público para transferencias desde QR externo.
      Los QR que genera la propia app usan un formato privado firmado, no replicable.
      La solución honesta: encodear el alias como texto plano con un prefijo claro.
      Quien escanee verá el alias y lo copia en la app de MP para transferir.
    */
    return `Alias: ${alias}`;
  }

  return null;
}

// ── Generar QR ───────────────────────────────────────────
function generateQR() {
  const value = buildQRValue();
  if (!value) return;

  const logoFile = $('logoInput').files[0];
  const qr       = buildQR(value);

  if (logoFile && ['H', 'Q'].includes($('levelSelect').value)) {
    overlayLogo(qr, logoFile);
  }

  triggerRevealAnimation();
  qrGenerated = true;
}

// ── Listeners ────────────────────────────────────────────

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn =>
  btn.addEventListener('click', () => setMode(btn.dataset.mode))
);

// Slider — label + fill
const sizeInput = $('sizeInput');
sizeInput.addEventListener('input', function () {
  $('sizeLabel').textContent = `Tamaño: ${this.value}px`;
  updateSliderFill(this);
});
updateSliderFill(sizeInput); // inicializar fill al cargar la página

// Nivel de corrección → habilitar logo
$('levelSelect').addEventListener('change', function () {
  const logoInput  = $('logoInput');
  const canUseLogo = this.value === 'H' || this.value === 'Q';
  logoInput.disabled = !canUseLogo;
  if (!canUseLogo) logoInput.value = '';
});

// Canvas → abrir opciones
$('qrCanvas').addEventListener('click', () => {
  if (qrGenerated) {
    $('qrOptionsDialog').showModal();
  } else {
    alert('Por favor, generá un QR para continuar.');
  }
});

// Descargar QR
$('downloadQRButton').addEventListener('click', () => {
  const link    = document.createElement('a');
  link.href     = $('qrCanvas').toDataURL('image/png');
  link.download = 'qr-code.png';
  link.click();
});

// Toggle visibilidad contraseña WiFi
$('toggleWifiPassword').addEventListener('click', function () {
  const input      = $('wifiPassword');
  const isHidden   = input.type === 'password';
  input.type       = isHidden ? 'text' : 'password';
  this.textContent = isHidden ? '🙈' : '👁';
});

// Cerrar dialogs
$('closeQRDialog').addEventListener('click', () => $('qrOptionsDialog').close());
$('closeDialog').addEventListener('click',   () => $('hintDialog').close());
$('hintIcon').addEventListener('click',      () => $('hintDialog').showModal());

// Cerrar al hacer clic en el backdrop
['hintDialog', 'qrOptionsDialog'].forEach(id =>
  $(id).addEventListener('click', function (e) {
    if (e.target === this) this.close();
  })
);