$('#stop-recording').hide();
$('#fecha_atencion').val(formatearFecha(new Date()));
document.getElementById('btn-buscar').addEventListener('click', () => {
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
            $('#stop-recording').removeAttr('disabled');
            $('#start-recording').removeAttr('disabled');

            $('#peso').removeAttr('disabled');
            $('#talla').removeAttr('disabled');
            $('#p-sistolica').removeAttr('disabled');
            $('#p-distolica').removeAttr('disabled');
            $('#frecuencia-card').removeAttr('disabled');
            $('#temperatura').removeAttr('disabled');

            let txtBienvenida = `Bienvenido ${paciente['nombres']}. El día de hoy seré tu asistente médico. Por favor, indicame cuáles son tus síntomas.`;
            hablar(txtBienvenida);
        }else{
            Swal.fire('Error', 'No hay pacientes con ese número de cedula', 'error');
        }
    });
})

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

function formatearFecha(date){
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11
    let day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function hablar(texto) {
    let utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
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

// Verificar compatibilidad del navegador
if (!('webkitSpeechRecognition' in window)) {
    alert("Lo siento, tu navegador no soporta la Web Speech API.");
} else {
    // Crear una instancia de SpeechRecognition
    const recognition = new webkitSpeechRecognition();

    // Configuración para el idioma español
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    const resultElement = document.getElementById('result');

    document.getElementById('start-recording').addEventListener('click', () => {
        recognition.start();
        $('#start-recording').hide();
        $('#stop-recording').show();
        //let nStopButton = $('<button id="stop-recording" class="detener-conversacion"><i class="fa-solid fa-stop"></i></button>')
        //$('#controles').insertBefore(nStopButton, $('#result'));
        //startButton.disabled = true;
        //stopButton.disabled = false;
        $('#result').text('Escuchando...');
    });

    document.getElementById('stop-recording').addEventListener('click', () => {
        recognition.stop();
        //startButton.disabled = false;
        //stopButton.disabled = true;
        $('#stop-recording').hide();
        $('#start-recording').show();
        //let nStartButton = $('<button id="start-recording" class="iniciar-conversacion"><i class="fa-solid fa-play"></i></button>')
        //$('#controles').insertBefore(nStartButton, $('#result'));
        $('#result').text('');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        //resultElement.textContent = `Texto reconocido: ${transcript}`;
        //let nStartButton = $('<button id="start-recording" class="iniciar-conversacion"><i class="fa-solid fa-play"></i></button>')
        //$('#controles').insertBefore(nStartButton, $('#result'));
        $('#result').text('');

        const formData = new FormData();
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
        });
    };

    recognition.onerror = (event) => {
        resultElement.textContent = `Error: ${event.error}`;
        $('#stop-recording').hide();
        $('#start-recording').show();
    };

    recognition.onend = () => {
        $('#stop-recording').hide();
        $('#start-recording').show();
    };
}