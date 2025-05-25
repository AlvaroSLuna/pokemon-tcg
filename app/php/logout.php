<?php
session_start();
session_unset();
session_destroy();
header("Location: ../../app/html/index.html");
exit;
?>