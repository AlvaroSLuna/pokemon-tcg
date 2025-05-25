<?php
session_start();
require '../../app/php/connection.php';


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario = $_POST['usuario'];
    $password = $_POST['contraseña'];

    $stmt = $pdo->prepare("SELECT * FROM user WHERE name = :usuario");
    $stmt->bindParam(":usuario", $usuario);

    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['usuario'] = $user['name'];
        $_SESSION['id'] = $user['id'];
        header("Location: ../../app/html/index.html");
        exit;
    } else {
        $error = "Usuario o contraseña incorrectos";
    }
}

?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión</title>
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
        <img src="../../app/src/Pokémon_Trading_Card_Game_logo.svg.png" alt="Login">
        <h2 class="text-center text-white mb-4">Iniciar Sesión</h2>
        <?php if (isset($error)): ?>
            <div class="alert alert-danger"> <?php echo $error; ?> </div>
        <?php endif; ?>
        <form method="POST" action="">
            <div class="mb-3">
                <label for="user" class="form-label text-white">Usuario</label>
                <input type="text" class="form-control" placeholder="Introducir usuario" id="usuario" name="usuario" required>
            </div>
            <div class="mb-3">
                <label for="contraseña" class="form-label text-white">Contraseña</label>
                <input type="password" class="form-control" placeholder="Introducir contraseña" id="contraseña" name="contraseña" required>
            </div>
            <a href="../../app/html/index.html">
                <button type="submit" class="btn btn-primary w-100">Ingresar</button>
            </a>
            <a href="../../app/php/register.php">
                <br><br>
                <button type="button" class="btn btn-primary w-100">Registrarse</button>
            </a>
        </form>
    </div>
</body>

</html>