[![Build Status](https://travis-ci.org/francoispqt/lists.svg?branch=master)](https://travis-ci.org/francoispqt/lists)

# Morphit
Simple utility to morph an object to another one.
```js
const morphit = require('morphit');
```

## Basic Usage
Basic morphit function transforms an object to another object, mapping values with dot notation.
```js
const morphit = require('morphit');

// object to morph
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

console.log(morph);
/*
{
    user: {
        id: 1,
        firstName: 'morph',
        lastName: 'it',
        idOffer: 2
    },
    address: {
        street: 'Champs Élysées',
        postCode: '75000',
        country: 'FR'
    },
    orders: [
        {
            id: 1,
            id_products: 1,
            id_invoice: 1,
            id_payment: 1
        }
    ],
    _morphed: true
}
*/
```
## Array
You can morph arrays of objects
```js
const morphit = require('morphit');

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
/*
[ { firstName: 'John', lastName: 'Doe' } ]
*/
```

## Nested array morphing
You can morph an array nested in an morphing using `morphit.each`.
```js
const morphit = require('morphit');

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
    users: morphit.each(':users_info', {
        firstName: '$.first_name',
        lastName: '$.last_name',
    });
});

console.log(morph);
/*
{ users:
   [ { firstName: 'John', lastName: 'Doe' },
     { firstName: 'Foo', lastName: 'Bar' } ] }
*/
```

## Morph transform data
Morphit provides a way to transform the value before mapping to the morphed object;
You can run async as long as you return a `Promise`.
When adding transformations, morphit will return a `Promise`, you must use `.then`.
If you add a `_concurrency` to the morph object, promises from transformations will be run in a pool of size 4, if no concurrency is provided, all transformations will be run synchronously.

```js
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
    return Promise.resolve({});
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
    orders: morphit.each(':orders', {
        product: morphit.transform('$.id_product', getSomeProduct), // it returns a Promise,
        invoice: morphit.transform('$.id_invoice', getSomeInvoice), // it returns a Promise,
        payment: morphit.transform('$.id_payment', getSomePayment), // it returns a Promise,
        user: morphit.transform(':id_user', getSomeUser),
    }),
    user: morphit.transform(':id_user', getSomeUser),
    _concurrency: 4,
})
.then((morph) => {
    console.log(morph);
    /*
        { orders: [ { product: {}, invoice: {}, payment: {} } ], user: { value: 1 } }
    */
});
```
