class FlatDisCount {
    constructor(amount) {
        this.amount = amount;
    }
    getAmount() {
        return this.amount;
    }
    getDisCountPrice(price) {
        return price - this.amount;
    }
}
class PercentDiscount {
    constructor(percent) {
        this.percent = percent;
    }
    getDisCountPrice(price) {
        return price * (1 - this.percent / 100);
    }
}
class FlatPersent {
    constructor(amount, persnet) {
        this.amount = amount;
        this.persent = persnet;
    }
    getDisCountPrice(price) {
        const result = price - this.amount;
        return result * (1 - this.persent / 100);
    }
}
class Products {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
    getName() {
        return this.name;
    }
    getPrice() {
        return this.price;
    }
}
class ProductDisCount {
    constructor(product, discount) {
        this.product = product;
        this.discount = discount;
    }
    getPrice() {
        return this.discount.getDisCountPrice(this.product.getPrice());
    }
}
const mac = new Products("Mac", 1000000);
const flatCoupon = new FlatDisCount(1000);
const flatCoupon2 = new FlatDisCount(2000);
const persentCoupon = new PercentDiscount(20);
const flatPersent = new FlatPersent(2000, 30);
const macFlatCoupon = new ProductDisCount(mac, flatCoupon);
const macFlatCoupon2 = new ProductDisCount(mac, flatCoupon2);
const macPersentCoupon = new ProductDisCount(mac, persentCoupon);
const macFlatPersentCoupon = new ProductDisCount(mac, flatPersent);
console.log(`상품이름 : ${mac.getName()}, 상품가격 : ${mac.getPrice()}`);
console.log(`쿠폰 종류 : ${flatCoupon.getAmount()}원 쿠폰`);
console.log(`쿠폰 종류 : ${flatCoupon2.getAmount()}원 쿠폰`);
console.log(`쿠폰 할인 ${mac.getName()}상품의 금액은 ${macFlatCoupon.getPrice()} 원 입니다.`);
console.log(`쿠폰 할인2 ${mac.getName()}상품의 금액은 ${macFlatCoupon2.getPrice()} 원 입니다.`);
console.log(`20퍼센트 할인 쿠폰 적용 가격은 ${macPersentCoupon.getPrice()}원 입니다.`);
console.log(`특가 할인 금액은 ${macFlatPersentCoupon.getPrice()}원 입니다.`);
