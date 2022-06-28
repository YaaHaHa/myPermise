// new 要做哪些事情？
// 1.创建一个空对象
// 2.空对象的_proto_应指向被new的prototype
// 3.调用构造函数，并将构造函数内的this执行新创建的对象
// 4.把剩余的参数传给构造函数执行

function myNew(Fn, ...args) {
    let newInstance = {};
    newInstance.__proto__ = Fn.prototype;
    // 调用构造函数，将构造函数里的this执行新创建的对象
    let res = Fn.apply(newInstance, args)
    // 判断res的值
    // 如果该函数没有返回对象，则返回this，即
    return typeof res === 'object' ? res : newInstance;
}

function myPromise(executor) {
    this.state = 'pending';
    this.value = null;
    this.reason = null;
    this.rolveCallList = [];
    this.rejectCallList = [];

    // 这里要用箭头函数方便一点，要么在exector那里给bind一下
    const resolve = function (value) {
        if (this.state === 'pending') {
            this.state = 'fulfilled';
            this.value = value;
            if (this.rolveCallList.length != 0) {
                this.rolveCallList.forEach((fn) => {
                    fn()
                })
            }
        }
    }

    // 444444 ---master
    const reject = (reason) => {
        if (this.state === 'pending') {
            this.state = 'rejected';
            this.reason = reason
            if (this.rejectCallList.length != 0) {
                this.rejectCallList.forEach((fn) => {
                    fn()
                })
            }
        }
    }

    try {
        executor(resolve.bind(this), reject)
    } catch (reason) {
        reject(reason)
    }

}

myPromise.prototype.then = function (onFulfilledCall, onRejectedCall) {
    if (typeof onFulfilledCall !== 'function') {
        onFulfilledCall = (value) => value
    }
    if (typeof onRejectedCall !== 'function') {
        onRejectedCall = (reason) => { throw new Error(reason) }
    }
    const p2 = new Promise(() => {
        if (this.state === 'pending') {
            this.rolveCallList.push(() => {
                const x = onFulfilledCall(value);
                try {
                    resolve(x)
                } catch (reason) {
                    reject(reason);
                }
            })
            this.rejectCallList.push(() => {
                const x = onRejectedCall(reason);
                try {
                    resolve(x);
                } catch (error) {
                    reject(error);
                }
            })
        }
        if (this.state === 'fulfilled') {
            queueMicrotask(() => {
                const x = onFulfilledCall(this.value);
                try {
                    resolve(x)
                } catch (reason) {
                    reject(reason);
                }

            })
        }
        if (this.state === 'rejected') {
            queueMicrotask(() => {
                const x = onRejectedCall(this.reason);
                try {
                    resolve(x)
                } catch (reason) {
                    reject(reason)
                }
            })
        }
    })
}

const p1 = new myPromise((resolve, reject) => {
    setTimeout(() => {
        reject(1)
    }, 0)
})