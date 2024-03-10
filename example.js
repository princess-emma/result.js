const Result = require('@aurora60/result.js');
const { Ok, Err } = Result;

/*****************************************************************************/

// This db query will fail.
function dangerousDBQuery1() {
	throw Error('Ssshhht! Be quiet, the database is sleeping!');
}

// This db query will work.
function dangerousDBQuery2() {
	return 23;
}

const query1 = Result.try(dangerousDBQuery1)
	// If its the Err variant, this will be executed.
	.ifErr(e => console.warn('DB error:', e.message, '\nUsing default...'))
	// If it is the Ok variant, this will be executed instead.
	.ifOk(v => console.log('Congrats, you woke up the DB. Here is your value:', v))
	// Unwrap the value and define a default to use if it fails.
	.unwrapOr(0);
const query2 = Result.try(dangerousDBQuery2)
	// the ifs are not required and can be skipped.
	.ifErr(e => console.warn('DB error:', e.message, '\nUsing default...'))
	.ifOk(v => console.log('Congrats, you woke up the DB. Here is your value:', v))
	.unwrapOr(0);

// This would throw an error since there is no default.
// const query1 = Result.try(dangerousDBQuery1).unwrap();

console.log(query1); // expected output: 0
console.log(query2); // expected output: 23

/*****************************************************************************/

/**
 * Divide except if b is equal to 0.
 * @param {number} a Divident.
 * @param {number} b Divisor.
 * @returns {Result<number, void>} The result of the operation.
 */
function division(a, b) {
	if(b === 0) return Err();

	return Ok(a / b);
}

const message1 = division(4, 2).match(
	value => `The result is ${value}.`,
	() => `Cannot divide by zero.`
);

const message2 = division(4, 0).match(
	value => `The result is ${value}.`,
	() => `Cannot divide by zero.`
);

// Expected output: The result is 2.
console.log(message1);

// Expected output: Cannot divide by zero.
console.log(message2);
