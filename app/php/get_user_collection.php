<?php
session_start();
require '../../app/php/connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'cards' => []]);
    exit;
}

$user_id = $_SESSION['id'];
$stmt = $pdo->prepare("SELECT id_card FROM user_collection WHERE id_user = :user_id");
$stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
$stmt->execute();
$cards = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode(['success' => true, 'cards' => $cards]);
?>