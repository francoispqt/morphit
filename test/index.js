const assert = require('assert');
const morphit = require('../lib');
const defError = require('def-error');
const InvalidParamError = defError('InvalidParamError');


const tests = [
    (index) => {
        const obj = {
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
                    id_products: 1,
                    id_invoice: 1,
                    id_payment: 1
                }
            ]
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

        // morphing
        const morph = morphit(obj, {
            user: {
                id: ':id',
                firstName: ':first_name',
                lastName: ':last_name',
                idOffer: ':id_offer',
            },
            address: {
                street: ':street',
                postCode: ':post_code',
                country: ':country',
            },
            orders: ':orders',
            _morphed: true,
        });

        assert.equal(obj.id, morph.user.id, 'obj.id should equal morph.user.id');
        assert.equal(obj.street, morph.address.street, 'obj.street should equal morph.address.street');
        assert.deepEqual(obj.orders, morph.orders, 'obj.id should equal morph.user.id');
        console.log(`test ${index} passes`);
    },
    (index) => {
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

        assert.deepEqual([ { firstName: 'John', lastName: 'Doe' } ], morph, 'morph should equal value provided');
        console.log(`test ${index} passes`);
    },
    (index) => {

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
            }),
        });

        assert.deepEqual({
            users: [
                { firstName: 'John', lastName: 'Doe' },
                { firstName: 'Foo', lastName: 'Bar' }
            ]
        }, morph, 'morph should equal value provided');
        /*
        { users:
           [ { firstName: 'John', lastName: 'Doe' },
             { firstName: 'Foo', lastName: 'Bar' } ] }
        */
        console.log(`test ${index} passes`);
    },
    () => {
        const obj = {
            orders: [
                {
                    id: 1,
                    id_product: 1,
                    id_invoice: 1,
                    id_payment: 1
                }
            ],
            id_user: 1
        };

        const getSomeProduct = (value) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    return resolve({});
                }, 100);
            });
        };

        const getSomeInvoice = (value) => {
            return Promise.resolve({});
        };

        const getSomePayment = (value) => {
            return Promise.resolve({});
        };

        const getSomeUser = (value) => {
            return Promise.resolve({ value: value });
        };

        const morph = morphit(obj, {
            orders: morphit.array(':orders', {
                product: morphit.transform('$.id_product', getSomeProduct), // it returns a Promise,
                invoice: morphit.transform('$.id_invoice', getSomeInvoice), // it returns a Promise,
                payment: morphit.transform('$.id_payment', getSomePayment), // it returns a Promise,
            }),
            user: morphit.transform(':id_user', getSomeUser),
            _concurrency: 4,
        })
        .then((morph) => {
            assert.deepEqual(
                { orders: [ { product: {}, invoice: {}, payment: {} } ], user: { value: 1 } },
                morph,
                'Morph should be equal to value provded'
            );
            /*
                { orders: [ { product: {}, invoice: {}, payment: {} } ], user: { value: 1 } }
            */
        });
        return morph;
    }
];

const iterate = function (index) {
    return Promise.resolve()
    .then(() => {
        return tests[index](index);
    })
    .then(() => {
        if (index + 1 == tests.length) {
            return;
        }
        return iterate(index + 1);
    })
    .catch((error) => {
        console.error(error);
        console.log('Test fails');
        process.exit(1);
    });
}

iterate(0)
.then(() => {
    console.log('Test is successful');
});
