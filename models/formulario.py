from db.db import db

class FormularioModelo():
    def __init__(self):
        self.db = db()
    
    def getCodigo(self):
        procedimiento = 'sp_obtener_codform'
        params = (0,)
        resultado = self.db.ejecutar_SP(procedimiento, params)
        return resultado[0]
    
    def consultarSintomas(self, cedula):
        sql = f"SELECT Cedula, Sintomas, Fecha FROM Sintomas_Historial WHERE Cedula = '{cedula}' ORDER BY Fecha DESC"
        datos = self.db.consultarDatos(sql)
        return datos
    
    def grabarSintomas(self, formulario):
        sql = "INSERT INTO Sintomas_Historial(Cedula, Sintomas, Fecha) VALUES(%s, %s, %s)"
        parametros = (
            formulario['cedula'],
            formulario['sintomas'],
            formulario['fechaAtencion'],
        )
        resultado = self.db.insertarDatos(sql, parametros, 1)
        print(resultado)
        return resultado
    
    def grabarFormulario(self, formulario):
        sql = "INSERT INTO Formulario(ID_Paciente, CodFormulario, Fecha_Ate, Peso, Estatura, Presion_Sistolica, Presion_Distolica, Frecuencia_Cardiaca, Temperatura, ID_Sintomas, cod_chat) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        parametros = (
            formulario['idPaciente'],
            formulario['codFormulario'],
            formulario['fechaAtencion'],
            formulario['peso'],
            formulario['estatura'],
            formulario['presionSistolica'],
            formulario['presionDistolica'],
            formulario['frecuenciaCardiaca'],
            formulario['temperatura'],
            formulario['idSintomas'],
            formulario['cod_chat']
        )
        resultado = self.db.insertarDatos(sql, parametros)
        return resultado
        