# 타입스크립트
> 자바스트립트는 동적인 언어 타입을 가지고 있는데, 객체지향에 반하는 형태로 설계되었다. (프로토타입)
> 자바스크립트에서 변수의 타입은 실행을 시킨 이후에 런타임 환경에서 예측하지 못한 타입에러가 발생할 수 있다.
> 타입스크립트는 마이크로소프트에서 만든 트랜스파일러 작성단계에서는 타입스크립트로 작성을 하고
> 컴파일을 통해 자바스크립트로 변환한후 런타임 환경에서 동작된다.
> 타입스크립트는 런타임환경이 없다.

> 프로젝트의 규모가 커지다 보면 버그나 유지보수에 어렵다. 사람이 많은 프로젝트가 진행되기 때문에 타입의 조건 검증 코드가 늘어나고, 가독성이 떨어지고 실행 전까지는 에러를 파악할 수 없다.
> 상위집합 즉 슈퍼셋 언어로 타입스크립트를 마이크로소프트에서 발표 했다.

> 타입스크립트의 목표는 타입을 사용하게 된 이유 목적뿐만이 아니라 객체 지향 프로그래밍을 하기 위한 목적을 가지고 있다. 추상화

### 원시타입
```ts
// javascript
let count = 1; // 박싱 언박싱 프로토 타입
// 숫자 타입이 동적으로 할당

count = "1" // 자바스크립트에서는 가능 

// 타입지정 타입스크립트
// 원시타입 7 (숫자, 문자열, bool, undefined, null, 심볼, bigint)
let count : number = 1;
[예약어] [변수명] : [타입명] = [변수값];

let isActive : boolean = true;
let str : string = "hello";
let count1 : undefined = undefined;
let null : null = null;

// any 많이 사용하지 마라 타입스크립트를 사용하는 목적이 모호해진다.
// @types/express 인터페이스를 정의해놓은 파일
// 타입 인터페이스를 제공하지 않는 라이브러리들을 사용할때는 any를 사용할 수 밖에 없다.
let any : any = null;
let any1 : any = 1;

let express : Express = require("express");

// 참조 타입 
// 배열 튜플
// 타입스크립트 

let list = []; // 자바스크립트에서 요소들이 동적인 타입을 가진다.
let list : number[] = [1,2,3,4]; // 배열의 요소들의 타입을 number로 지정 
let list : Arry<number> = [1,2,3,4]; // Arry 배열의 객체 형태에서 요소들의 타입을 number타입을 전달받아서 사용한다.

// 튜플 타입을 명시하는데 고정된 사이즈의 배열에 요소의 타입을 지정한다.
// 쿠키 파싱, 쿼리스트링 파싱, 요청메세지 파싱 ["method", "get"]
let method : [string, number] = ["get", 3]

// 함수
// 함수는 void 반환값이 없는 함수 
const add = (a : number, b: number) : void => {
    
}

// 반환타입이 있는 함수
const add = (a : number, b: number) : void => {
    return a + b;
}

// 객체의 타입 지정
// 추상화 어렵다 ..
// interface 추상 클래스 선언 (객체의 형태를 선언) 객체의 형태의 검증만
interface CountObject {
    num : number;
    num2 : number;
    message : string;
}

// 동적인 타입을 가지는 키와 값을 가지고 있는 객체
const count = {

}

// VO DTO DAO => IOC
const count : CountObject = {
    num1 : 1,
    num2 : 2,
    message : "안녕"
}

// class 클래스
// 형태를 상속 시킨다
// constructot 함수를 호출해서 만드는 객체의 형태가 countObject의 형태이어야 한다.
class Count implements CountObject {
    id : number
    num : number
    message : string
    constructor () {
        this.num = 1;
        this.num2 =2;
        this.message = "123"
    }
}
// 타입스크립트의 고급 타입
// 유니언 
// 유니언 타입은 둘 이상의 타입 중에 하나에 속할 수 있다.

// 메시지를 만드는 함수
const addMessage = (a : number | string , b : string) : string | number => {
    return a + b;
}
addMessage(1,1);
// 제네릭
// 제네릭은 함수 혹은 생성자 클래스에 타입을 매개변수처럼 전달해서 사용할 수 있는 방식
// 타입을 인자로 전달할 수 있다.
// 타입을 두가지 혹은 여러가지를 사용하는데 확장성을 고려해서 작성할 수 있다.

// 두 값을 더하는 함수인데 문자열을 더할수도 있고, 숫자를 더할수도 있는데, 매개변수의 값의 타입이 잘 전달이 될지 추론을 하고싶다.
function add<T> (a : T, b : T) : T {
    return a + b;
} 
// 제네릭 문법을 사용하는 구문은 실행단계에서 타입이 정의된다.
add<number>(1,2);

interface IResult {
    message : string,
    result : number
} 

interface IError {
    message : string,

}
class Count<R,E> {
     constructor () { }
     
     add = ( bool : boolean ) : R | E => {
        // 로직에 따라서 결과 객체의 형태를 반환하거나 에러객체의 형태를 반환하거나 
        if(bool) {
            let reult : R = {

            }
            return {message : "성공", result : 200} 
        } else {
            let error : E = {
                
            }
            return {message : "에러발생"}
        }
     }
}
```

### this binding

#### 일반 함수
```js
function a() {}
/*
argument : null
caller : null
length : 0
name : "a"
prototype : {}
*/

console.log(a);
// 일반함수 사용할때 this의 혼란이 발생한다. 
```

```js
function Foo(a,b) {
    console.log(this);
    return [a,b]
}

const a = Foo(1,2); // window
console.log(a); //> [1,2]

const bar = {
    method : Foo,
}

const b = bar.method(2,3)
console.log(b); //> 
```

### this 바인드
> foo는 같은 함수인데도 this의 결과물이 다르다
> this가 객체를 할당받는 즉 참조하는 예약어 
> 용어로 표현했을때 this바인딩 이라고 한다. 

- bind
- call
- apply 

### 바인드 메서드를 사용
```js
function Foo (a,b) {
    console.log(this); //> 출력 1 : {name : "soon"}
    return [a,b]; //> 출력 2: [1,2] ( 반환값 도출후 콜스텍에서 삭제 )
}

// 연산자 등 함수 모든 자바스크립트를 사용하면서 공부하면서 가장 중요하게 보고 설계하는 부분은 매개변수 반환값 그리고 타입

// function에서 바인딩을 제어하는 메서드를 제공한다.
const foo = Foo.bind({name : "soon"})
console.log(foo(1,2))

const bar = {method : foo}

bar.method(1,2) //> 바인드가 이미 되어있기 때문에 {name : "soon"}
```

### call, apply

```js
function Foo (a,b) {
    console.log(this);
    return [a,b];
}

// call(obj, a, b){ // call 내부동작
//     this = obj
//     return this.method(a,b)
// }

const foo = Foo.call({name : "soon"},1 ,2 )// 바인드하고 함수 실행 첫번째 인자로 전달한 객체를 바인드 한다. 두번째 이후부터 배개변수로 전달 순서대로
console.log(foo) //> {name : "soon"} , [1,2]

// apply
const foo = Foo.apply({name : "soon"} , [1,2]) // call과 동작은 같지만 매개변수의 타입의 차이가 있다. 배열의 형태로 매개변수의 값을 전달 
```

### 함수의 다양한 this
- 일반함수
- 생성자 함수
- 객체 메서드로 할당

> function은 기본적으로 함수 선언으로 사용하는 것을 목적으로 처음에 만들었는데
> this 바인딩으로 기능이 추가되었다. 생성자 함수로 사용하는 프로퍼티
> 프로토 타입의 생성자 함수에 의해서 new키워드를 만나서 생성자로 사용될수 있다.
> new로 생성한 스코프에서 this가 객체를 참조하기 때문에 