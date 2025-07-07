document.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById('login').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const data = Object.fromEntries(formData.entries());

        document.getElementById('loading-container').style.display = 'flex';

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            
            const result = await response.json();
            alert(result.mensaje || 'Error en las credenciales de ingreso');
            if (result.token) {
                localStorage.setItem('token', result.token); 
                window.location.href = 'index.html';
            }
            

        } catch (error) {
            console.error('Error:', error);
        }finally{
            document.getElementById('loading-container').style.display = 'none';
        } 
    });
});
