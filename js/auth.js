async function validarToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/verify/token', {
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
