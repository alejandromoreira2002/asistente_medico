import mysql.connector
import os

class db():
    def __init__(self):
        config = {
            'user': os.environ.get("MYSQL_USER"),
            'password': os.environ.get("MYSQL_PASSWORD"),
            'host': os.environ.get("MYSQL_HOST"),
            'port': int(os.environ.get("MYSQL_PORT")),
            'database': os.environ.get("MYSQL_DB")
        }
        self.mysql = mysql.connector.connect(**config)
    
    def consultarDato(self, sql):
        cursor = self.mysql.cursor(dictionary=True)

        cursor.execute(sql)
        data = cursor.fetchone()
        if(data != None and len(data) > 0):
            return data
        else:
            return None

    def consultarDatos(self, sql):
        cursor = self.mysql.cursor(dictionary=True)

        cursor.execute(sql)
        data = cursor.fetchall()
        if(len(data) > 0):
            return data
        else:
            return None
    
    def insertarDatos(self, sql, data, devolucion=0):
        cursor = self.mysql.cursor()
        cursor.execute(sql, data)
        idRow = cursor.lastrowid

        respuesta = None
        if devolucion:
            respuesta = {'res': 1 if idRow else 0, 'id': idRow}
        else:
            respuesta = 1 if idRow else 0
            
        self.mysql.commit()
        cursor.close()
        return respuesta
    
    def actualizarDatos(self, sql, data):
        cursor = self.mysql.cursor()
        cursor.execute(sql, data)
        self.mysql.commit()
        filasAct = cursor.rowcount
        
        respuesta = None
        if filasAct > 0:
            respuesta = 1
        else:
            respuesta = 0
            
        cursor.close()
        return respuesta
    
    def ejecutar_SP(self, procedimiento, params):
        cursor = self.mysql.cursor()
        resultado = cursor.callproc(procedimiento, params)
        cursor.close()
        return resultado