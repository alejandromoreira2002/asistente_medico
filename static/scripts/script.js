if(window.webkitSpeechRecognition == undefined){
    Swal.fire({
        title:"Error",
        text:"Su navegador no soporta el reconocimiento de voz.\nIntente con otro navegador",
        icon:"error",
        showConfirmButton: false,
        allowOutsideClick: false,
        footer: '<em>Se recomienda usar <a href="https://www.google.com/intl/es-419/chrome/">Chrome</a> o <a href="https://www.microsoft.com/es-es/edge/download">Edge</a></em>'
    });
    $('#cod-form').attr('disabled', 'true');
    $('#fecha_atencion').attr('disabled', 'true');
}else{
    /*if(!(/Macintosh/i.test(navigator.userAgent)))*/ comprobarPermisos('microfono');
}

if(window.SpeechSynthesisUtterance == undefined){
    Swal.fire({
        title:"Error",
        text:"Su navegador no soporta el interprete de texto a voz.\nIntente con otro navegador",
        icon:"error",
        showConfirmButton: false,
        allowOutsideClick: false,
        footer: '<em>Se recomienda usar <a href="https://www.google.com/intl/es-419/chrome/">Chrome</a> o <a href="https://www.microsoft.com/es-es/edge/download">Edge</a></em>'
    });
    $('#cod-form').attr('disabled', 'true');
    $('#fecha_atencion').attr('disabled', 'true');
}

if(window.SpeechSynthesis == undefined){
    Swal.fire({
        title:"Error",
        text:"Su navegador no soporta la reproduccion de voz.\nIntente con otro navegador",
        icon:"error",
        showConfirmButton: false,
        allowOutsideClick: false,
        footer: '<em>Se recomienda usar <a href="https://www.google.com/intl/es-419/chrome/">Chrome</a> o <a href="https://www.microsoft.com/es-es/edge/download">Edge</a></em>'
    });
    $('#cod-form').attr('disabled', 'true');
    $('#fecha_atencion').attr('disabled', 'true');
}

if(!(location.pathname=='/asistente' || location.pathname=='/~dev/asistente')){
    if(!(localStorage.getItem('voz_masculino') && localStorage.getItem('voz_femenino'))){
        if(navigator.platform){
            if(!(/Linux|iPhone|iPad/i.test(navigator.platform))) location.href = location.pathname;
        }else{
            if(!(/Android|iPhone|iPad/i.test(navigator.userAgent))) location.href = location.pathname;
        }
    }
    //$('#fondo_popups').show();
    //$('#sidebar_preferencias').collapse('show');
}

generarCodigoForm();

const infoAdicional = $('#result'); //No sirve para nada
var estadoAsistente = "detenido"; // Guarda el estado en el que se encuentra el asistente
var asistenteFinalizo = false; //verifica si se termina la conversacion con el asistente
var mostrandoResultados = false;
var preferencias = ['1', '2', '3']; //Guarda las preferencias (Sintomas, Diagnostico, Tratamiento) que elija el usuario
var conversacion = []; // Guardara el historial de conversacion
var cola_repro = []; //Encola nuevas respuestas del asistente para ser reproducidas
var tratamientos = []; //Crea una lista de tratamientos
$('#fecha_atencion').val(formatearFecha(new Date()));

const urlParams = new URLSearchParams(window.location.search);
var recognition;    //Crea y maneja el reconocimiento de voz
var utterance;  //Crea y guarda los estados de la reproduccion de voz
var synth;  //Crea la sintesis
var voces;  //Voces de la sintesis
var transcripcion; //Guarda la clase de transcripcion del reconocimiento de voz
var intervalo; //Guarda el time out de verificacion de reproduccion de voz
var intervaloSilencio; //Guarda el time out del reconocimiento de voz
const TIEMPO_CORTE = 2; //Establece un tiempo de espera en segundos para el intervalo
const TIEMPO_SILENCIO = 2.6; //Tiempo de silencio en segundos para reconocimiento de voz
const ASISTENTE2D = !location.pathname.includes('/3d') || urlParams.get('genero') == 'no';
//const TIEMPO_CORTE = 25;
//Inicializacion de los servicios
document.addEventListener("DOMContentLoaded", () => {
    if(!ASISTENTE2D){
        $('#inner-wave').html('<span id="icon_control" class="icon_control" title="Iniciar Asistente"></span>');
        $('#inner-wave').removeClass('inner-wave');
    }
    recognition = new webkitSpeechRecognition(); // Reconoce la voz y la convierte en texto
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onaudiostart = (event) => {
        if(ASISTENTE2D){
            cambiaAnimacionAsistente("iw-hearing");
        }else{
            cambiaAnimacionAsistente("detener-asistente");
        }
        estadoAsistente = "escuchando";
        intervaloSilencio = setTimeout(detenerEscucha, TIEMPO_SILENCIO * 1000);
    }
    recognition.onaudioend = (event) => {
        if(ASISTENTE2D){
            cambiaAnimacionAsistente("iw-loading");
        }else{
            cambiaAnimacionAsistente("cargando-asistente");
        }
        estadoAsistente = "detenido";
    }

    recognition.onend = (event) => {
        let textoCompleto = "";
        for (let i = 0; i < transcripcion.length; i++) {
            const transcript = transcripcion[i][0].transcript;
            textoCompleto += transcript;
        }
        console.log(textoCompleto);
        //$('#estaarea').val(textoCompleto);
        conversacion.push({"role": "user", "content": textoCompleto});
        conversarAsistente();
    }

    recognition.onresult = (event) => {
        clearTimeout(intervaloSilencio);
        transcripcion = event.results;

        // Reinicia el temporizador después de recibir un resultado
        intervaloSilencio = setTimeout(detenerEscucha, TIEMPO_SILENCIO * 1000);
    
        /*conversacion.push({"role": "user", "content": transcript});
        conversarAsistente();*/
    };
    recognition.onerror = (event) => {
        if(ASISTENTE2D){
            cambiaAnimacionAsistente("estatica");
        }else{
            cambiaAnimacionAsistente("hablar-asistente");
        }
        Swal.fire("Error al reconocer la voz", "Error: "+event.error, "error");
        estadoAsistente = "esperando";
    };

    utterance = new SpeechSynthesisUtterance(); // Reproducira voz en base a texto
    synth = window.speechSynthesis;

    gestionarErrorVoz();



    //Seteo de voces segun el genero del asistente y ruta visitada
    if(location.pathname=='/asistente' || location.pathname=='/~dev/asistente'){
        preferencias = ['1']; //Solo mostrara sintomas
        utterance.lang = 'es-ES' || 'es-MX' || 'es-US' || 'en-US';
        mostrarAdvertencia();
    }else{
        let generoAsistente = urlParams.get('genero');

        if(generoAsistente == 'no'){
            utterance.lang = 'es-ES' || 'es-MX' || 'es-US' || 'en-US';
        }else{
            if(navigator.platform){
                if(/Linux|iPhone|iPad/i.test(navigator.platform)){
                    location.href = location.pathname + '?genero=no';
                }else if(/Mac/i.test(navigator.platform)){
                    toggleLoading('mostrar', 'Buscando voces...');
                    synth.addEventListener("voiceschanged", setearVoces());
                }else{
                    toggleLoading('mostrar', 'Buscando voces...');
                    synth.onvoiceschanged = setearVoces;
                }
            }else{
                if(/Android|iPhone|iPad/i.test(navigator.userAgent)){
                    location.href = location.pathname + '?genero=no';
                }else if(/Macintosh/i.test(navigator.userAgent)){
                    toggleLoading('mostrar', 'Buscando voces...');
        
                    synth.addEventListener("voiceschanged", setearVoces());
                }else{
                    toggleLoading('mostrar', 'Buscando voces...');
        
                    synth.onvoiceschanged = setearVoces;
                }
            }
        }
    }
});

function mostrarOffCanvas(){
    const offcanvasElement = document.getElementById('responsiveContainer');
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement) || new bootstrap.Offcanvas(offcanvasElement);

    // Ocultar el offcanvas
    offcanvasInstance.show();
}

function ocultarOffCanvas(){
    const offcanvasElement = document.getElementById('responsiveContainer');
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement) || new bootstrap.Offcanvas(offcanvasElement);

    // Ocultar el offcanvas
    offcanvasInstance.hide();
}

function setearVoces(){
    let generoAsistente = urlParams.get('genero');
    toggleLoading('ocultar');
    
    if(generoAsistente == 'no') generoAsistente = 'masculino';

    voces = window.speechSynthesis.getVoices();
    utterance.voice = voces.find(voz => voz.voiceURI === localStorage.getItem(`voz_${generoAsistente}`));
    utterance.rate = (generoAsistente == 'femenino' && utterance.voice.voiceURI.includes('Google')) ? 1.2 : 1;
    console.log(localStorage.getItem(`voz_${generoAsistente}`));
}

function mostrarAdvertencia(){
    if(comprobarNavegador('chrome')){
        $('#alerta_personalizada').addClass('ap_abierto');
        setTimeout(() => {
            if($('#alerta_personalizada').hasClass('ap_abierto')){
                $('#alerta_personalizada').removeClass('ap_abierto');
            }
        }, 5000);
    }
}

function cambiaAnimacionAsistente(animacion){
    if(location.pathname=='/asistente' || location.pathname=='/~dev/asistente' || urlParams.get('genero') == 'no'){
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
    }else{
        let clasesAnim = [
            "inicializar-asistente",
            "cargando-asistente",
            "hablar-asistente",
            "detener-asistente",
            "reproduciendo-asistente"
        ];
    
        for(let ca of clasesAnim){
            if($('#inner-wave').hasClass(ca)){
                $('#inner-wave').removeClass(ca);
            }
        }
    
        $('#inner-wave').removeAttr('disabled');
    
        switch(animacion){
            case 'inicializar-asistente':
            {
                $('#inner-wave').addClass(animacion);
                $('#icon_control').html('<i class="fa-solid fa-play"></i>');
                $('#icon_control').attr('title', 'Iniciar Asistente');
            }
            break;
            case 'cargando-asistente':
            {
                $('#inner-wave').addClass(animacion);
                $('#icon_control').html('<i class="fa-solid fa-circle-notch"></i>');
                $('#icon_control').attr('title', 'Procesando...');
                $('#inner-wave').attr('disabled', true);
            }
            break;
            case 'hablar-asistente':
            {
                $('#inner-wave').addClass(animacion);
                $('#icon_control').html('<i class="fa-solid fa-microphone"></i>');
                $('#icon_control').attr('title', 'Hablar');
            }
            break;
            case 'detener-asistente':
            {
                $('#inner-wave').addClass(animacion);
                $('#icon_control').html('<i class="fa-solid fa-microphone"></i>');
                $('#icon_control').attr('title', 'Dejar de hablar');
            }
            break;
            case 'reproduciendo-asistente':
            {
                $('#inner-wave').addClass(animacion);
                $('#icon_control').html('<i class="fa-solid fa-volume-high"></i>');
                $('#icon_control').attr('title', 'Asistente hablando...');
                $('#inner-wave').attr('disabled', true);
            }
            break;
        }
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
    mostrarAdvertencia();
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
    if(synth.speaking){
        cola_repro.push(texto);
    }else{
        gestionarErrorVoz();
    
        const speechChunks = makeCunksOfText(texto);
        let indice = 0;
    
        if(!$('#inner-wave').hasClass('iw-enabled')){
            $('#inner-wave').addClass('iw-enabled');
        }
    
        utterance.onstart = function(){
            clearTimeout(intervalo);
            if(indice == 1){
                if(!mostrandoResultados){
                    ocultarOffCanvas();
                }
                if(ASISTENTE2D){
                    cambiaAnimacionAsistente("iw-speaking");
                }else{
                    cambiaAnimacionAsistente("reproduciendo-asistente");
                }
                estadoAsistente = "detenido";
                
                let textType = document.getElementById('typeContenido');
                let iTextChar = 0;

                textType.textContent = "";
                idInt = setInterval(() => {
                    if (iTextChar < texto.length) {
                        textType.textContent += texto.charAt(iTextChar);
                        iTextChar++;
                    }else{
                        clearInterval(idInt);
                    }
                }, 55); // Cambia el tiempo de espera según la velocidad deseada
            }
        }
    
        // Manejar el evento 'end' para liberar el speaking
        utterance.onend = function() {
            //clearTimeout(intervalo);
            if(indice < speechChunks.length){
                console.log("La reproducción del texto ha terminado.");
                indice = voz(speechChunks[indice], indice);
            }else{
                if(cola_repro.length > 0){
                    let nuevoMsg = cola_repro.shift();
                    hablar(nuevoMsg);
                }else{
                    gestionarErrorVoz();
                    console.log("El texto ha terminado de reproducirse.");
                    if(ASISTENTE2D){
                        cambiaAnimacionAsistente("estatica");
                    }else{
                        cambiaAnimacionAsistente("hablar-asistente");
                    }
                    estadoAsistente = "esperando";
                    
                    if(asistenteFinalizo){
                        $('#inner-wave').removeClass('iw-enabled');
                        guardarFormulario();
                        estadoAsistente = "detenido";
                    }
                }
            }
        };
    
        // Capturar errores de síntesis de voz
        utterance.onerror = function(event) {
            //Intentar ponerle la cola de reproduccion aqui tambien
            console.error('Error durante la síntesis de voz:', event.error);
            clearTimeout(intervalo);
    
            let err_ind = (indice <= 0) ? 0 : indice -1;
            indice = voz(speechChunks[err_ind], err_ind);
        };
    
        // Eventos adicionales para medir el estado de la sintesis de voz
        utterance.onpause = (vBoundary) => {
            console.log("Boundary event: " + vBoundary);
        };
    
        utterance.onboundary = (vPause) => {
            console.log("Pause event: " + vPause);
        };
        
        utterance.onresume = (vResume) => {
            console.log("Resume event: " + vResume);
        };
        utterance.onmark = (vMark) => {
            console.log("Mark event: " + vMark);
        };
    
        indice = voz(speechChunks[indice], indice);
    }
}

function voz(texto, indice){
    intervalo = setTimeout(() => {
        synth.cancel();
    }, TIEMPO_CORTE * 1000);

    utterance.text = texto;
    synth.speak(utterance);

    return indice + 1;
}

function makeCunksOfText(text) {
    const maxLength = 200; // entre 190 y 220
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

        }
        if(respuesta['respuesta_msg']){
            let rMensaje = limpiarMensaje(respuesta['respuesta_msg'])
            hablar(rMensaje);
            conversacion.push({"role": "assistant", "content": rMensaje});
        }
    });
}

//Aqui se iran agregando otros tipos de formateo para darle mas naturalidad al hablar el asistente
function limpiarMensaje(mensaje){
    let sinasteriscos = mensaje.replaceAll('*', ''); //Quita los doble asterisco del texto
    return sinasteriscos; //retorna el texto limpio
}

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
    if(ASISTENTE2D){
        cambiaAnimacionAsistente("iw-loading");
    }else{
        cambiaAnimacionAsistente("cargando-asistente");
    }
    let cedula = document.getElementById('cedula').value;
    let fecha = document.getElementById('fecha_atencion').value;

    const formData = new FormData();
    formData.append('cedula', cedula);
    formData.append('codfuncs', preferencias);
    formData.append('fecha', fecha);
    toggleLoading('mostrar', 'Cargando datos del paciente...');
    $('#btn-buscar').attr('disabled', true);
    fetch('/paciente', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
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
            $('#btn-buscar').removeAttr('disabled');
            Swal.fire('Error', 'No hay pacientes con ese número de cedula', 'error');
        }
    })
    .catch(err => {
        $('#btn-buscar').removeAttr('disabled');
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
        $('#btn-buscar').removeAttr('disabled'); //revisar
        conversarAsistente();
    })
    .catch(err => {
        $('#btn-buscar').removeAttr('disabled');
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
    mostrandoResultados = true;
    mostrarOffCanvas();
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
        for(let sfilt of sFiltrados){
            if(!fArgumentos['sfromgenero'].includes(sfilt)){
                sintomasFinales.push(sfilt);
            }
        }
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
        if(preferencias.length == 1 && preferencias.includes('1')){
            return JSON.stringify({success: true});
        }else{
            return "En base a estos sintomas devuelve diagnosticos.";
        }
    }
}

function getSintomasxGenero(sintomas){
    console.log(sintomas);
    return JSON.stringify({success: true});
}

function getDiagnostico(respuesta){
    mostrandoResultados = true;
    mostrarOffCanvas();
    let diagnostico = respuesta['funcion_args']['diagnosticos'].join(', ');
    $('#diagnostico').val(diagnostico);
    $('#diagnostico').removeAttr('disabled');
    document.querySelector("#diagnostico").scrollIntoView({ behavior: 'smooth' });
    return "En base a los sintomas y al diagnostico, devuelve tratamientos.";
}

function getTratamiento(respuesta){
    mostrandoResultados = true;
    mostrarOffCanvas();
    let tratamiento = respuesta['funcion_args']['tratamiento'];
    tratamientos.push(tratamiento);
    $('#tratamiento').val(tratamientos.join('. '));
    $('#tratamiento').removeAttr('disabled');
    document.querySelector("#tratamiento").scrollIntoView({ behavior: 'smooth' });
    return JSON.stringify({success: true});
}

function finalizarAsistente(respuesta){
    let fArgumentos = respuesta['funcion_args'];
    console.log(fArgumentos);

    return "Informale al paciente que puede guardar el formulario solicitandotelo a ti o si lo desea tambien puede hacerlo dando click en el botón.";
}

async function guardarxAsistente(respuesta){
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

function gestionarErrorVoz(){
    if (synth.speaking || synth.pending) {
        console.log("El sistema sigue hablando, se procede a cancelarlo.");
        synth.cancel();
    }
}