# Morphit
Simple utility to morph an object to another one

## Basic Usage
Basic morphit function transforms an object to another object, mapping values with dot notation.
```js
const morphit = require('morphit');
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

const morph = morphit(obj, {
    firstName: ':first_name',
    last_name: ':last_name',
});

console.log(morph);
/*
[ { firstName: 'John', lastName: 'Doe' } ]
*/
```

## Nested array morphing
You can morph an array nested in an morphing.
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
    users: morphit.array(':users_info', {
        firstName: '$.first_name',
        lastName: '$.last_name',
    });
});

console.log(morph);
/*

*/
```

## Morph transform data
Morphit provudes a way to transform the value before mapping to the morphed object;
You can run async as long as you return a `Promise`.
When adding transformations, morphit will return a Promise.

```js
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

const morph = morphit(obj, {
    orders: morphit.array(':orders', {
        product: morphit.transform('$.id', (value) => {
            return getSomeProduct(); // it returns a Promise
        }),
        invoice: morphit.transform('$.id', (value) => {
            return getSomeInvoice(); // it returns a Promise
        }),
        payment: morphit.transform('$.id', (value) => {
            return getSomePayment(); // it returns a Promise
        }),
    }),
})
.then((morph) => [
    console.log(morph);
    /*
        { orders: [ { product: {}, invoice: {}, payment: {} } ] }
    */
]);
```