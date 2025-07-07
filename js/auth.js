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
            console.log('problemas por aca papito')
            return false;
        }

        const result = await response.json();
        console.log(result)
        return true;

    } catch (error) {
        console.error('Error al validar el token', error);
        return false;
    }
}