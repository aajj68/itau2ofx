<?php
header('Content-type: application/ofx');
header('Content-Disposition: attachment; filename="itau.ofx"');
echo urldecode($_GET['ofx']);
?>
