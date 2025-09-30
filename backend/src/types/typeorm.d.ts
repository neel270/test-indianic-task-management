declare module 'typeorm' {
  export class Entity {
    constructor();
  }

  export class PrimaryGeneratedColumn {
    constructor(type?: string, options?: any);
  }

  export class Column {
    constructor(type?: string, options?: any);
  }

  export class CreateDateColumn {
    constructor(options?: any);
  }

  export class UpdateDateColumn {
    constructor(options?: any);
  }

  export class OneToMany {
    constructor(propertyName: string, options?: any);
  }

  export class ManyToOne {
    constructor(propertyName: string, options?: any);
  }

  export class JoinColumn {
    constructor(options?: any);
  }

  export class BaseEntity {
    static save<T>(target: T): Promise<T>;
    static find<T>(options?: any): Promise<T[]>;
    static findOne<T>(options?: any): Promise<T | undefined>;
    static findByIds<T>(ids: any[]): Promise<T[]>;
    static count<T>(options?: any): Promise<number>;
    static findAndCount<T>(options?: any): Promise<[T[], number]>;
  }

  export class Repository<T> {
    find(options?: any): Promise<T[]>;
    findOne(options?: any): Promise<T | undefined>;
    findByIds(ids: any[]): Promise<T[]>;
    count(options?: any): Promise<number>;
    findAndCount(options?: any): Promise<[T[], number]>;
    save(target: T): Promise<T>;
    remove(target: T): Promise<T>;
    query(query: string, parameters?: any[]): Promise<any>;
  }

  export class Connection {
    getRepository<T>(target: any): Repository<T>;
    close(): Promise<void>;
  }

  export class createConnection {
    static create(options: any): Promise<Connection>;
  }

  export function getConnection(): Connection;
  export function getRepository<T>(target: any): Repository<T>;
}
