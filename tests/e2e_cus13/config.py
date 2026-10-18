import os

# Base URL configuration with fallback
DEFAULT_URL = "http://localhost:5050/api"
BASE_URL = os.getenv("API_URL", os.getenv("BASE_URL", DEFAULT_URL)).rstrip("/")

# Test User Credentials
USERS = {
    "admin": {
        "usuario": "admin",
        "contrasena": "Password123!",
        "rol": "Administrador",
        "nombre": "Administradora General"
    },
    "cajero": {
        "usuario": "atorres",
        "contrasena": "Password123!",
        "rol": "Cajero",
        "nombre": "Ana Torres"
    },
    "mozo": {
        "usuario": "lperez",
        "contrasena": "Password123!",
        "rol": "Mozo",
        "nombre": "Luis Pérez"
    },
    "cocinero": {
        "usuario": "msoto",
        "contrasena": "Password123!",
        "rol": "Cocinero",
        "nombre": "María Soto A"
    }
}

# Peruvian Currency Denominations (PEN)
DENOMINACIONES_BILLETES = [200.00, 100.00, 50.00, 20.00, 10.00]
DENOMINACIONES_MONEDAS = [5.00, 2.00, 1.00, 0.50, 0.20, 0.10]
TODAS_DENOMINACIONES = DENOMINACIONES_BILLETES + DENOMINACIONES_MONEDAS

# System Message Catalog Codes and Texts for CUS 13
MESSAGES = {
    "MSG_166": "Todavía no hay caja abierta. Ábrala para empezar a cobrar.",
    "MSG_167": "Ya existe una caja abierta",
    "MSG_168": "sin cerrar. Ciérrela antes de abrir una nueva o cobrar.",
    "MSG_169": "Ingrese el monto inicial.",
    "MSG_170": "Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales",
    "MSG_171": "El monto no puede superar S/ 99,999.99.",
    "MSG_172": "¿Abrir la caja con S/",
    "MSG_173": "Caja abierta con S/",
    "MSG_174": "No se puede cerrar la caja: hay",
    "MSG_175": "Ingrese el efectivo contado.",
    "MSG_176": "Cuadra: el efectivo contado coincide con el esperado.",
    "MSG_177": "Sobrante de S/",
    "MSG_178": "Faltante de S/",
    "MSG_179": "La observación no puede superar los 200 caracteres.",
    "MSG_180": "¿Cerrar la caja? No podrá cobrar hasta abrir una nueva y el cierre no se puede deshacer.",
    "MSG_181": "Caja cerrada.",
    "MSG_182": "No se pudo abrir la caja. No se registró la apertura; intente nuevamente.",
    "MSG_183": "No se pudo cerrar la caja. La caja sigue abierta; intente nuevamente.",
    "MSG_184": "La cantidad debe ser un número entero entre 0 y 999.",
    "MSG_185": "No se encontraron cierres de caja con ese criterio. Pruebe con otro rango de fechas.",
    "MSG_186": "No se pudo cargar el historial de cierres. Intente nuevamente.",
    "MSG_187": "Aún no hay cierres de caja registrados.",
    "MSG_188": "La fecha \"desde\" no puede ser posterior a \"hasta\" ni incluir fechas futuras.",
    "MSG_189": "Los totales cambiaron mientras contaba",
    "MSG_135": "Debe abrir la caja antes de cobrar.",
    "MSG_39": "No tiene permiso para realizar esta acción.",
    "MSG_38": "Hay errores en el formulario. Corrija los campos marcados."
}
