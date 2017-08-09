const _ = require('lodash');
const defError = require('def-error');
const InvalidParamError = defError('InvalidParamError');

class MorphArray {
    constructor(func) {
        this.func = func;
    }
};

class MorphTransform {
    constructor(key, func) {
        this.key = key;
        this.func = func;
    }
}

const morph = function(obj, transObj, elem, promises = [], ct = 0) {
    if (!_.isObject(obj) || Object.keys(obj).length === 0 || !_.isObject(transObj)) {
        throw new InvalidParamError('Both params to transform must be objects');
    }
    let result = (obj instanceof Array ? obj : [obj])
    .map((obj) => {
        return Object.keys(transObj)
        .reduce((agg, k) => {
            if (typeof transObj[k] === 'string' && transObj[k].slice(0, 1) === ':') {
                const str = transObj[k].slice(1);
                agg[k] = _.get(obj, str);
            } else if (typeof transObj[k] === 'string' && transObj[k].slice(0, 2) === '$.' && elem) {
                const str = transObj[k].slice(2);
                agg[k] = elem[str];
            } else if (typeof transObj[k] === 'string' && transObj[k] === '$' && elem) {
                agg[k] = elem;
            } else if (transObj[k] instanceof MorphArray) {
                agg[k] = transObj[k].func(obj, promises, ct);
            } else if (transObj[k] instanceof MorphTransform) {
                const transformation = transObj[k];
                if (transformation.key.slice(0, 2) === '$.' && typeof elem === 'object') {
                    const val = _.get(elem, transformation.key.slice(2));
                    promises.push(
                        Promise.resolve()
                        .then(() => {
                            return transformation.func(val)
                        })
                        .then((result) => {
                            agg[k] = result;
                        })
                    );
                } else {
                    const val = _.get(obj, transformation.key);
                    promises.push(
                        Promise.resolve()
                        .then(() => {
                            return transformation.func(val)
                        })
                        .then((result) => {
                            agg[k] = result;
                        })
                    );
                }
            } else if (transObj[k] instanceof Array) {
                agg[k] = transObj[k].map((t) => {
                    return morph(obj, t, elem, promises, ct + 1);
                });
            } else if (transObj[k] && typeof transObj[k] === 'object') {
                agg[k] = morph(obj, transObj[k], elem, promises, ct + 1);
            } else {
                agg[k] = transObj[k];
            }
            return agg;
        }, {})
    });

    if (obj instanceof Array == false && result.length === 1) {
        result = result[0];
    }

    if (ct === 0) {
        console.info(ct);
        console.log(promises.length);
        if (promises.length > 0) {
            return Promise.all(promises)
            .then(() => {
                return result;
            });
        }
    }
    return result;
}

morph.transform = (key, func) => {
    return new MorphTransform(key, func);
};

morph.array = (key, arrTrans) => {
    return new MorphArray((obj, promises, ct) => {
        console
        const arr = _.get(obj, key.slice(1));
        return arr.map((elem) => {
            return morph(obj, arrTrans, elem, promises, ct + 1);
        });
    });
};

module.exports = morph;
