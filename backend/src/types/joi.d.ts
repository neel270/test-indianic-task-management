declare module 'joi' {
  interface JoiObject {
    required(): this;
    optional(): this;
    allow(value: any): this;
    valid(...values: any[]): this;
    invalid(...values: any[]): this;
    min(limit: number): this;
    max(limit: number): this;
    email(): this;
    pattern(regex: RegExp): this;
    messages(messages: Record<string, string>): this;
  }

  interface JoiString extends JoiObject {
    length(limit: number): this;
    alphanum(): this;
    token(): this;
    uuid(): this;
    regex(pattern: RegExp): this;
    uri(): this;
    default(value: any): this;
  }

  interface JoiNumber extends JoiObject {
    integer(): this;
    positive(): this;
    negative(): this;
    greater(limit: number): this;
    less(limit: number): this;
    precision(limit: number): this;
  }

  interface JoiArray extends JoiObject {
    items(type: any): this;
    length(limit: number): this;
    min(limit: number): this;
    max(limit: number): this;
    unique(): this;
    single(): this;
  }

  interface JoiDate extends JoiObject {
    greater(date: Date | string): this;
    less(date: Date | string): this;
    min(date: Date | string): this;
    max(date: Date | string): this;
    iso(): this;
  }

  interface JoiBoolean extends JoiObject {}

  interface JoiRoot {
    object(schema?: Record<string, any>): JoiObject;
    string(): JoiString;
    number(): JoiNumber;
    array(): JoiArray;
    date(): JoiDate;
    boolean(): JoiBoolean;
    any(): JoiObject;
  }

  const joi: JoiRoot;
  export = joi;
}
