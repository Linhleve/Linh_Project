const members = [
    {
    name: "Phạm Văn Minh",
    birthday: "29/08/2005",
    desc: "Giám đốc công ty."
    },
    {
    name: "Phạm Hữu Linh",
    birthday: "23/03/2006",
    desc: "Trợ lý giám đốc."
    },
    {
    name: "Nguyễn Đình Đức Mạnh",
    birthday: "15/10/2006",
    desc: "Nhân viên xuất sắc nhất năm."
    },
    {
    name: "Trần Đình Nhân",
    birthday: "17/12/2006",
    desc: "Siêu lao công."
    }
];
function showInfo(index) {
    document.getElementById("content").innerHTML = `
        <h2 class="f28">${members[index].name}</h2><br>
        <p class="f20"><strong>Ngày sinh:</strong> ${members[index].birthday}</p><br>
        <p class="f20"><strong>Chức vụ:</strong> ${members[index].desc}</p>
    `;
}