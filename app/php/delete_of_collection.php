<?php
session_start();
header('Content-Type: application/json');
require '../../app/php/connection.php';

if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['card_id'])) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

$user_id = $_SESSION['id'];
$card_id = $data['card_id'];

$stmt = $pdo->prepare("DELETE FROM user_collection WHERE id_user = :id_user AND id_card = :id_card");
$stmt->execute(['id_user' => $user_id, 'id_card' => $card_id]);

echo json_encode(['success' => true]);
?>