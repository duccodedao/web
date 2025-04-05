// Ví dụ kết nối ví và xử lý giao dịch mua sản phẩm

// Khai báo số dư BMC ban đầu (nếu chưa có)
let bmcBalance = Number(localStorage.getItem('bmcBalance')) || 0;

// Ví dụ hàm cập nhật số dư hiển thị
function getBMCBalance() {
  document.getElementById('bmc-balance') && 
    (document.getElementById('bmc-balance').innerText = `Số dư BMC: ${bmcBalance}`);
}

// Hàm hiển thị thông báo (Toast)
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Ví dụ sử dụng TonConnect (giữ nguyên mẫu của bạn)
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: 'https://bmasshd.click/tonconnect-manifest.json',
  buttonRootId: 'ton-connect'
});

tonConnectUI.uiOptions = {
  twaReturnUrl: 'https://t.me/bmassk3_bot/?startapp='
};

async function mintBMC(bmcAmount, tonPrice) {
  try {
    const payload = "te6ccgEBAQEAAgAAAA==";
    const txParams = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [{
        address: "UQDu8vyZSZbAYvRRQ_jW4_0EiBGibAGq72wSZjYWRmNAGhRD",
        amount: (tonPrice * 1e9).toString(),
        payload: payload
      }]
    };

    console.log("Gửi giao dịch:", txParams);
    await tonConnectUI.sendTransaction(txParams);

    bmcBalance += bmcAmount;
    localStorage.setItem('bmcBalance', bmcBalance);
    getBMCBalance();
    showToast(`Gửi thành công! Đang nhận ${bmcAmount} BMC.`);
  } catch (error) {
    console.error("Lỗi khi gửi:", error);
    showToast("Gửi thất bại! Kiểm tra lại ví.");
  }
}

// Sự kiện mua cho từng sản phẩm
document.getElementById('buy-50').addEventListener('click', () => {
  mintBMC(50, 0.5);
});
document.getElementById('buy-100').addEventListener('click', () => {
  mintBMC(100, 0.89);
});
document.getElementById('buy-200').addEventListener('click', () => {
  mintBMC(200, 1.5);
});
document.getElementById('buy-500').addEventListener('click', () => {
  mintBMC(500, 4);
});
document.getElementById('buy-1000').addEventListener('click', () => {
  mintBMC(1000, 6.9);
});
document.getElementById('buy-2000').addEventListener('click', () => {
    mintBMC(2000, 10);
  });

// Cập nhật số dư khi tải trang
document.addEventListener("DOMContentLoaded", getBMCBalance);
