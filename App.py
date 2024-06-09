from flask import Flask, render_template, url_for, redirect, request, session, jsonify
from controllers.pacientes import PacientesControlador
from controllers.asistente import AsistenteControlador

app = Flask(__name__)

with app.test_request_context():
    url_for('static', filename='/css/style.css')
    url_for('static', filename='/scripts/script.js')

@app.get('/')
def Index():
    return render_template('index.html')

@app.get('/formulario')
def getFormulario():
    return render_template('formulario.html')

@app.post('/paciente')
def getPaciente():
    cedula = request.form['cedula']
    controlador = PacientesControlador()
    return jsonify(controlador.getPaciente(cedula))

@app.post('/sintomas')
def getSintomas():
    corpus = request.form['corpus']
    controlador = AsistenteControlador()
    return jsonify(controlador.getSintomas(corpus))


if __name__ == '__main__':
    app.run(port=3000, debug=True)