1. What is the difference between var, let, and const?
var is function-scoped and can be re-declared; it’s hoisted and initialized as undefined.
let and const are block-scoped; let can be reassigned, const cannot. They’re hoisted but not usable before declaration (TDZ).

2. What is the difference between map(), forEach(), and filter()?
map() returns a new array of the same length with transformed items.
forEach() just loops and returns undefined (use for side effects). filter() returns a new array with items that pass a test.

3. What are arrow functions in ES6?
Arrow functions are a shorter way to write functions: const add = (a,b) => a+b.
They don’t have their own this or arguments; this is lexically bound, which helps in callbacks.

4. How does destructuring assignment work in ES6?
Destructuring lets you pull values from arrays/objects into variables easily: const {name} = user;.
You can set defaults, rename keys, and even swap values: [a, b] = [b, a].

5. Explain template literals in ES6. How are they different from string concatenation?
Template literals use backticks and ${} to embed expressions: `Hello, ${name}!`.
They support multi-line strings and are cleaner than + concatenation, improving readability.
