async function validarToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/verify/token`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        if (!response.ok) {
            return false;
        }

        const result = await response.json();
        return true;

    } catch (error) {
        console.error('Error al validar el token', error);
        return false;
    }
}