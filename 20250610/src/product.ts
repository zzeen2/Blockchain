// 할인의 구조를 정의
interface IDiscount {
    // 공통적인 요소로 할인을 하는 메서드
    getDisCountPrice(price : number) : number
}

// 고정 금액 할인 (1000원 할인하는 쿠폰, 2000원 할인하는 쿠폰)
class FlatDisCount implements IDiscount {
    // 본인 속성
    amount : number; // 1000, 2000, 3000
    constructor(amount : number) {
        this.amount = amount;
    }

    getAmount() {
        return this.amount;
    }

    getDisCountPrice (price : number) : number {
        // price 원가를 깎을 금액
        return price - this.amount;
    }
}

// 퍼센트 할인 기능
class PercentDiscount implements IDiscount {
    percent : number;
    constructor(percent : number) {
        this.percent = percent;
    }
    getDisCountPrice(price: number): number {
        return price * (1 - this.percent / 100);
    }
}

// 특별할인 행사 고정금액 할인 된 된다음 퍼센트 할인 적용
// 판매금액을 행사 기간이어서 모든 상품이 2000원씩 할인상태야 퍼센트를 적용한 금액
class FlatPersent implements IDiscount {
    amount : number;
    persent : number;
    constructor(amount : number, persnet : number) {
        this.amount = amount;
        this.persent = persnet;
    }

    getDisCountPrice(price: number): number {
        const result = price - this.amount;
        return result * (1 - this.persent / 100);
    }
}

// 원본 값 상품의 금액은 수정 할수 없다.
class Products {
    name : string
    price : number
    constructor(name : string, price : number) {
        this.name = name;
        this.price = price;
    }

    getName() : string {
        return this.name;
    }

    getPrice() : number {
        return this.price;
    }
}

// 할인 기능과 상품의 인스턴스를 받아서 할인의 금액을 구해주는 인스턴스
class ProductDisCount {
    product : Products // 클래스로 만든 인스턴스를 할당 할 변수
    discount : IDiscount // 할인의 인스턴스의 최소의 기본형태를 할당 할 변수
    constructor(product : Products, discount : IDiscount) {
        this.product = product;
        this.discount = discount;
    } 

    getPrice() : number {
        return this.discount.getDisCountPrice(this.product.getPrice());
    }
}

// 상품 
const mac= new Products("Mac", 1000000);

// 할인 쿠폰
const flatCoupon = new FlatDisCount(1000);
const flatCoupon2 = new FlatDisCount(2000);
const persentCoupon = new PercentDiscount(20); // 20 퍼센트 할인 쿠폰
const flatPersent = new FlatPersent(2000, 30);

// 할인 금액 (기능을 구분해서 의존성 주입)
const macFlatCoupon = new ProductDisCount(mac, flatCoupon);
const macFlatCoupon2 = new ProductDisCount(mac, flatCoupon2);
// 퍼센트 할인 금액
const macPersentCoupon = new ProductDisCount(mac, persentCoupon);
// 특가 행사
const macFlatPersentCoupon = new ProductDisCount(mac, flatPersent);

console.log(`상품이름 : ${mac.getName()}, 상품가격 : ${mac.getPrice()}`);
console.log(`쿠폰 종류 : ${flatCoupon.getAmount()}원 쿠폰`)
console.log(`쿠폰 종류 : ${flatCoupon2.getAmount()}원 쿠폰`)
console.log(`쿠폰 할인 ${mac.getName()}상품의 금액은 ${macFlatCoupon.getPrice()} 원 입니다.`);
console.log(`쿠폰 할인2 ${mac.getName()}상품의 금액은 ${macFlatCoupon2.getPrice()} 원 입니다.`);

console.log(`20퍼센트 할인 쿠폰 적용 가격은 ${macPersentCoupon.getPrice()}원 입니다.`);
console.log(`특가 할인 금액은 ${macFlatPersentCoupon.getPrice()}원 입니다.`)