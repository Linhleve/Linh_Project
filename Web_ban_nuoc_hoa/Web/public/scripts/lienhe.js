function submitlh () {
    const hoVaTen = document.getElementById('hoVaTen').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const ghiChu = document.getElementById('ghiChu').value.trim();

    if (!hoVaTen || !phone || !email || !ghiChu) {
        showAlert("Hãy nhập thông tin mà bạn cần hỗ trợ");
    } else {
        showAlert("Thông tin đã được gửi, sẽ có nhân viên trợ giúp bạn ngay");
    }
}

function showAlert(message) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 1000;

    const popup = document.createElement('div');
    popup.style.background = '#fff';
    popup.style.padding = '30px';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '80%';

    const messageText = document.createElement('p');
    messageText.innerText = message;
    messageText.style.marginBottom = '20px';
    messageText.style.fontSize = '18px';
    messageText.style.color = '#0d3b66';

    const okButton = document.createElement('button');
    okButton.innerText = 'OK';
    okButton.style.padding = '10px 24px';
    okButton.style.background = '#0d3b66';
    okButton.style.color = '#fff';
    okButton.style.border = 'none';
    okButton.style.borderRadius = '8px';
    okButton.style.cursor = 'pointer';
    okButton.style.fontSize = '16px';

    okButton.onclick = function () {
        document.body.removeChild(overlay);
    };

    popup.appendChild(messageText);
    popup.appendChild(okButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}
