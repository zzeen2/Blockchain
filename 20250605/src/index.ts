// 원시타입
let message : string = "hello TypeScript";
let count : number = 313;
let isActive : boolean = false;
let hash : string = "0xfeself" // 진수는 숫자형 데이터가 맞지만 문자열로 사용
let initValue : any = "123"; // 타입검사를 하지 않겠다 any는 쓰지마라
// any 타입검사를 할수 없는 경우가 생긴다.
// 모듈 시스템 라이브러리에서 타입의 모듈을 제공하지 않는 경우 진짜 불가피한 경우 사용해라
let initValue2 : undefined = undefined;
let initValue3 : null = null;
let initValue4 : unknown = "123";

initValue = 1;

// unknown 값을 재할당할때 조건이 필요하다.
// 조건문 이후에 사용을 해야한다.
if (typeof initValue4 === "number"){
    initValue4 = 1;
    console.log(initValue4)
}


// any와 unknown의 차이
// any는 무슨 값인지 아예 몰라. 완전 타입검사를 강력하게 풀었다.
// unknown 타입을 특정할수는 없는데 검사는 또 하고싶어 검증은 필요해

// 참조타입 배열
let list : number[] = [1,2,3]; // 요소들이 숫자형 타입이다/
let list2 : Array<number> = [1,2,3,4,5] // 배열의 요소들이 숫자형 타입이다.  
// 고정의 사이즈와 각 요소의 타입을 정의하는 형태를 튜플 ㄴ타입
let list3 : [string, number] = ["id", 1]

list3[0].replace("i", "")
list3[1] // number

// viod 반환값이 없는 함수
const add = (a : number, b: number) : number => {
    return a + b;
}

function add2 () :number {
    return 1
}

// 추상클래스 객체의 형태를 정의해서 사용
// interface 추상 클래스 선언 예약어
// I를 이름 앞에 붙여서 명시
interface IBlock {
    id : number
    num : number
}

// object 
let object : IBlock = {
    id : 123,
    num : 123
}

// implements 추상클래스를 상속 즉 형태를 상속받는다 ( 값을 상속받는게 아님 )
// extends 속성을 상속 받는다. 
class Block implements IBlock {
    id : number
    num : number
    constructor (_id : number) {
        this.id = _id;
        this.num = 1;
    }
}

//const el : HTMLDivElement | null = document.querySelector(".item");
// 타입을 추론할때 내가 알려줄게 이 타입의 값이 들어있는 변수야
// (el as HTMLDivElement).onclick = (e : MouseEvent) => {
// }

// const add = ( count : string ) : number => {
//     const add_count : number = 1;
//     return count + add_count;
// }

console.log(message);