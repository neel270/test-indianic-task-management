declare module 'json2csv' {
  interface Field {
    label?: string;
    value: string | ((row: any) => any);
    default?: any;
  }

  interface Options {
    fields?: Array<string | Field>;
    transforms?: Array<(row: any) => any>;
    formatters?: {
      [key: string]: (value: any) => string;
    };
    defaultValue?: string;
    delimiter?: string;
    eol?: string;
    header?: boolean;
    includeEmptyRows?: boolean;
    withBOM?: boolean;
    includeHeaders?: boolean;
  }

  interface Parser {
    parse(data: any[]): string;
  }

  function parse(data: any[], options?: Options): string;
  function parseAsync(data: any[], options?: Options): Promise<string>;

  class Parser {
    constructor(options?: Options);
    parse(data: any[]): string;
  }

  export = {
    parse,
    parseAsync,
    Parser
  };
}

declare module 'json2csv/dist/json2csv.umd' {
  import json2csv = require('json2csv');
  export = json2csv;
}
