// 유저의 입력값을 정의하는 타입
type UserLogin = {
    uid : string,
    upw : string
}

// 타입 어서션을 사용해서 요소를 어떤 요소인지의 타입을 지정
// HTMLInputElement라고 지정을 해서 이후에 코드의 내용에 요소에 있는 이벤트를 등록해서 사용할수 있다. 
const uidInput = document.querySelector(".user-id") as HTMLInputElement
const upwInput = document.querySelector(".user-pw") as HTMLInputElement
const loginBtn = document.querySelector(".login-btn") as HTMLButtonElement

// 이벤트 등록
loginBtn.addEventListener("click", () => {
    const data : UserLogin = {
        uid : uidInput.value,
        upw : upwInput.value
    }

    // api
    console.log(`입력한 아이디는 ${data.uid} , 입력한 비밀번호는 ${data.upw}`);
})