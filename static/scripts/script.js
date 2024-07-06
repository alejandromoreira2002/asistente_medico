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

const btnStop = $('#stop-recording');
const btnStart = $('#start-recording');
const infoAdicional = $('#result');
var asistenteFinalizo = false;

btnStop.hide();
$('#fecha_atencion').val(formatearFecha(new Date()));

var conversacion = []; // Guardara el historial de conversacion
const recognition = new webkitSpeechRecognition(); // Convertira la voz en texto y viceversa
recognition.lang = 'es-ES';
recognition.continuous = false;
recognition.interimResults = false;

const utterance = new SpeechSynthesisUtterance(); // Reproducira voz en base a texto
utterance.lang = 'es-ES';

// Funcion que permite reproducir voz en base al texto
async function hablar(texto) {
    const speechChunks = makeCunksOfText(texto); //Fragmenta el texto y reproduce en cola. Evita la saturación de SpeechSynthesis
    console.log(speechChunks);
    for (let i = 0; i < speechChunks.length; i++) {
        await new Promise((resolve, reject) => {
            window.speechSynthesis.cancel();
            utterance.text = speechChunks[i];
            window.speechSynthesis.speak(utterance);
            utterance.onend = () => {
                if (speechChunks.length - 1 == i) {
                    btnStop.hide();
                    btnStart.show();
                    if(btnStart.attr('disabled') != undefined && asistenteFinalizo == false){
                        btnStop.removeAttr('disabled');
                        btnStart.removeAttr('disabled');
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
function iniciarEscucha(){
    recognition.start();
    btnStart.hide();
    btnStop.show();
    infoAdicional.text('Escuchando...');
}

function detenerEscucha(){
    recognition.stop();
    btnStop.hide();
    btnStart.show();
    infoAdicional.text('');
}

// hace posible la conversacion con el asistente
function conversarAsistente(){
    const formData = new FormData();
    formData.append('mensaje', JSON.stringify(conversacion));
    fetch('/conversar', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(respuesta => {
        conversacion = [];
        /*let esJSON = true;
        let contenido = "";
        let texto = "";
        try{
            contenido = JSON.parse(respuesta['mensaje']);
        }catch (e){
            console.log(e);
            esJSON = false;
            texto = respuesta['mensaje'];
        }
        
        if(esJSON){
            texto = contenido['mensaje'];
            if(contenido['sintomas'] && contenido['sintomas'].length > 0){
                let sintomas = typeof(contenido['sintomas']) == 'object' ? contenido['sintomas'].join(', ') : contenido['sintomas'];
                $('#sintomatologia').val(sintomas)
                $('#sintomatologia').removeAttr('disabled');
                document.querySelector("#sintomatologia").scrollIntoView({ behavior: 'smooth' });
            }
            if(contenido['comando'] && contenido['comando'] == "finalizar"){
                btnStop.attr('disabled', 'true');
                btnStart.attr('disabled', 'true');
                asistenteFinalizo = true;
            }
            console.log(contenido);
        }
        console.log(texto);
        hablar(texto);*/
        if(respuesta['asis_funciones']){
            let handleAFunciones = {
                'get_sintomas': getSintomas,
                'finalizar': finalizarAsistente
            }
            for(let afuncion of respuesta['asis_funciones']){
                //afuncion['funcion']
                afuncion['funcion_args'] = JSON.parse(afuncion['funcion_args']);
                console.log(afuncion);
                const activarFuncion = handleAFunciones[afuncion['funcion_name']];
                activarFuncion(afuncion);
            }
        }else if(respuesta['respuesta_msg']){
            hablar(respuesta['respuesta_msg']);
            conversacion.push({"role": "assistant", "content": respuesta['respuesta_msg']});
        }
        
        /*$('#sintomatologia').val(data['sintomas']);
        $('#sintomatologia').removeAttr('disabled');*/
    });
}

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    infoAdicional.text('');

    if(transcript.includes("detener asistente")){
        recognition.stop();
        conversacion = [];
        btnStart.attr('disabled', 'true');
        btnStop.attr('disabled', 'true');
        /*fetch('/detenerAsistente', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            if(data['code'] == 1){
                console.log("correcto")
            }else{
                console.log("incorrecto")
            }
        });*/
    }else{
        conversacion.push({"role": "user", "content": transcript});
        conversarAsistente();
    }

    /*const formData = new FormData();
    formData.append('corpus', transcript)
    fetch('/sintomas', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        let texto = `Los síntomas que has mencionado son los siguientes: ${data['sintomas']}. ¿Es correcto?`
        hablar(texto);
        $('#sintomatologia').val(data['sintomas'])
        $('#sintomatologia').removeAttr('disabled');
    });*/
};

recognition.onerror = (event) => {
    infoAdicional.text(`Error: ${event.error}`);
    recognition.stop();
    btnStop.hide();
    btnStart.show();
};

recognition.onend = () => {
    //recognition.start();
    btnStop.hide();
    btnStart.show();
    btnStart.attr("disabled", "true");
    btnStop.attr("disabled", "true");
};

//Buscar paciente por numero de cedula
function buscarPaciente() {
    let cedula = document.getElementById('cedula').value;

    const formData = new FormData();
    formData.append('cedula', cedula)
    fetch('/paciente', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
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

            //let txtBienvenida = `Dale una bienvenida al usuario que vas a atender, él se llama ${paciente['nombres']}, y tiene una edad de ${$("#edad").val()} años.`;
            /*let txtBienvenida = `El paciente que atenderas se llama ${paciente['nombres']}, y tiene ${$("#edad").val()} años de edad. Dale una bienvenida y ayudalo a detectar sus sintomas.`;
            conversacion.push({"role": "user", "content": txtBienvenida});
            console.log(conversacion);*/
            //conversarAsistente();
        }else{
            Swal.fire('Error', 'No hay pacientes con ese número de cedula', 'error');
        }
    });
}

function cargarHistorialSintomas(cedula, nombres){
    const formData = new FormData();
    formData.append('cedula', cedula)
    fetch('/sintomas', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        $('#tblHistorialSintomas tbody').empty();
        let txtBienvenida = `El paciente que atenderas se llama ${nombres}, y tiene ${$("#edad").val()} años de edad. `;
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
            //let txtBienvenida = `El paciente que atenderas se llama ${paciente['nombres']}, y tiene ${$("#edad").val()} años de edad. Dale una bienvenida y ayudalo a detectar sus sintomas.`;
        }else{
            txtBienvenida = txtBienvenida + `Es la primera vez que este paciente llega atenderse a la clinica, por lo que no ha tenido registros de sintomas anteriormente. Dale una bienvenida, y ayudalo.`;
        }
        conversacion.push({"role": "user", "content": txtBienvenida});
        console.log(conversacion);
        conversarAsistente();
    })
    .catch(err => Swal.fire('Error', `No se pudo realizar la solicitud. Error: ${err}`, 'error'));
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

function getSintomas(sintomas){
    let fArgumentos = sintomas['funcion_args'];
    console.log(fArgumentos);
    enviarRespuestaAFuncion(sintomas['funcion_id'],sintomas['funcion_name']);

    let txtSintomas = fArgumentos['sintomas'].join(', ');
    $('#sintomatologia').val(txtSintomas);
    $('#sintomatologia').removeAttr('disabled');
    document.querySelector("#sintomatologia").scrollIntoView({ behavior: 'smooth' });
}

function finalizarAsistente(respuesta){
    let fArgumentos = respuesta['funcion_args'];
    console.log(fArgumentos);
    enviarRespuestaAFuncion(respuesta['funcion_id'],respuesta['funcion_name']);

    asistenteFinalizo = true;
}

function enviarRespuestaAFuncion(id, name){
    let respuestaF = {
        "role": "function",
        "name": name,
        "content": JSON.stringify({success: true}),
    };
    conversacion.push(respuestaF);
    conversarAsistente();
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
    formData.append('sintomas', $('#sintomatologia').val());
    
    fetch('/form/guardar', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if(data.res == 1){
            Swal.fire("Guardado exitoso", data.contenido, "success");
        }else{
            Swal.fire("Error al guardar", data.contenido, "error");
        }
    })
    .catch(err => {
        Swal.fire("Ocurrió un error al enviar los datos", `Error: ${err}`, "error")
    })
}