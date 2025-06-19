# src 폴더구조

    - core : 블록, 체인, 트랜잭션 ..
    - dto : 데이터 전달할때 사용할 형태
    - interface : 인스턴스 형태 정의
    - type : 데이터의 형태만 정의 = (VO)
    - utill : 공통적으로 사용하는 기능을 분리
    - env : 환경변수 사용

# DTO (data transform object)

```js
const user = {
    userId : "",
    userPW : "",
    userName : "",
}
```

응답을 보낼때

user 그대로 응답을 하면 비밀번호가 노출된다.
비밀번호를 노출시키지 않기 위해서 데이터를 전달할 구조를 정의해서 전달한다.
데이터를 보낼때의 형태를 각각 정해놓고 사용하는 객체의 형태

작은 택배 박스, 중간 택배 박스, 큰 택배 박스

```js
const userDto = {
    userId : "",
    userName : ""
}
```

### DTO의 목적
1. 데이터를 전달할때 불필요한 데이터 포함 방지 
2. 보안성, 데이터 낭비 방지
3. 데이터를 포장해서 보내기 위해서 사용을 한다.
4. 요청을 받을때 DTO가 정의되어있고 응답 받을떄도 DTO가 정의되어있다.

#### DTO의 역할
- 필요한 데이터 전송
- 보안적 데이터의 전달 방지
- 계층간의 데이터 전달
- 데이터의 구조를 정의해서 코드의 가독성 향상

### MVC
요청
> 브라우저 => 컨트롤러 => {DTO 포장}=> 서비스 로직 => 데이터베이스 

``` ts
// 모든 정보
interface userDTO {
    userId : string,
    userPW : number,
    userName : string,
    userEmail : string,
    userImg : string
}

// DTO 포장
interface userDTO {
    userId : string,
}
```

응답
> 데이터베이스 => 서비스 로직 => {DTO 포장} => 컨트롤러 => 브라우저

``` ts
// 응답 DTO
interface userDTO {
    userName : string,
    userImg : string
}

const userdto : userDto {
    userName : "zzeen",
    userImg : "http://kakao/zzeen.png"
}
```

### VO(Value Object) DAO (Data Access Object)

#### VO
> 값을 정의하는 형태 값 자체를 객체로 표현한 것.
> 보통 불변 객체

> 목적은 값 자체를 표현하는것이 목적

```js
class User {
    constructor (uid, upw){
        this.uid = uid
        this.upw = upw
    }
}

const user1 = new User("zzeen", "1234");
const user2 = new User("zzeen2", "12345");

console.log(typeof user.uid === typeof user2.uid);
console.log(user1 === user2); //false
console.log(user1 == user2); //false
// 객체는 단순히 비교가 어려우니 객체의 값들을 비교
// 순회를 돌려서 비교를 해야한다.
console.log(user1.equals(user2))
// 타입스크립트에서 우리는 지금 vo의 개념이라고하면 객체의 형태를 정의해서
// 키에 할당되는 값의 타입의 형태 비교
```

#### DAO
> 데이터 접근 객체. 
> DAO는 VO와 DTO의 내용을 받아서
> 비즈니스 로직을 구분해서 처리하고, DAO가 받아서 데이터베이에 요청한다. 

> DAO는 데이터베이스에 접근하는 역할을 하는 객체

```js
class UserDAO {
    constructor (db) {
        this.db = db;
    }

    findOneId (id) {
        return this.db.query("select * from user")
    }
}
// 시퀄라이즈에게 전달하기 전에 원하는 형태의 데이터를 전달하기 위한 정의를 하고
// DAO를 통해서 시퀄라이즈에게 요청
```

### 객체지향 프로그래밍 체인

### 내일 이더리움 백서
