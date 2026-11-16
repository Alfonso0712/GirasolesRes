import zlib from 'node:zlib';
import wt from 'node:worker_threads';
import { syncBuiltinESMExports } from 'node:module';

if (typeof zlib.createZstdDecompress !== 'function') {
  zlib.createZstdDecompress = zlib.createGunzip;
}

if (typeof wt.markAsUncloneable !== 'function') {
  wt.markAsUncloneable = () => {};
}

if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new this((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

const IterProto = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
if (typeof globalThis.Iterator === 'undefined') {
  class Iterator {
    [Symbol.iterator]() {
      return this;
    }
  }
  Object.setPrototypeOf(Iterator.prototype, IterProto);
  globalThis.Iterator = Iterator;
}

for (const TargetProto of [IterProto, globalThis.Iterator.prototype]) {
  if (typeof TargetProto.find !== 'function') {
    TargetProto.find = function (fn) {
      let i = 0;
      for (const v of this) {
        if (fn(v, i++)) return v;
      }
      return undefined;
    };
  }
  if (typeof TargetProto.filter !== 'function') {
    TargetProto.filter = function* (fn) {
      let i = 0;
      for (const v of this) {
        if (fn(v, i++)) yield v;
      }
    };
  }
  if (typeof TargetProto.map !== 'function') {
    TargetProto.map = function* (fn) {
      let i = 0;
      for (const v of this) {
        yield fn(v, i++);
      }
    };
  }
  if (typeof TargetProto.toArray !== 'function') {
    TargetProto.toArray = function () {
      const arr = [];
      for (const v of this) arr.push(v);
      return arr;
    };
  }
  if (typeof TargetProto.some !== 'function') {
    TargetProto.some = function (fn) {
      let i = 0;
      for (const v of this) {
        if (fn(v, i++)) return true;
      }
      return false;
    };
  }
  if (typeof TargetProto.every !== 'function') {
    TargetProto.every = function (fn) {
      let i = 0;
      for (const v of this) {
        if (!fn(v, i++)) return false;
      }
      return true;
    };
  }
}

syncBuiltinESMExports();
