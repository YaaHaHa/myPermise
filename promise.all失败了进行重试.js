// 创建promise的工具函数
function _promise(id) {
    return new Promise((resolve, reject) => {
        getR(id, resolve, reject);
    }).catch(e => { retryList.push(_promise(id)) })
}
// 模拟请求操作
function getR(id, resolve, reject) {
    setTimeout(() => {
        if (Math.random() < 0.8) resolve({ id, message: "ok" })
        else reject({ id, message: "error" })

    },1000)
}

let retryList = []  // 需要重发的所有请求
let times = 5 //  最多重发次数
let currentTime = 1 // 当前重发次数

let Relist = [_promise(1), _promise(2), _promise(3)];
let result = [];  // 结果

function actions(pL) {
    return Promise.all(pL).then((resolveL) => {
        result = result.concat(resolveL.filter(r => r !== undefined))
        if (retryList.length > 0 && currentTime < times) {
            console.log(`当前重试${currentTime++}次，共${Relist.length}个请求，失败${retryList.length}个`);
            actions(retryList)
            retryList = []
        } else {
            console.log(`重试${currentTime}次，共${Relist.length}个请求，成功${Relist.length - retryList.length}个请求`, result);
        }
    }).catch(e => { console.log(e); })
}
actions(Relist)

/* // 创建promise的工具函数
function _promise(id) {
    return new Promise((resolve, reject) => {
        getReq(id, resolve, reject)
        // }).catch(e => retryList.push(_promise(id)))  不带括号就是把push的返回值作，all里面失败的时候就不会为undefined了
    }).catch(e => { retryList.push(_promise(id)) })
}

// 模拟请求操作
function getReq(id, resolve, reject) {
    setTimeout(() => {
        if (Math.random() > 0.8) resolve({ id, message: 'ok' })
        else reject({ id, message: 'error' })
    }, 1000)
}

let retryList = [];  // 需要重复发送的列表
let times = 5;      // 最多连续请求的次数
let current = 1;    // 当前请求的次数
let result = [];    // 最后请求的结果

let reqList = [_promise(1), _promise(2), _promise(3)]
function actions(pL) {
    return Promise.all(pL).then((resolveL) => {
        result = result.concat(resolveL.filter(r => r !== undefined))   // 因为给每一个promise帮catch了，所欲返回的数组里面对应的就是undefined
        if (retryList.length > 0 && current < times) {
            console.log(`当前请求第${current}次，成功${reqList.length - retryList.length}个请求,失败${retryList.length}个`);
            actions(retryList);
            current++;
            retryList = [];
        } else { // 表示所有请求都成功了，或者达到了最大请求次数。到这里就可以对result做进一步处理了。
            console.log(`共请求${current}次,其中成功${reqList.length - retryList.length}个请求,失败${retryList.length}个`, result);
        }

    }).catch(e => console.log(e))
}

actions(reqList);
// console.log(Promise.all(reqList)); */