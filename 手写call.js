// 通过对象.属性的形式调用
// 对象是谁？传进来的第一个参数
// 属性是谁？当前的执行环境

Function.prototype.myCall = function (thisArg, ...args) {
    // 有时候thisArg给他设成null了
    thisArg = thisArg || window
    // 拿到真正执行的函数self，用Symbol永不重复
    let self = Symbol();
    if (typeof this !== 'function') console.error('type error')
    // 把self挂到thisArg上
    thisArg[self] = this;
    let result = thisArg[self](...args);
    delete thisArg[self];
    return result;
}

Function.prototype.myApply = function (thisArg, ...args) {
    thisArg = thisArg || window
    let self = Symbol();
    if (typeof this !== 'function') console.error('type error')
    thisArg[self] = this;
    let result = thisArg[self](...args);
    delete thisArg[self];
    return result;
}

Function.prototype.myBind = function (thisArg, ...args) {
    thisArg = thisArg || window;
    let self = this;
    let fn = function () { };
    let _fn = function () {
        self.apply(this instanceof _fn ? this : thisArg, args);

    }
    fn.prototype = this.prototype;
    _fn.prototype = new fn();
    return fn();
}

let obj1 = {
    a: 1
}
let obj2 = {
    a: 2,
    fn: function (a = 1, b = 0, c = 0) {
        return a + b + c;
    }
}

console.log(obj2.fn(1, 2, 3));
console.log(obj2.fn.myApply(obj1, 4, 5, 6));

