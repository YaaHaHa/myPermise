// 手写深拷贝
/**
 * 深拷贝，数据函数都可以
 * 
 *  @params 引用数据类型
 *  @returns 返回的引用数据类型
 * 1. 先判断传入的是不是引用数据类型，是array创建array
 *      typeof     Array.isArray
 * 2. 遍历引用类型，注意for..of不能遍历普通对象，因为普通对象没有迭代器
 * for...in
 * 3.  如果遍历到引用属性，开启递归
 * 
 */

function cloneDeep(obj) {
    if (typeof obj !== 'object') {
        return obj;
    }
    else {
        let newObj = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] !== 'object') {
                    newObj[key] = cloneDeep(obj[key]);
                } else {
                    newObj[key] = obj[key];
                }
            }
        }
        return newObj;
    }
}

const o = {
    a: 1,
    b: {
        c: 2,
        d: {
            e: 3
        }
    }
}
console.log(cloneDeep(o));

const a = [
    {
        a: 1,
        b: {
            c: 2,
            d: {
                e: 3
            }
        }
    }
]

console.log(cloneDeep(a));