document.addEventListener('DOMContentLoaded', function () {
    let usuarioEditando = null;
    validarToken().then(esValido => {
      if (!esValido) {
        window.location.href = 'login.html';
      }
    });

    document.getElementById('usuarios').addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const form = e.target;
        form.rut.disabled = false;  
        const formData = new FormData(form);
        form.rut.disabled = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true; 

        const rut = form.rut.value;

        if (!Fn.validaRut(rut)) {
            alert("El RUT ingresado no es válido.");
            submitBtn.disabled = false;
            return;
        }

        
        const data = Object.fromEntries(formData.entries());

        data.vigente = form.vigente.checked ? 1 : 0;

        let url = `${CONFIG.API_BASE_URL}/register`;
        let method = 'POST';

        if (usuarioEditando) {
            url = `${CONFIG.API_BASE_URL}/usuarios/${usuarioEditando.id}`;
            method = 'PUT';
            if (!data.password) {
                delete data.password;
            }
        }
        
        try{
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error en respuesta:', errorData);
                alert(errorData.mensaje);  
            } else {
                const result = await response.json();
                alert(result.mensaje);
                usuarioEditando = null;
                form.rut.disabled = false;
                form.reset();
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error creando al usuario, favor validar los datos')
        } finally {
            submitBtn.disabled = false;
        }
    });

    document.getElementById('buscarForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const rut = e.target.rutBuscar.value.trim();
        const mail = e.target.mailBuscar.value.trim();
        const params = new URLSearchParams();

        if (rut) params.append('rut', rut);
        if (mail) params.append('mail', mail);

        if (!rut && !mail) {
            alert("Debe ingresar un Rut o Mail para buscar")
            return;
        }

        if (rut){
            if (!Fn.validaRut(rut)) {
                alert("El RUT ingresado no es válido.\nDebe ingresarse sin puntos, con guion y digito verificador");
                return;
            }
        }
        

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/usuarios?${params.toString()}`)
            if (!response.ok) {
                alert("Usuario no encontrado");
                return;
            }

            const data = await response.json();
            const usuario = data.usuario;

            usuarioEditando = usuario;

            const form = document.getElementById('usuarios');
            form.rut.value = usuario.rut || '';
            form.rut.disabled = true;
            form.mail.value = usuario.mail || '';
            form.nombre.value = usuario.nombre || '';
            form.apellido.value = usuario.apellido || '';
            form.rol.value = usuario.rol || '';
            form.password.value = '';
            form.vigente.checked = usuario.activo === 1;

        } catch (error) {
            console.error('Error al buscar usuario:', error);
        }
    })
})