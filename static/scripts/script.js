if(window.webkitSpeechRecognition == undefined){
    Swal.fire({
        title:"Error",
        text:"Su navegador no soporta el reconocimiento de voz.\nIntente con otro navegador",
        icon:"error",
        showConfirmButton: false,
        allowOutsideClick: false,
        footer: '<a href="https://www.google.com/intl/es-419/chrome/">Se recomienda usar Chrome</a>'
    });
    $('#cod-form').attr('disabled', 'true');
    $('#fecha_atencion').attr('disabled', 'true');
}else if(window.SpeechSynthesisUtterance == undefined){
    Swal.fire({
        title:"Error",
        text:"Su navegador no soporta el interprete de texto a voz.\nIntente con otro navegador",
        icon:"error",
        showConfirmButton: false,
        allowOutsideClick: false,
        footer: '<a href="https://www.google.com/intl/es-419/chrome/">Se recomienda usar Chrome</a>'
    });
    $('#cod-form').attr('disabled', 'true');
    $('#fecha_atencion').attr('disabled', 'true');
}

if(location.pathname=='/'){
    Swal.fire({
        type: 'info',
        title: 'Asistente Mejorado',
        text: 'Ver el asistente medico en modelo 3D',
        showCancelButton: true,
        confirmButtonText: 'Ver nuevo asistente',
        cancelButtonText: 'Continuar con asistente actual',
        allowOutsideClick: false,
    }).then((result) => {
        if(result.value){
            location.href = '/asistente/3d';
        }else{
            $('#cedula').focus();
            /*$('#fondo_popups').show();
            $('#sidebar_preferencias').collapse('show');*/
        }
    });
}else{
    $('#fondo_popups').show();
    $('#sidebar_preferencias').collapse('show');
}



generarCodigoForm();

const infoAdicional = $('#result');
var estadoAsistente = "detenido"; // cambiar a detenido
var asistenteFinalizo = false;
var preferencias = ['1'];

$('#fecha_atencion').val(formatearFecha(new Date()));

var conversacion = []; // Guardara el historial de conversacion
const recognition = new webkitSpeechRecognition(); // Convertira la voz en texto y viceversa
recognition.lang = 'es-ES';
recognition.continuous = false;
recognition.interimResults = false;

const utterance = new SpeechSynthesisUtterance(); // Reproducira voz en base a texto
utterance.lang = 'es-ES';

var indexT = 0;

function cambiaAnimacionAsistente(animacion){
    let clasesAnim = [
        "iw-speaking",
        "iw-hearing",
        "iw-loading"
    ];

    for(let ca of clasesAnim){
        if($('#inner-wave').hasClass(ca)){
            $('#inner-wave').removeClass(ca);
        }
    }

    if(animacion != "estatica"){
        $('#outer-circle').removeClass('oc-pulsing');
        $('#inner-wave').addClass(animacion);
    }else{
        $('#outer-circle').addClass('oc-pulsing');
    }
}

function generarCodigoForm(){
    toggleLoading('mostrar', 'Cargando formulario...');
    fetch('/form/codigo', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        toggleLoading('ocultar');
        if(data['res'] == 1){
            $('#cod-form').val(data['contenido']);
        }else{
            location.reload();
        }
    })
    .catch(err => {
        toggleLoading('ocultar');
        Swal.fire({
            title:"No se pudo generar el codigo de formulario.",
            text:`Error: ${err}`,
            icon:"error",
            showConfirmButton: false,
            allowOutsideClick: false,
        });
    })
}

function aceptarPreferenciasA(){
    let preferenciasElem = document.querySelectorAll('.opc_preferencias');
    let cantValidados = 0;
    preferenciasElem.forEach(p => cantValidados += p.checked == true ? 1 : 0);
    if(cantValidados == 0){
        Swal.fire('Error', 'Seleccione al menos una preferencia antes de comenzar.', 'error');
        return;
    }else{
        preferencias = [];
        for(let pe of preferenciasElem){
            if(pe.checked){
                let prefId = pe.id.split('_')[1];
                console.log(prefId);
                document.querySelector(`#${prefId}`).parentElement.style.display = 'block';
                preferencias.push(pe.value);
            }
        }
        $('#fondo_popups').hide();
        $('#sidebar_preferencias').collapse('hide');
        $('#cedula').focus();
    }
}

// Funcion que permite reproducir voz en base al texto
async function hablar(texto) {
    const speechChunks = makeCunksOfText(texto); //Fragmenta el texto y reproduce en cola. Evita la saturación de SpeechSynthesis
    console.log(speechChunks);
    if(!$('#inner-wave').hasClass('iw-enabled')){
        $('#inner-wave').addClass('iw-enabled');
    }
    
    for (let i = 0; i < speechChunks.length; i++) {
        await new Promise((resolve, reject) => {
            window.speechSynthesis.cancel();
            utterance.text = speechChunks[i];
            window.speechSynthesis.speak(utterance);
            utterance.onstart = () => {
                if(i == 0){
                    cambiaAnimacionAsistente("iw-speaking");
                    estadoAsistente = "detenido"
                }
            }
            utterance.onend = () => {
                if (speechChunks.length - 1 == i) {
                   cambiaAnimacionAsistente("estatica");
                   estadoAsistente = "esperando";
                   
                    if(asistenteFinalizo){
                        $('#inner-wave').removeClass('iw-enabled');
                        guardarFormulario();
                        estadoAsistente = "detenido";
                    }
                }
                resolve();
            };
            utterance.onerror = (error) => {
                console.log(error);
                resolve();
            };
        });
    }
}

function makeCunksOfText(text) {
    const maxLength = 220; // entre 190 y 220
    let speechChunks = [];

    // Split the text into chunks of maximum length maxLength without breaking words
    while (text.length > 0) {
        if (text.length <= maxLength) {
            speechChunks.push(text);
            break;
        }

        let chunk = text.substring(0, maxLength + 1);

        let lastPointIndex = chunk.lastIndexOf('.');
        let lastSpaceIndex = chunk.lastIndexOf(' ');
        if (lastPointIndex !== -1) {
            speechChunks.push(text.substring(0, lastPointIndex));
            text = text.substring(lastPointIndex + 1);

        } else if (lastSpaceIndex !== -1) {
            speechChunks.push(text.substring(0, lastSpaceIndex));
            text = text.substring(lastSpaceIndex + 1);

        } else {
            // If there are no spaces in the chunk, split at the maxLength
            speechChunks.push(text.substring(0, maxLength));
            text = text.substring(maxLength);
        }
    }

    return speechChunks
}


/* EVENTOS DE ESCUCHA DEL NAVEGADOR */

function toggleEscucha(){
    if(estadoAsistente == "esperando"){
        iniciarEscucha();
    }else if(estadoAsistente == "escuchando"){
        detenerEscucha();
    }
}

function iniciarEscucha(){
    recognition.start();
}

function detenerEscucha(){
    recognition.stop();
}

// hace posible la conversacion con el asistente
function conversarAsistente(){
    const formData = new FormData();
    formData.append('mensaje', JSON.stringify(conversacion));
    formData.append('genero', $("#genero").val()=='M'?"Masculino":"Femenino");
    console.log(conversacion);
    fetch('/conversar', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(respuesta => {
        if(!$('#contenedor-typing').hasClass('ct-appear')){
            $('#contenedor-typing').addClass('ct-appear');
        }
        conversacion = [];
        if(respuesta['asis_funciones']){
            ejecutarFuncion(respuesta['asis_funciones']);

        }else if(respuesta['respuesta_msg']){
            let textType = document.getElementById('typeContenido');
            let rMensaje = respuesta['respuesta_msg']
            let iTextChar = 0;

            textType.textContent = "";
            idInt = setInterval(() => {
                if (iTextChar < rMensaje.length) {
                    textType.textContent += rMensaje.charAt(iTextChar);
                    iTextChar++;
                }else{
                    clearInterval(idInt);
                }
            }, 55); // Cambia el tiempo de espera según la velocidad deseada
            hablar(rMensaje);
            conversacion.push({"role": "assistant", "content": rMensaje});
        }
    });
}

recognition.onaudiostart = (event) => {
    cambiaAnimacionAsistente("iw-hearing");
    estadoAsistente = "escuchando";
}
recognition.onaudioend = (event) => {
    cambiaAnimacionAsistente("iw-loading");
    estadoAsistente = "detenido";
}

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;

    conversacion.push({"role": "user", "content": transcript});
    conversarAsistente();
};

recognition.onerror = (event) => {
    Swal.fire("Error al reconocer la voz", "Error: "+event.error, "error");
    cambiaAnimacionAsistente("estatica");
    estadoAsistente = "esperando";
};

/*recognition.onend = () => {
    //recognition.start();
    btnStop.hide();
    btnStart.show();
    btnStart.attr("disabled", "true");
    btnStop.attr("disabled", "true");
    //cambiaAnimacionAsistente("iw-loading");
};*/

function toggleLoading(accion, mensaje=""){
    if(accion == 'mostrar'){
        $('#formulario-carga').show();
    }else if(accion == 'ocultar'){
        $('#formulario-carga').hide();
    }
    $('#mensaje-cargaf p').text(mensaje);
}

function abrirModalHistorialSintomas(){
    let tabla = $('#tblHistorialSintomas tbody');
    if(tabla && tabla.children().length > 0){
        $('#modalHistorialSintomas').modal('show');
    }else{
        Swal.fire('Seleccione paciente', 'Debe elegir un paciente para ver el historial de síntomas.', 'warning');
    }
    
}

//Buscar paciente por numero de cedula
function buscarPaciente() {
    let cedula = document.getElementById('cedula').value;
    let fecha = document.getElementById('fecha_atencion').value;

    const formData = new FormData();
    formData.append('cedula', cedula);
    formData.append('codfuncs', preferencias);
    formData.append('fecha', fecha);
    toggleLoading('mostrar', 'Cargando datos del paciente...');
    fetch('/paciente', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        //toggleLoading('ocultar');
        asistenteFinalizo = false;
        if(data.code == 1){
            let paciente = data['datos']
            cargarDatosPacientes(paciente);

            $('#peso').removeAttr('disabled');
            $('#talla').removeAttr('disabled');
            $('#p-sistolica').removeAttr('disabled');
            $('#p-distolica').removeAttr('disabled');
            $('#frecuencia-card').removeAttr('disabled');
            $('#temperatura').removeAttr('disabled');

            cargarHistorialSintomas(cedula, paciente['nombres']);
        }else{
            Swal.fire('Error', 'No hay pacientes con ese número de cedula', 'error');
        }
    })
    .catch(err => {
        toggleLoading('ocultar');
        Swal.fire('Error', `No se pudo realizar la solicitud. Error: ${err}`, 'error');
    })
}

function cargarHistorialSintomas(cedula, nombres){
    toggleLoading('mostrar', 'Cargando sintomas...');
    const formData = new FormData();
    formData.append('cedula', cedula)
    fetch('/sintomas', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        toggleLoading('ocultar');
        $('#btnGuardarForm').removeAttr('disabled');

        $('#tblHistorialSintomas tbody').empty();
        let txtBienvenida = `El paciente que atenderas se llama ${nombres}, tiene ${$("#edad").val()} años de edad y su genero es ${$("#genero").val()=='M'?"Masculino":"Femenino"}. `; //y es de genero ...
        if(data.res == 1){
            let indice = 0;
            let sintomas = data['contenido']
            let tBody = $('#tblHistorialSintomas tbody');

            for(let fila of sintomas){
                indice += 1;
                let tr = $('<tr></tr>');
                tr.append($('<td></td>').html(`<b>${indice}</b>`));
                tr.append($('<td></td>').text(formatearFecha(new Date(fila['Fecha']))));
                tr.append($('<td></td>').text(fila['Cedula']));
                tr.append($('<td></td>').text(fila['Sintomas']));
                tBody.append(tr);
            }

            console.log(sintomas[0]['Sintomas']);

            txtBienvenida = txtBienvenida + `Segun tus registros este paciente en una consulta anterior llegó presentando los siguientes sintomas: ${sintomas[0]['Sintomas']}. Dale una bienvenida, y ayudalo.`;
        }else{
            txtBienvenida = txtBienvenida + `Es la primera vez que este paciente llega atenderse a la clinica, por lo que no ha tenido registros de sintomas anteriormente. Dale una bienvenida, y ayudalo.`;
        }
        conversacion.push({"role": "user", "content": txtBienvenida});
        console.log(conversacion);
        conversarAsistente();
    })
    .catch(err => {
        toggleLoading('ocultar');
        Swal.fire('Error', `No se pudo realizar la solicitud. Error: ${err}`, 'error')
    });
}

function comprobarCampos(cod){
    switch(cod){
        case 1:{
            if($('#cod-form').val() != '' && $('#fecha_atencion').val() != ''){
                $('#btn-buscar').removeAttr('disabled');
                $('#cedula').removeAttr('disabled');
                $('#nombres').removeAttr('disabled');
                $('#fechaNacimiento').removeAttr('disabled');
                $('#telefono').removeAttr('disabled');
                $('#correo').removeAttr('disabled');
                $('#ciudad').removeAttr('disabled');
                $('#direccion').removeAttr('disabled');
            }else if($('#cod-form').val() == '' || $('#fecha_atencion').val() == ''){
                $('#btn-buscar').attr('disabled', 'true');
                $('#cedula').attr('disabled', 'true');
                $('#nombres').attr('disabled', 'true');
                $('#fechaNacimiento').attr('disabled', 'true');
                $('#telefono').attr('disabled', 'true');
                $('#correo').attr('disabled', 'true');
                $('#ciudad').attr('disabled', 'true');
                $('#direccion').attr('disabled', 'true');
            }
        }
        break;
        case 2:{
            if(
                $('#cedula').val() != '' &&
                $('#nombres').val() != '' &&
                $('#fechaNacimiento').val() != '' &&
                $('#telefono').val() != '' &&
                $('#correo').val() != '' &&
                $('#ciudad').val() != '' &&
                $('#direccion').val() != ''
            ){
                $('#peso').removeAttr('disabled');
                $('#talla').removeAttr('disabled');
                $('#p-sistolica').removeAttr('disabled');
                $('#p-distolica').removeAttr('disabled');
                $('#frecuencia-card').removeAttr('disabled');
                $('#temperatura').removeAttr('disabled');
            }else if(
                $('#cedula').val() == '' ||
                $('#nombres').val() == '' ||
                $('#fechaNacimiento').val() == '' ||
                $('#telefono').val() == '' ||
                $('#correo').val() == '' ||
                $('#ciudad').val() == '' ||
                $('#direccion').val() != ''
            ){
                $('#peso').attr('disabled', 'true');
                $('#talla').attr('disabled', 'true');
                $('#p-sistolica').attr('disabled', 'true');
                $('#p-distolica').attr('disabled', 'true');
                $('#frecuencia-card').attr('disabled', 'true');
                $('#temperatura').attr('disabled', 'true');
            }
        }
        break;
        case 3:{

        }
        break;
        default:{

        }
        break;
    }

}

function cargarDatosPacientes(paciente){
    let hoy = new Date();
    let fNac = new Date(paciente['f_nacimiento']);
    let edad = hoy.getFullYear() - fNac.getFullYear();
    let m = hoy.getMonth() - fNac.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < fNac.getDate())) {
        edad--;
    }
    $('#idPaciente').val(paciente['id']);
    $('#nombres').val(`${paciente['nombres']} ${paciente['apellidos']}`);
    $('#fechaNacimiento').val(paciente['f_nacimiento']);
    $('#genero').val(paciente['genero']);
    $('#edad').val(edad);
    $('#telefono').val(paciente['telefono']);
    $('#correo').val(paciente['correo']);
    $('#ciudad').val(paciente['ciudad']);
    $('#direccion').val(paciente['direccion']);
}

function formatearFecha(date){
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11
    let day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

async function ejecutarFuncion(asisFunciones){
    console.log(asisFunciones);
    let handleAFunciones = {
        'get_sintomas': getSintomas,
        'sfromgenero': getSintomasxGenero,
        'get_diagnostico': getDiagnostico,
        'get_tratamiento': getTratamiento,
        'finalizar': finalizarAsistente,
        'guardar_form': guardarxAsistente
    }

    for(let afuncion of asisFunciones){
        //afuncion['funcion']
        //afuncion['funcion_args'] = JSON.parse(afuncion['funcion_args']);
        //console.log(afuncion);
        const activarFuncion = handleAFunciones[afuncion['funcion_name']];

        let rcontent = activarFuncion(afuncion);
        let respuestaF = {
            "tool_call_id": afuncion['funcion_id'],
            "role": "tool",
            "name": afuncion['funcion_name'],
            "content": rcontent,
        };
        conversacion.push(respuestaF);
    }
    conversarAsistente();
}

function getSintomas(sintomas){
    let fArgumentos = sintomas['funcion_args'];
    console.log(fArgumentos);

    let sFiltrados = fArgumentos['sintomas'];
    if(fArgumentos['excluidos']){
        sFiltrados = fArgumentos['sintomas'].filter(s => !fArgumentos['excluidos'].includes(s));
        console.log("SinExcluidos => " + sFiltrados);
    }
    if(fArgumentos['nuevos']){
        fArgumentos['nuevos'].forEach(s => {
            if (!sFiltrados.includes(s)) {
                sFiltrados.push(s);
            }
        });
        console.log("ConNuevos => " + sFiltrados);
    }
    let sintomasFinales = sFiltrados;
    if(fArgumentos['sfromgenero'] && fArgumentos['sfromgenero'].length > 0){
        sintomasFinales = [];
        /*if(typeof(fArgumentos['sfromgenero']) == 'object'){
            for(let sfg of fArgumentos['sfromgenero']){
                for(let sfilt of sFiltrados){
                    console.log(sfg);
                    console.log(sfilt);
                    if(!sfilt.includes(sfg)){
                        sintomasFinales.push(sfilt);
                    }
                }
            }
        }else{
            for(let sfilt of sFiltrados){
                let sfg = fArgumentos['sfromgenero'];
                console.log(sfg);
                console.log(sfilt);
                if(!sfilt.includes(sfg)){
                    sintomasFinales.push(sfilt);
                }
            }
        }*/
        for(let sfilt of sFiltrados){
            if(!fArgumentos['sfromgenero'].includes(sfilt)){
                sintomasFinales.push(sfilt);
            }
        }
        //sintomasFinales = sFiltrados.filter(s => !fArgumentos['sfromgenero'].includes(s));
        console.log("SinGenero => " + sintomasFinales);

    }
    console.log("Ultimos => " + sintomasFinales);
    let txtSintomas = sintomasFinales.join(', ');
    $('#sintomatologia').val(txtSintomas);
    $('#sintomatologia').removeAttr('disabled');
    document.querySelector("#sintomatologia").scrollIntoView({ behavior: 'smooth' });

    if(fArgumentos['sfromgenero'] && fArgumentos['sfromgenero'].length > 0){
        let genero = $('#genero').val()=="M"?"Masculino":"Femenino";
        let sintomasgenero = (typeof(fArgumentos['sfromgenero']) == 'object') ? fArgumentos['sfromgenero'].join(',') : fArgumentos['sfromgenero'];
        return sintomasgenero + " no son sintomas que correspondan al genero " + genero;
    }else{
        return JSON.stringify({success: true});
    }
}

function getSintomasxGenero(sintomas){
    console.log(sintomas);
    return JSON.stringify({success: true});
}

function getDiagnostico(respuesta){
    let diagnostico = respuesta['funcion_args']['diagnostico'];
    $('#diagnostico').val(diagnostico);
    $('#diagnostico').removeAttr('disabled');
    document.querySelector("#diagnostico").scrollIntoView({ behavior: 'smooth' });
    return JSON.stringify({success: true});
}

function getTratamiento(respuesta){
    let tratamiento = respuesta['funcion_args']['tratamiento'];
    $('#tratamiento').val(tratamiento);
    $('#tratamiento').removeAttr('disabled');
    document.querySelector("#tratamiento").scrollIntoView({ behavior: 'smooth' });
    return JSON.stringify({success: true});
}

function finalizarAsistente(respuesta){
    let fArgumentos = respuesta['funcion_args'];
    console.log(fArgumentos);

    //asistenteFinalizo = true;
    //return JSON.stringify({success: true, extraMsg: "Preguntale al paciente que si desea guardar el formulario, lo puede hacer dando clic el botón de guardar o tambien pidiendotelo a ti."});
    return "Informale al paciente que puede guardar el formulario solicitandotelo a ti o si lo desea tambien puede hacerlo dando click en el botón.";
}

async function guardarxAsistente(respuesta){
    /*let fArgumentos = respuesta['funcion_args'];
    console.log(fArgumentos);
    let data = await guardarFormulario();
    let r;

    if (data){
        if(data.res == 1){
            asistenteFinalizo = true;
            r = JSON.stringify({success: true}); //Informale que se esta guardando el formulario
        }else{
            r = `Hubo un problema al guardar el formulario: ${data["contenido"]}`;
        }
    })
    .catch(err => {
        r = err;
    });

    return r;*/
    let fArgumentos = respuesta['funcion_args'];
    console.log(fArgumentos);

    asistenteFinalizo = true;
    //return JSON.stringify({success: true, extraMsg: "Preguntale al paciente que si desea guardar el formulario, lo puede hacer dando clic el botón de guardar o tambien pidiendotelo a ti."});
    return "Informale al paciente que se esta guardando el formulario y finaliza la conversacion.";
}

function pedirGuardarForm(){
    if(asistenteFinalizo){
        guardarFormulario();
    }else{
        let msgGuardar = "Guarda el formulario";
        conversacion.push({"role": "user", "content": msgGuardar});
        conversarAsistente();
    }
}

function guardarFormulario(){
    let formData = new FormData();

    // Datos Formulario
    formData.append('idPaciente', $('#idPaciente').val());
    formData.append('codFormulario', $('#cod-form').val());
    formData.append('fechaAtencion', $('#fecha_atencion').val());
    formData.append('cedula', $('#cedula').val());
    //Datos Adicionales Paciente
    formData.append('peso', $('#peso').val() == "" ? "0.00" : parseFloat($('#peso').val()));
    formData.append('estatura', $('#talla').val() == "" ? "0.00" : parseFloat($('#talla').val()));
    formData.append('presionSistolica', $('#p-sistolica').val() == "" ? "0.00" : parseFloat($('#p-sistolica').val()));
    formData.append('presionDistolica', $('#p-distolica').val() == "" ? "0.00" : parseFloat($('#p-distolica').val()));
    formData.append('frecuenciaCardiaca', $('#frecuencia-card').val() == "" ? "0.00" : parseFloat($('#frecuencia-card').val()));
    formData.append('temperatura', $('#temperatura').val() == "" ? "0.00" : parseFloat($('#temperatura').val()));
    //Datos Sintomatologia

    if(preferencias.includes('1')) formData.append('sintomas', $('#sintomatologia').val());
    if(preferencias.includes('2')) formData.append('diagnostico', $('#diagnostico').val());
    if(preferencias.includes('3')) formData.append('tratamiento', $('#tratamiento').val());

    
    toggleLoading('mostrar', 'Guardando formulario...');
    fetch('/form/guardar', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        toggleLoading('ocultar');
        if(data.res == 1){
            Swal.fire("Guardado exitoso", data.contenido, "success");
            $('#btnGuardarForm').attr('disabled', true);
        }else{
            Swal.fire("Error al guardar", data.contenido, "error");
        }
    })
    .catch(err => {
        toggleLoading('ocultar');
        Swal.fire("Ocurrió un error al enviar los datos", `Error: ${err}`, "error")
    })
}