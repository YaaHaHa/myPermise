// 工厂设计模式

// 先创建两个构造函数用来生成对应的对象
function Baoma(color) {
    this.brand = 'baoma';
    this.color = color;
}

function Benchi(color) {
    this.brand = 'benchi';
    this.color = color;
}

// 创建工厂函数的类型
function createFac() {
    this.createCar = function (brand, color) {
        switch (brand) {
            case 'baoma':
                return new Baoma(color);
            case 'benchi':
                return new Benchi(color);
            default:
                break;
        }
    }
}

// 创建工厂
const fc = new createFac()

const c1 = fc.createCar('baoma', 'blue');
const c2 = fc.createCar('benchi', 'red');
console.log(c1);
console.log(c2);


// 单例模式，只有一个实例
// 需要使用return。使用new的时候如果没有手动设置return,那么会默认返回this。
//      但是，我们这里要使得每次返回的实例相同，也就是需要手动控制创建的对象，因此这里需要使用return。
//  我们需要每次return的是同一个对象。也就是说实际上在第一次实例的时候，需要把这个实例保存起来。
//      再下一个实例的时候，直接return这个保存的实例。因此，这里需要用到闭包了。
const Person = (function () {
    let instance = null;
    return class {
        constructor() {
            if (!instance) {
                instance = this;
            } else {
                return instance;
            }
        }
    }
})()

let p3 = new Person();
let p4 = new Person();
console.log(p3===p4)    //true
