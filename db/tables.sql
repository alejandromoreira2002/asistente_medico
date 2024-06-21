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

CREATE TABLE usuarios(
	id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50),
    correo VARCHAR(50),
    contrasena VARCHAR(200),
    rol VARCHAR(15)
);