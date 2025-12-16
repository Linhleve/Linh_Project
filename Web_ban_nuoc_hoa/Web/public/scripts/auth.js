document.addEventListener('click', (e) => {
    if (e.target.matches('#goto-login-btn')) {
        changeURL('/dang-nhap');
    }
    if (e.target.matches('#goto-register-btn')) {
        changeURL('/dang-ky');
    }
});

document.addEventListener('submit', (e) => {
    if (e.target.matches('#register-form')) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (data.mat_khau !== data.nhap_lai_mat_khau) {
            alert('Mật khẩu nhập lại không khớp!');
            return;
        }

        fetch('/tai-khoan/dang-ky', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);

        })
        .catch(error => {
            console.error('Lỗi đăng ký:', error);
            alert('Đã có lỗi xảy ra khi đăng ký.');
        });
    }

    if (e.target.matches('#forgot-password-form')) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        fetch('/tai-khoan/quen-mat-khau', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);

        })
        .catch(error => {
            console.error('Lỗi quên mật khẩu:', error);
            alert('Đã có lỗi xảy ra khi gửi yêu cầu.');
        });
    }
});