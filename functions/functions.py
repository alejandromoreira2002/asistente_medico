import random
import string
#import bcrypt

"""
def encriptar(texto):
    salt = b'$2b$12$lH47ukSwcXcOSywg7ENz3u'
    hashed = bcrypt.hashpw(texto, salt)
    return hashed
"""
def generarCodigoAleatorio(longitud):
    letras = string.ascii_letters  # Contiene letras mayúsculas y minúsculas
    return ''.join(random.choice(letras) for _ in range(longitud))

def readConfigDB(route):
    lines = {}
    with open(route, 'r') as file:
        # Itera sobre cada línea del archivo
        for line in file:
            l = line.strip().split('=')
            if l[0] == 'port':
                lines[l[0]] = int(l[1])
            else:
                lines[l[0]] = l[1]
    return lines

def getKeyAsistente(ruta):
    f = open(ruta, 'r')
    return f.read()

#lines = readConfigFile('../db/dbconfig.txt')
#print(lines)