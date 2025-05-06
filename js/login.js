document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                alert('Credenciales incorrectas')
            }else{
                const result = await response.json();
                alert(result.mensaje);
                if (result.token) {
                    localStorage.setItem('token', result.token); 
                    window.location.href = 'index.html';
                }
            }     

        } catch (error) {
            console.error('Error:', error);
        }
    });
});
