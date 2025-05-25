<?php
session_start();
header('Content-Type: application/json');
if (isset($_SESSION['id'])) {
    echo json_encode(['user_id' => $_SESSION['id']]);
} else {
    echo json_encode(['user_id' => null]);
}
?>