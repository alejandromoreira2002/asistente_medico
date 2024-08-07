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
        sql = f"SELECT Cedula, Sintomas, Fecha FROM Sintomas_Historial WHERE Cedula = '{cedula}' ORDER BY ID DESC"
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

        if resultado['res'] == 1:
            resultado['msg'] = 'Se guardó correctamente la sintomatología'
        else:
            resultado['msg'] = 'Hubo un problema al guardar la sintomatología'
            
        #print(resultado)
        return resultado
    
    def grabarDiagnostico(self, formulario):
        sql = "INSERT INTO diagnosticos_historial(Cedula, Diagnostico, Fecha) VALUES(%s, %s, %s)"
        parametros = (
            formulario['cedula'],
            formulario['diagnostico'],
            formulario['fechaAtencion'],
        )
        resultado = self.db.insertarDatos(sql, parametros, 1)

        if resultado['res'] == 1:
            resultado['msg'] = 'Se guardó correctamente el diagnostico'
        else:
            resultado['msg'] = 'Hubo un problema al guardar el diagnostico'
            
        #print(resultado)
        return resultado
    
    def grabarTratamiento(self, formulario):
        sql = "INSERT INTO tratamientos_historial(Cedula, Tratamientos, Fecha) VALUES(%s, %s, %s)"
        parametros = (
            formulario['cedula'],
            formulario['tratamiento'],
            formulario['fechaAtencion'],
        )

        resultado = self.db.insertarDatos(sql, parametros, 1)

        if resultado['res'] == 1:
            resultado['msg'] = 'Se guardó correctamente el tratamiento'
        else:
            resultado['msg'] = 'Hubo un problema al guardar el tratamiento'

        #print(resultado)
        return resultado
    
    def grabarFormulario(self, formulario):
        #print(formulario)
        sql = "INSERT INTO Formulario(ID_Paciente, CodFormulario, Fecha_Ate, Peso, Estatura, Presion_Sistolica, Presion_Distolica, Frecuencia_Cardiaca, Temperatura, ID_Sintomas, cod_chat, ID_Diagnostico, ID_Tratamiento) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
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
            formulario['cod_chat'],
            formulario['idDiagnostico'],
            formulario['idTratamiento']
        )
        resultado = self.db.insertarDatos(sql, parametros)
        return resultado
        