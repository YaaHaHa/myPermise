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

Function.prototype.myBind = function (context) {
    let thisArg = Array.prototype.shift.call()
    thisArg = thisArg || window;
    let self = this;
    // 当用new操作符作用于bind后的函数时，bind时的this指定就失效了，但传入的参数依旧有效

    //      为了保证new myBind的时候正常创建实例，需要用到继承，_fn要能访问到self的原型
    // 不写一个空函数，就会改变self的的property了，因为下面就要写_fn.property = this.property，以后想修改_fn的property时就也改了this.property
    let fn = function () { };
    let _fn = function () {
        let bindArgs = Array.prototype.slice.call(arguments)
        self.apply(this instanceof fn ? this : thisArg, args.concat(bindArgs));

    }
    fn.prototype = self.prototype;
    _fn.prototype = new fn();
    return _fn;
}


function myBind2(thisArg, ...args) {
    thisArg = thisArg || window;
    let self = this;
    function fn() { }
    function _fn(...args) {
        self.apply(thisArg, args)
    }
    // new的时候要让_fn访问到self上的原型，又不能随便改self上的原型，所以用一个中间函数，采用继承！
    fn.prototype = self.prototype;
    _fn.prototype = new fn();
    return _fn()
};

Function.prototype.myBind3 = function (thisArg, ...args) {
    let self = this;
    thisArg = thisArg || window;
    if (typeof this !== 'function') {throw new Error('请输入函数')}
    function _fn() {
        let bindArgs = Array.prototype.slice.call(arguments)
        self.apply(thisArg, args.concat(bindArgs));
    }
    return _fn;
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

const ff = obj2.fn.myBind3(obj1, 1, 2, 3)
console.log(ff());

