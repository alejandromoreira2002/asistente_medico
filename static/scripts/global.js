function comprobarPermisos(tipo){
    //Comprobar permisos de voz
    if(tipo == 'microfono'){
        navigator.permissions.query({ name: 'microphone' })
        .then(function(permissionStatus) {
            console.log('Estado del permiso del micrófono:', permissionStatus.state);

            if (permissionStatus.state === 'granted') {
                console.log('Acceso al micrófono');
            } else if (permissionStatus.state === 'prompt') {
                Swal.fire({
                    //title:"Error",
                    title:"Para poder usar el asistente correctamente debe concederle permisos de acceso al microfono",
                    icon:"info"
                }).then((result) => {
                    navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        console.log('Permiso concedido. El micrófono está disponible.');
                        // Aquí puedes hacer uso del stream de audio
                        // Detén el stream si no lo necesitas inmediatamente
                        stream.getTracks().forEach(track => track.stop());
                    })
                    .catch(function(error) {
                        if (error.name === 'NotAllowedError') {
                        console.error('El usuario ha denegado el acceso al micrófono.');
                        } else if (error.name === 'NotFoundError') {
                        console.error('No se encontró ningún micrófono disponible.');
                        } else {
                        console.error('Error al solicitar el acceso al micrófono:', error);
                        }
                    });
                });
            } else if (permissionStatus.state === 'denied') {
                Swal.fire({
                    title:"Microfono deshabilitado",
                    html:"<p>El microfono se encuentra deshabilitado o no ha concedido los permisos de acceso al navegador.</p><p><em>Por favor, habilite el microfono para usar el asistente.</em></p>",
                    icon:"error",
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
            }

            // Monitorea los cambios en el estado del permiso
            permissionStatus.onchange = function() {
                location.reload();
            };
        })
        .catch(function(error) {
            console.error('Error al verificar el estado del permiso del micrófono:', error);
        });
        /*navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            // El usuario ha concedido el acceso al micrófono
            console.log("Acceso al micrófono concedido.");
        })
        .catch(function(err) {
            // El usuario ha denegado el acceso al micrófono o ha ocurrido un error
            console.error("Error al intentar acceder al micrófono:", err);
        });*/

    }
}

function comprobarNavegador(navegador) {
    const userAgent = navigator.userAgent;

    switch(navegador){
        case "chrome":
            return /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
        break;
        case "safari":
            return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
        break;
        case "edge":
            return /Edg/.test(navigator.userAgent); 
        break;
        case "opera":
            return /OPR/.test(navigator.userAgent) || /Opera/.test(navigator.userAgent);
        break;
    }
}
