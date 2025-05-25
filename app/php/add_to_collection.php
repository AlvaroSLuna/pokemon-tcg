<?php
session_start();
header('Content-Type: application/json');
require '../../app/php/connection.php';

if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['card_id']) || !isset($data['card_name'])) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

$user_id = $_SESSION['id'];
$card_id = $data['card_id'];
$card_name = $data['card_name'];

// Guarda la carta en la tabla collection si no existe
$stmt = $pdo->prepare("INSERT IGNORE INTO collection (id_card, name_card) VALUES (:id_card, :name_card)");
$stmt->execute(['id_card' => $card_id, 'name_card' => $card_name]);

// Intenta insertar en user_collection
$stmt2 = $pdo->prepare("INSERT IGNORE INTO user_collection (id_user, id_card) VALUES (:id_user, :id_card)");
$stmt2->execute(['id_user' => $user_id, 'id_card' => $card_id]);

// Verifica si realmente se insertó (rowCount será 0 si ya existía)
if ($stmt2->rowCount() === 0) {
    echo json_encode(['success' => false, 'error' => 'La carta ya estaba agregada a la colección']);
    exit;
}

echo json_encode(['success' => true]);
?>