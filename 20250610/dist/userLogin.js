const uidInput = document.querySelector(".user-id");
const upwInput = document.querySelector(".user-pw");
const loginBtn = document.querySelector(".login-btn");
loginBtn.addEventListener("click", () => {
    const data = {
        uid: uidInput.value,
        upw: upwInput.value
    };
    console.log(`입력한 아이디는 ${data.uid} , 입력한 비밀번호는 ${data.upw}`);
});
