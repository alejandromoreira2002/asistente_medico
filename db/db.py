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
    
    def insertarDatos(self, sql, data):
        cursor = self.mysql.cursor()
        op = cursor.execute(sql, data)
        self.mysql.commit()
        cursor.close()
        if(op):
            return 1
        else:
            return 0