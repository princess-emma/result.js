const config = require('../config.json');
const $ok = Symbol('ok');
const showHelpLink =
	process.env.RESULTJS_NO_HELP_LINK ||
	process.argv.some(arg => arg == '--resultjs-no-help-link');

class ResultError extends Error {
	public static unwrap() {
		return new this("Cannot unwrap an error variant.", '01')
	}
	public static unwrapErr() {
		return new this("Could not unwrap err, result was ok.", '02')
	}

	constructor(message: string, code: string) {
		super(message + (showHelpLink ? '' : ' Read more here: ' +  config.host + config.errorPath.replace(/{code}/g, code)))
	}
}


class Result<R, E> {
	public static match = <R, E>(result: Result<R, E>) => <T>(ok: (data: R) => T, err: (data: E) => T) => result.match(ok, err);
	public static try<R, E extends Error>(fn: () => R): Result<R, E> {
		try {
			return Result.Ok<R, E>(fn());
		} catch(e) {
			return Result.Err<R, E>(e);
		}
	}
	public static async asyncTry<R, E extends Error>(fn: () => Promise<R>): Promise<Result<R, E>> {
		try {
			return Result.Ok<R, E>(await fn());
		} catch(e) {
			return Result.Err<R, E>(e);
		}
	}

	public static Ok<R, E>(data: R): Result<R, E>;
	public static Ok<R, E extends void>(): Result<R, E>;
	public static Ok<R, E>(data?: R) {
		return new Result<R, E>(true, data);
	}
	public static Err<R, E>(data: E): Result<R, E>;
	public static Err<R, E extends void>(): Result<R, E>;
	public static Err<R, E>(data?: E): Result<R, E> {
		return new Result<R, E>(false, data);
	}

	readonly [$ok]: boolean;
	private readonly data: R | E;
	private constructor(state: boolean, data: R | E) {
		this[$ok] = state;
		this.data = data;
	}
	public unwrap(): R {
		if(this[$ok]) return this.data as R;
		else throw ResultError.unwrap();
	}
	public unwrapOr(_default: R): R {
		return this[$ok]
			? this.data as R
			: _default
	}
	public unwrapErr(): E {
		if(!this[$ok]) return this.data as E;
		else throw ResultError.unwrapErr();
	}
	public match<T>(ok: (data: R) => T, err: (data: E) => T): T {
		return (this[$ok] ? ok : err)(this.data as any);
	}

	public ifOk(fn: (result?: R) => void): this {
		if(this[$ok]) fn(this.data as R);

		return this;
	}
	public ifErr(fn: (error?: E) => void): this {
		if(!this[$ok]) fn(this.data as E);

		return this;
	}
}

export = Result;
