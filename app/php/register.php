<?php
require '../../app/php/connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Usa hash en producción

    // Validar que el usuario no exista
    $check = $pdo->prepare("SELECT id FROM user WHERE name = :name");
    $check->bindParam(":name", $name);
    $check->execute();

    if ($check->rowCount() > 0) {
        $error = "El nombre de usuario ya existe";
    } else {
        $stmt = $pdo->prepare("INSERT INTO user (name, password) VALUES (:name, :password)");
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":password", $password); // Usa password_hash en producción
        $stmt->execute();
        $success = "Usuario registrado correctamente. Puedes iniciar sesión.";
        header("Location: ../../app/php/login.php");
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Usuario</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: rgb(201, 193, 214);
        }
        .login-container {
            background: #333;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        .login-container img {
            width: 80px;
            height: auto;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <img src="../../app/src/Pokémon_Trading_Card_Game_logo.svg.png" alt="Registro">
        <h2 class="text-center text-white mb-4">Crear Cuenta</h2>
        <?php if (isset($error)): ?>
            <div class="alert alert-danger"> <?php echo $error; ?> </div>
        <?php elseif (isset($success)): ?>
            <div class="alert alert-success"> <?php echo $success; ?> </div>
        <?php endif; ?>
        <form method="POST" action="register.php">
            <div class="mb-3">
                <label for="name" class="form-label text-white">Usuario</label>
                <input type="text" class="form-control" placeholder="Nombre de usuario" id="name" name="name" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label text-white">Contraseña</label>
                <input type="password" class="form-control" placeholder="Contraseña" id="password" name="password" required>
            </div>
            <button type="submit" class="btn btn-success w-100">Registrarse</button>
            <a href="../../app/php/login.php">
                <br><br>
                <button type="button" class="btn btn-primary w-100">Iniciar Sesión</button>
            </a>
        </form>
    </div>
</body>
</html>
