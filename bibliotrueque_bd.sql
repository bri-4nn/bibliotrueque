CREATE DATABASE IF NOT EXISTS bibliotrueque;

USE bibliotrueque;

-- Tabla: usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- Cambiado a INT
    email VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    carrera VARCHAR(100) NOT NULL,
    semestre INT NOT NULL CHECK (semestre BETWEEN 1 AND 12),
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('alumno', 'maestro') NOT NULL DEFAULT 'alumno',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Validación del dominio del correo institucional
    CONSTRAINT chk_email_domain CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@(alumno\\.ipn\\.mx|ipn\\.mx)$'),
    -- El nombre no puede estar vacío y solo letras/espacios
    CONSTRAINT chk_nombre_letras CHECK (nombre REGEXP '^[A-Za-záéíóúñÑ ]+$')
);

-- Tabla: puntos_entrega
CREATE TABLE puntos_entrega (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    ubicacion_referencia VARCHAR(255)
);


-- Tabla: referencias_libros (metadatos por ISBN)
CREATE TABLE referencias_libros (
    isbn VARCHAR(13) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    editorial VARCHAR(255),
    edicion VARCHAR(50),
    CONSTRAINT chk_isbn_digitos CHECK (isbn REGEXP '^[0-9]{13}$')
);


-- Tabla: libros (ejemplares publicados por usuarios)
CREATE TABLE libros (
    id INT PRIMARY KEY AUTO_INCREMENT,
    isbn VARCHAR(13) NOT NULL,
    condicion ENUM('Nuevo', 'Usado como nuevo', 'Subrayado/Anotado', 'Desgastado') NOT NULL,
    precio_ofertado DECIMAL(10,2) NULL,
    tipo_transaccion ENUM('venta', 'trueque') NOT NULL,
    id_vendedor INT NOT NULL,
    estado_pub ENUM('disponible', 'reservado', 'vendido', 'intercambiado') DEFAULT 'disponible',
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    materia VARCHAR(100) NOT NULL,
    carrera VARCHAR(100) NOT NULL,
    semestre INT NOT NULL CHECK (semestre BETWEEN 1 AND 12),
    FOREIGN KEY (isbn) REFERENCES referencias_libros(isbn),
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id),
    CONSTRAINT chk_precio_segun_tipo CHECK (
        (tipo_transaccion = 'venta' AND precio_ofertado IS NOT NULL AND precio_ofertado > 0) OR
        (tipo_transaccion = 'trueque' AND precio_ofertado IS NULL)
    )
);

-- Tabla: carrito
CREATE TABLE carrito (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_libro INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_libro) REFERENCES libros(id),
    UNIQUE KEY uk_usuario_libro (id_usuario, id_libro)
);

-- Tabla: transacciones
CREATE TABLE transacciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario_ofertante INT NOT NULL,
    id_usuario_contraparte INT NOT NULL,
    id_libro_ofertado INT NULL,
    id_libro_solicitado INT NULL,
    tipo ENUM('venta', 'trueque') NOT NULL,
    monto DECIMAL(10,2) NULL,
    punto_encuentro_id INT NOT NULL,
    estado ENUM('pendiente', 'completado', 'cancelado') DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_ofertante) REFERENCES usuarios(id),
    FOREIGN KEY (id_usuario_contraparte) REFERENCES usuarios(id),
    FOREIGN KEY (id_libro_ofertado) REFERENCES libros(id),
    FOREIGN KEY (id_libro_solicitado) REFERENCES libros(id),
    FOREIGN KEY (punto_encuentro_id) REFERENCES puntos_entrega(id),
    CONSTRAINT chk_transaccion_tipo CHECK (
        (tipo = 'venta' AND id_libro_ofertado IS NOT NULL AND id_libro_solicitado IS NULL AND monto IS NOT NULL) OR
        (tipo = 'trueque' AND id_libro_ofertado IS NOT NULL AND id_libro_solicitado IS NOT NULL AND monto IS NULL)
    ),
    CONSTRAINT chk_libros_distintos CHECK (id_libro_ofertado <> id_libro_solicitado OR (id_libro_ofertado IS NULL AND id_libro_solicitado IS NULL))
);

-- Índices para rendimiento
CREATE INDEX idx_libros_vendedor ON libros(id_vendedor);
CREATE INDEX idx_libros_carrera ON libros(carrera);
CREATE INDEX idx_libros_materia ON libros(materia);
CREATE INDEX idx_libros_semestre ON libros(semestre);
CREATE INDEX idx_transacciones_ofertante ON transacciones(id_usuario_ofertante);
CREATE INDEX idx_transacciones_contraparte ON transacciones(id_usuario_contraparte);
CREATE INDEX idx_transacciones_estado ON transacciones(estado);
CREATE INDEX idx_carrito_usuario ON carrito(id_usuario);