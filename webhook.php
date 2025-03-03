<?php
// Nhận dữ liệu từ Tonconsole
$data = file_get_contents("php://input");
$decodedData = json_decode($data, true);

// Ghi log để kiểm tra
file_put_contents("log.txt", print_r($decodedData, true), FILE_APPEND);

// Xử lý dữ liệu
if (isset($decodedData['event']) && $decodedData['event'] === 'transaction') {
    $txHash = $decodedData['tx_hash'];
    $amount = $decodedData['amount'];
    $wallet = $decodedData['wallet'];

    // Ví dụ: gửi thông báo hoặc cập nhật database
    file_put_contents("log.txt", "Giao dịch mới: $amount TON vào ví $wallet\n", FILE_APPEND);
}

// Phản hồi lại Tonconsole
http_response_code(200);
echo json_encode(["status" => "success"]);
?>
