Swal.fire({
    title:"Seccion en Desarrollo",
    text:"Este apartado se encuentra en desarrollo, la mayoría de botones no tienen funcionalidad.",
    icon:"info"
});

function toggleLoading(accion, mensaje=""){
    if(accion == 'mostrar'){
        $('#formulario-carga').show();
    }else if(accion == 'ocultar'){
        $('#formulario-carga').hide();
    }
    $('#mensaje-cargaf p').text(mensaje);
}

function resetearCampos(){
    $('#cedula').val('');
    $('#nombres').val('');
    $('#apellidos').val('');
    $('#genero').val('');
    $('#fechaNacimiento').val('');
    $('#edad').val('');
    $('#telefono').val('');
    $('#correo').val('');
    $('#ciudad').val('');
    $('#direccion').val('');
    $('#btnGuardarPac').attr('disabled', true);
}

function calcularEdad(){
    let hoy = new Date();
    let fNac = new Date($('#fechaNacimiento').val());
    let edad = hoy.getFullYear() - fNac.getFullYear();
    let m = hoy.getMonth() - fNac.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < fNac.getDate())) {
        edad--;
    }
    return edad
}

function comprobarCampos(cod=''){
    if(cod == 1){$('#edad').val(calcularEdad())}
    if(
        $('#cedula').val() != '' &&
        $('#nombres').val() != '' &&
        $('#apellidos').val() != '' &&
        $('#genero').val() != '' &&
        $('#fechaNacimiento').val() != '' &&
        $('#edad').val() != '' &&
        $('#telefono').val() != '' &&
        $('#correo').val() != '' &&
        $('#ciudad').val() != '' &&
        $('#direccion').val() != ''
    ){
        $('#btnGuardarPac').removeAttr('disabled');
    }else if(
        $('#cedula').val() == '' ||
        $('#nombres').val() == '' ||
        $('#apellidos').val() == '' ||
        $('#fechaNacimiento').val() == '' ||
        $('#edad').val() == '' ||
        $('#telefono').val() == '' ||
        $('#correo').val() == '' ||
        $('#ciudad').val() == '' ||
        $('#direccion').val() == ''
    ){
        $('#btnGuardarPac').attr('disabled', true);
    }

}

function buscarCedula(){
    toggleLoading('mostrar', 'Verificando cedula...');
    let cedula = $('#cedula').val();
    let formData = new FormData();
    formData.append('cedula', cedula)
    fetch('/paciente/verificar', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        toggleLoading('ocultar');
        if(data['res'] == 1){
            Swal.fire({
                title:"Este paciente ya existe",
                text:"Ya existe un paciente con el número de cédula ingresado. Por favor, ingrese otro número de cédula.",
                icon:"error"
            });
            $('#cedula').val('');
        }else{
            comprobarCampos()
        }
    })
    .catch(err => {
        toggleLoading('ocultar');
        Swal.fire({
            title:"Error",
            text:`Ocurrió un error al realizar la petición. Error: ${err}`,
            icon:"error"
        });
        $('#cedula').val('');
    })
}

function registrarPaciente(){
    toggleLoading('mostrar', 'Guardando paciente...');
    let cedula = $('#cedula').val();
    let nombres = $('#nombres').val();
    let apellidos = $('#apellidos').val();
    let genero = $('#genero').val();
    let f_nacimiento = $('#fechaNacimiento').val();
    let edad = $('#edad').val();
    let telefono = $('#telefono').val();
    let correo = $('#correo').val();
    let ciudad = $('#ciudad').val();
    let direccion = $('#direccion').val();

    let formData = new FormData();
    formData.append('cedula', cedula);
    formData.append('nombres', nombres);
    formData.append('apellidos', apellidos);
    formData.append('genero', genero);
    formData.append('f_nacimiento', f_nacimiento);
    formData.append('edad', edad);
    formData.append('telefono', telefono);
    formData.append('correo', correo);
    formData.append('ciudad', ciudad);
    formData.append('direccion', direccion);
    
    fetch('/paciente/add', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        toggleLoading('ocultar');
        if(data['res'] == 1){
            Swal.fire({
                title:"¡Guardado exitoso!",
                text: data['mensaje'],
                icon:"success"
            });
            resetearCampos();
        }else{
            Swal.fire({
                title:"Ocurrió un error al guardar los datos",
                text: data['mensaje'],
                icon:"error"
            });
        }
    })
    .catch(err => {
        toggleLoading('ocultar');
        Swal.fire({
            title:"Error",
            text:`Ocurrió un error al realizar la petición. Error: ${err}`,
            icon:"error"
        });
    })
}