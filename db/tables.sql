CREATE DATABASE asistente_medico;

USE asistente_medico;

CREATE TABLE Pacientes(
id INT AUTO_INCREMENT PRIMARY KEY,
cedula VARCHAR(10) UNIQUE,
nombres VARCHAR(25),
apellidos VARCHAR(25),
f_nacimiento DATE,
edad INT,
telefono VARCHAR(10),
correo VARCHAR(30),
ciudad VARCHAR(20),
direccion VARCHAR(50)
);

INSERT INTO pacientes(cedula,nombres,apellidos,f_nacimiento,edad,telefono,correo,ciudad,direccion)
VALUES('1316307618','Teddy Alejandro', 'Moreira Vélez', '2002-01-24', 22, '0997679158', 'tmoreira7618@utm.edu.ec','Portoviejo','Villas 15 de Abril');