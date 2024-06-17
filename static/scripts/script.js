const btnStop = $('#stop-recording');
const btnStart = $('#start-recording');
const infoAdicional = $('#result');

btnStop.hide();
$('#fecha_atencion').val(formatearFecha(new Date()));

var conversacion = []; // Guardara el historial de conversacion
const recognition = new webkitSpeechRecognition(); // Convertira la voz en texto y viceversa
recognition.lang = 'es-ES';
recognition.continuous = false;
recognition.interimResults = false;

const utterance = new SpeechSynthesisUtterance(); // Reproducira voz en base a texto
utterance.lang = 'es-ES';
utterance.onend = () => {
    btnStop.hide();
    btnStart.show();
    if(btnStart.attr('disabled') != undefined){
        btnStop.removeAttr('disabled');
        btnStart.removeAttr('disabled');
    }
}

// Funcion que permite reproducir voz en base al texto
function hablar(texto) {
    utterance.text = texto
    window.speechSynthesis.speak(utterance);
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
        let texto = respuesta['mensaje'];
        hablar(texto);
        conversacion.push({"role": "assistant", "content": texto});
        //$('#sintomatologia').val(data['sintomas']);
        //$('#sintomatologia').removeAttr('disabled');
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

            
            //let txtBienvenida = `Bienvenido ${paciente['nombres']}. El día de hoy seré tu asistente médico. Por favor, indicame cuáles son tus síntomas.`;
            let txtBienvenida = `Dale una bienvenida al usuario que vas a atender, él se llama ${paciente['nombres']}`;
            conversacion.push({"role": "user", "content": txtBienvenida});
            console.log(conversacion);
            conversarAsistente();
        }else{
            Swal.fire('Error', 'No hay pacientes con ese número de cedula', 'error');
        }
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