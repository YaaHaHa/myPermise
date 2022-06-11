/* 
    Promise的三个状态，pending,fulfilled,rejected
    myPromise的参数executor是一个函数，此函数有两个参数resolve与reject
    resolve将状态改成fulfilled，reject将状态改成rejected
    Promise的状态改成fulfilled后有个唯一的value
    Promise的状态改成rejected后有一个唯一的reason

*/

// 遍历执行实例上由then产生的由状态决定是否执行的回调函数
function fulfilledCall(fulfilledList) {
    if (fulfilledList.length) {
        fulfilledList.forEach((fn) => {
            fn()
        })
    }
}

function rejectedCall(rejectedList) {
    if (rejectedList.length) {
        rejectedList.forEach((fn) => {
            fn();
        })
    }
}

function myPromise(executor) {
    this.state = 'pending';
    this.value = null;
    this.reason = null;
    // 在promise状态为padding时，then解析时把resolve后的函数push进下面的数组
    this.fulfilledList = [];
    this.rejectedList = [];
    // 定义一个函数，让executor里面的resolve用，下面的reject同理
    // 作用：改state，接value
    const resolve = (value) => {
        if (this.state === 'pending') {
            // 只能从pending所以要有个if
            this.state = 'fulfilled';
            this.value = value;
            // console.log('使用了resolve');
            if (value instanceof myPromise) {
                // 能进入这里，说明当前的this是then将要返回的Promise，value是then回调里面返回的promise
                // ！！！！！！！！！！！！！！这里和then有关，因为then在处理then里面的fulfilledCall和rejectedCall时都要执行这里，捕获一下错误
                if (value.state === 'fulfilled') {
                    this.state = 'fulfilled';
                    this.value = value.value;
                } else if (value.state === 'rejected') {
                    this.state = 'rejected';
                    this.reason = value.reason;
                    rejectedCall(this.rejectedList);
                    throw new Error(this.reason);   // 这里抛出错误了，后面就执行不了了，所以导致返回rejected的promise的话到这里就断了，而且在then那边直接捕获错误抛给reject，但是此时state已经是rejected了，所以即将进入的reject根本进不去if，后面的回调无法执行
                }
            }
            // 当状态由padding转成fuifilled时才会执行下面的语句
            fulfilledCall(this.fulfilledList)
        }
    }

    const reject = (reason) => {
        if (this.state === 'pending') {
            // console.log('使用了reject');
            this.state = 'rejected';
            this.reason = reason;
            rejectedCall(this.rejectedList);
        }
    }
    try {
        // 有错误抛出就成rejected了
        executor(resolve, reject);
    } catch (reason) {
        reject(reason)
    }

}



myPromise.prototype.then = function (onFufilledCall, onRejectCedall) {
    // 如果then的成功回调不是函数类型的，直接返回value，
    // ！！！！！！！！！第一次执行fulfilledList是空的，不能让undefined进入下面的id
    if (typeof onFufilledCall !== 'function' && onFufilledCall !== undefined) {
        onFufilledCall = (value) => {
            return value;
        }
    }

    // 如果then的失败回调不是函数类型的，throw error
    if (typeof onRejectCedall !== 'function' && onRejectCedall !== undefined) {
        console.log(this);
        console.log(onRejectCedall);
        onRejectCedall = (reason) => {
            throw new Error(reason);
        }
    }

    // 参数符合要求，就要处理then将要返回的函数了
    const p2 = new myPromise((resolve, reject) => {
        if (this.state === 'pending') {
            // 在解析代码时,p的状态显然是pending，说明是异步的，此时他的resolve和reject还没执行，把对应的回调从这里拿过去给他
            this.fulfilledList.push(() => {
                // this与函数定义的地方无关，与使用的地方有关，这个onfilledCall是在resolve后执行的，当前实例肯定有value啊
                const x = onFufilledCall(this.value);
                if (x === undefined){
                    resolve(x)
                }
                    try {
                        // 因为.then的返回值有多种情况，当x是error或rejected状态的promise时被catch到
                        resolve(x)
                    } catch (reason) {
                        reject(reason)
                    }

            })
            // 把
            this.rejectedList.push(() => {
                const x = onRejectCedall(this.reason);
                try {
                    resolve(x);
                } catch (reason) {
                    reject(reason)
                }
            })
        }
        if (this.state === 'fulfilled') {
            // 这里是同步的回调，是对Promise.resolve().then()的处理，开启一个微任务
            // 在这里就执行了
            queueMicrotask(() => {
                const x = onFufilledCall(this.value);
                try {
                    // 改变then里面返回的Promise的状态
                    resolve(x);
                } catch (reason) {
                    reject(reason);
                }
            })

        }
        if (this.state === 'rejected') {
            queueMicrotask = (() => {
                const x = onRejectCedall(this.reason);
                try {
                    resolve(x)
                } catch (reason) {
                    reject(reason)
                }

            })
        }
    })
    return p2;
}

// 传入的参数是promise数组
myPromise.all = function (promises) {
    return new myPromise((resolve, reject) => {
        // all返回的fulfilled的value是数组
        let resultAll = [];
        let index = 0;
        if (promises.length === 0) {
            resolve([])
        }
        for (let p = 0; p < promises.length; p++) {
            promises[p].then((value) => {
                // promise中promise的顺序与resultPromisesList
                resultAll[p] = value;
                // 完成一个promise加一
                index++;
                // 遍历到了最后一个p，不能用p，因为p是下标，不是完成的数量
                if (index === promises.length) {
                    resolve(resultAll)
                }
            },
                (reason) => {
                    // 一旦有任意一个是rejected，马上前面的都没用了，直接改状态
                    reject(reason)
                    return;
                })
        }
    })

}

myPromise.race = function (promises) {
    return new myPromise((resolve, reject) => {
        if (promises.length === 0) {
            resolve()
        }
        for (let p = 0; p < promises.length; p++) {
            promises[p].then((value) => {
                // 这里直接resolve
                resolve(value);
                return;
            },
                (reason) => {
                    reject(reason);
                    return;
                })
        }
    })
}

myPromise.resolve = function (value) {
    return new Promise((resolve, reject) => {
        resolve(value);
    })
}

myPromise.reject = function (reason) {
    return new myPromise((resolve, reject) => {
        reject(reason);
    })
}

const p1 = new myPromise((resolve, reject) => {
    // console.log('loading');
    setTimeout(() => {
        resolve('success_p1');
    }, 3000)
});
p1.name = 'p1';
// p1.test = '我是p1'
const p2 = p1.then(() => {
    // console.log('then里成功的回调');
    // 定时器构造的异步函数中return是不行的，return给谁啊，没人接啊。误以为是onFufilledCall的返回值
    return myPromise.reject('p2的reason');
})
p2.name = 'p2'

// 蚌埠住了，p2是rejected，那p2的then里面要写第二个函数处理rejected啊，不然p3怎么办！！！
/* const p3 = p2.then(() => {
    console.log('我是p3');
    return myPromise.reject('p3的reason');
}, () => {
    console.log('我是p3');
    return myPromise.reject('p3的reason');
}
)
p3.name = 'p3' */



const p3 = new myPromise((resolve, reject) => {
    // console.log('loading');
    setTimeout(() => {
        resolve('success_p3');
    }, 1000)
});
p3.name = 'p3';

const p4 = new myPromise((resolve, reject) => {
    setTimeout(() => {
        reject('fail');
    }, 5000)
});
p4.name = 'p4'

const pAll = myPromise.all([p1, p2, p3, p4]);
pAll.name = 'pAll';

// BUG:p2比p4块，最后pAll却是p4?
// 在solve那里添加instenceof判断，因为then里面会把onFufilledCall的返回值(成功回调的返回值)拿去再给resolve处理，同时try..catch捕获，可以这样把reject抛出来
// p1的then里面再setTimeout里面return myPrmise.reject()，这里的return根本不是onFufilledCall的返回值

