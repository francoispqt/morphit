const assert = require('assert');
const morphit = require('../lib');
const defError = require('def-error');
const InvalidParamError = defError('InvalidParamError');

const obj = {
    test: {
        test1: 'test',
        hello: 'hey',
        sub: {
            test: 1,
            bar: 'bar',
        }
    },
    testArr: [
        {
            testObj: 1,
        },
        {
            testObj: 2,
        }
    ],
    test2: 'test'
};

// test error thrown because wrong params
assert.throws(
    () => {
        morphit(obj, null);
    },
    InvalidParamError
);

assert.throws(
    () => {
        morphit(null, {});
    },
    InvalidParamError
);

// assert transformation
const transformation = morphit(obj, {
    hello: ':test',
    world: ':test.hello',
    sub: {
        t: ':test.sub',
        sub: {
            foo: ':test.sub.bar'
        }
    },
    arr: [
        {
            t: ':testArr[0]',
        }
    ],
    arr2: morphit.array(':testArr', {
        t: '$.testObj',
        tt: '$',
    }),
    oh: ':test.sub.test',
    test2: 'hello world',
});

console.log(transformation);

assert.equal(obj.test, transformation.hello, 'transformation.hello keys should be value of obj.test');
assert.equal(obj.test.hello, transformation.world, 'transformation.world key should be value of obj.test.hello');
assert.equal(obj.test.sub, transformation.sub.t, 'transformation.sub.t key should be value of obj.test.sub');
assert.equal(obj.test.sub.bar, transformation.sub.sub.foo, 'transformation.sub.sub.foo key should be value of obj.test.sub.bar');
assert.equal(obj.testArr[0], transformation.arr[0].t, 'transformation.world key should be value of obj.test.hello');
assert.equal('hello world', transformation.test2, 'transformation.world key should be value of obj.test.hello');
assert.equal(obj.testArr[0], transformation.arr2[0].tt, 'transformation.arr2[0].tt key should be value of obj.testArr[0]');
assert.equal(obj.testArr[0].testObj, transformation.arr2[0].t, 'transformation.arr2[0].t key should be value of (obj.testArr[0].testObj');

console.log('Test successful');

const getSomeProduct = () => {
    return Promise.resolve({});
};

const getSomeInvoice = () => {
    return Promise.resolve({});
};
const getSomePayment = () => {
    return Promise.resolve({});
};

const obj2 = {
    id: 1,
    first_name: 'morph',
    last_name: 'it',
    street: 'Champs Élysées',
    post_code: '75000',
    country: 'FR',
    id_offer: 2,
    orders: [
        {
            id: 1,
            id_product: 1,
            id_invoice: 1,
            id_payment: 1
        }
    ]
};
const morph = morphit(obj2, {
    id: ':id',
    firstName: ':first_name',
    lastName: ':last_name',
    idOffer: ':id_offer',
    address: {
        street: ':street',
        postCode: ':post_code',
        country: ':country',
    },
    orders: morphit.array(':orders', {
        id: morphit.transform('$.id', (value) => {
            return Promise.resolve(value + 'oh ley oh key oh le');
        }),
        id2: {
            id: morphit.transform('$.id', (value) => {
                return Promise.resolve(value + 'oh ley oh key oh le');
            }),
        },
        test: 1,
    }),
    products: morphit.array(':orders', {
        id: '$.id_product',
    }),
    _morphed: true,
})
.then((result) => {
    console.info(result);
    const arr = [
        {
            first_name: 'John',
            last_name: 'Doe',
        }
    ];

    const morph = morphit(arr, {
        firstName: ':first_name',
        lastName: ':last_name',
    });
    console.log(morph);

    const obj = {
        orders: [
            {
                id: 1,
                id_product: 1,
                id_invoice: 1,
                id_payment: 1
            }
        ]
    };

    const morph2 = morphit(obj, {
        orders: morphit.array(':orders', {
            product: morphit.transform('$.id_product', getSomeProduct), // it returns a Promise,
            invoice: morphit.transform('$.id_invoice', getSomeInvoice), // it returns a Promise,
            payment: morphit.transform('$.id_payment', getSomePayment), // it returns a Promise,
        }),
    })
    return morph2;
})
.then((morph2) => {
    console.log(morph2);

    const obj = {
        users_info: [
            {
                first_name: 'John',
                last_name: 'Doe',
            },
            {
                first_name: 'Foo',
                last_name: 'Bar',
            }
        ]
    };

    const morph = morphit(obj, {
        users: morphit.array(':users_info', {
            firstName: '$.first_name',
            lastName: '$.last_name',
        })
    });
    console.log(morph);
});

console.log(morph);
