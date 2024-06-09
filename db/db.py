import mysql.connector
from functions.functions import readConfigDB

class db():
    def __init__(self):
        mydb = readConfigDB('db/dbconfig.txt')
        config = {
            'user': mydb['user'],
            'password': mydb['password'],
            'host': mydb['host'],
            'port': mydb['port'],
            'database': mydb['db']
        }
        self.mysql = mysql.connector.connect(**config)
        #self.mysql = MySQL()
        #self.mysql.init_app(app)
    
    def consultarDato(self, sql):
        #cursor = self.mysql.get_db().cursor()
        cursor = self.mysql.cursor(dictionary=True)

        cursor.execute(sql)
        data = cursor.fetchone()
        if(data != None and len(data) > 0):
            return data
        else:
            return None

    def consultarDatos(self, sql):
        #cursor = self.mysql.get_db().cursor()
        cursor = self.mysql.cursor(dictionary=True)

        cursor.execute(sql)
        data = cursor.fetchall()
        if(len(data) > 0):
            return data
        else:
            return None
    
    def insertarDatos(self, sql, data):
        cursor = self.mysql.get_db().cursor()
        op = cursor.execute(sql, data)
        self.mysql.get_db().commit()
        cursor.close()
        if(op):
            return 1
        else:
            return 0