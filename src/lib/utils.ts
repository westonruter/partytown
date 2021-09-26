import {
  InstanceIdKey,
  InterfaceTypeKey,
  NodeNameKey,
  webWorkerCtx,
  WinIdKey,
} from './web-worker/worker-constants';
import { InterfaceType, MainWindowContext, PlatformInstanceId } from './types';

export const debug = (globalThis as any).partytownDebug;

export const isPromise = (v: any): v is Promise<unknown> => typeof v === 'object' && v && v.then;

export const toLower = (str: string) => str.toLowerCase();

export const toUpper = (str: string) => str.toUpperCase();

export const logMain = (winCtx: MainWindowContext, msg: string) => {
  if (debug) {
    let prefix: string;
    if (winCtx.$winId$ === TOP_WIN_ID) {
      prefix = `Main (${winCtx.$winId$}) 🌎`;
    } else {
      prefix = `Iframe (${winCtx.$winId$}) 👾`;
    }
    console.debug.apply(console, [
      `%c${prefix}`,
      `background: #717171; color: white; padding: 2px 3px; border-radius: 2px; font-size: 0.8em;`,
      msg,
    ]);
  }
};

export const logWorker = (msg: string) => {
  if (debug) {
    try {
      const config = webWorkerCtx.$config$;

      if (config.logStackTraces) {
        const frames = new Error().stack!.split('\n');
        const i = frames.findIndex((f) => f.includes('logWorker'));
        msg += '\n' + frames.slice(i + 1).join('\n');
      }

      console.debug.apply(console, [
        `%c${self.name}`,
        `background: #3498db; color: white; padding: 2px 3px; border-radius: 2px; font-size: 0.8em;`,
        msg,
      ]);
    } catch (e) {}
  }
};

export const logWorkerGetter = (
  target: any,
  memberPath: string[],
  rtn: any,
  isCached?: boolean
) => {
  if (debug && webWorkerCtx.$config$.logGetters) {
    try {
      if (target && target[WinIdKey] !== webWorkerCtx.$winId$) {
        return;
      }
      logWorker(
        `Get ${logTargetProp(target, memberPath)}, returned: ${logValue(memberPath, rtn)}${
          isCached ? ' (cached)' : ''
        }`
      );
    } catch (e) {}
  }
};

export const logWorkerSetter = (target: any, memberPath: string[], value: any) => {
  if (debug && webWorkerCtx.$config$.logSetters) {
    try {
      if (target && target[WinIdKey] !== webWorkerCtx.$winId$) {
        return;
      }
      logWorker(`Set ${logTargetProp(target, memberPath)}, value: ${logValue(memberPath, value)}`);
    } catch (e) {}
  }
};

export const logWorkerCall = (target: any, memberPath: string[], args: any[], rtn: any) => {
  if (debug && webWorkerCtx.$config$.logCalls) {
    try {
      if (target && target[WinIdKey] !== webWorkerCtx.$winId$) {
        return;
      }
      logWorker(
        `Call ${logTargetProp(target, memberPath)}(${args
          .map((v) => logValue(memberPath, v))
          .join(', ')}), returned: ${logValue(memberPath, rtn)}`
      );
    } catch (e) {}
  }
};

const logTargetProp = (target: any, memberPath: string[]) => {
  let n = '';
  if (target) {
    const instanceId = target[InstanceIdKey];
    if (instanceId === PlatformInstanceId.document) {
      n = 'document.';
    } else if (instanceId === PlatformInstanceId.documentElement) {
      n = 'document.documentElement.';
    } else if (instanceId === PlatformInstanceId.head) {
      n = 'document.head.';
    } else if (instanceId === PlatformInstanceId.body) {
      n = 'document.body.';
    } else if (instanceId === PlatformInstanceId.history) {
      n = 'history.';
    } else if (instanceId === PlatformInstanceId.localStorage) {
      n = 'localStorage.';
    } else if (instanceId === PlatformInstanceId.sessionStorage) {
      n = 'sessionStorage.';
    } else if (target.nodeType === 1) {
      n = toLower(target.nodeName) + '.';
    } else if (target[InterfaceTypeKey] === InterfaceType.TextNode) {
      n = 'node.';
    } else if (target[InterfaceTypeKey] === InterfaceType.Element && target[NodeNameKey]) {
      n = `<${toLower(target[NodeNameKey])}>`;
    } else {
      n = '¯\\_(ツ)_/¯';
    }
  }
  return (n += memberPath.join('.'));
};

/**
 * Helper just to have pretty console logs while debugging
 */
const logValue = (memberPath: string[], v: any): string => {
  const type = typeof v;
  if (type === 'boolean' || type === 'number' || v == null) {
    return JSON.stringify(v);
  }
  if (type === 'string') {
    if (memberPath.includes('cookie')) {
      return JSON.stringify(v.substr(0, 10) + '...');
    }
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) {
    return `[${v.map(logValue).join(', ')}]`;
  }
  if (type === 'object') {
    const instanceId = v[InstanceIdKey];
    if (typeof instanceId === 'number') {
      if (instanceId === PlatformInstanceId.body) {
        return `<body>`;
      }
      if (instanceId === PlatformInstanceId.document) {
        return `#document`;
      }
      if (instanceId === PlatformInstanceId.documentElement) {
        return `<html>`;
      }
      if (instanceId === PlatformInstanceId.head) {
        return `<head>`;
      }
      if (instanceId === PlatformInstanceId.localStorage) {
        return `[localStorage]`;
      }
      if (instanceId === PlatformInstanceId.sessionStorage) {
        return `[sessionStorage]`;
      }
      if (instanceId === PlatformInstanceId.window) {
        return `[window]`;
      }
      if (v[InterfaceTypeKey] === InterfaceType.TextNode) {
        return `#text`;
      }
      if (v[InterfaceTypeKey] === InterfaceType.Element && v[NodeNameKey]) {
        return `<${toLower(v[NodeNameKey])}>`;
      }
      return 'unknown instance obj';
    }
    if (v[Symbol.iterator]) {
      return `[${Array.from(v)
        .map((i) => logValue(memberPath, i))
        .join(', ')}]`;
    }
    if ('value' in v) {
      return JSON.stringify(v.value);
    }
    return JSON.stringify(v);
  }
  if (isPromise(v)) {
    return `Promise`;
  }
  if (type === 'function') {
    return `ƒ() ${v.name || ''}`.trim();
  }

  return `¯\\_(ツ)_/¯ ${String(v)}`.trim();
};

export const len = (obj: { length: number }) => obj.length;

export const getConstructorName = (obj: { constructor?: { name?: string } } | undefined | null) =>
  (obj && obj.constructor && obj.constructor.name) || '';

export const noop = () => {};

const startsWith = (str: string, val: string) => str.startsWith(val);

export const isValidMemberName = (memberName: string) => {
  if (startsWith(memberName, 'webkit') || startsWith(memberName, 'toJSON')) {
    return false;
  } else if (startsWith(memberName, 'on') && toLower(memberName) === memberName) {
    return false;
  } else {
    return true;
  }
};

export const nextTick = (cb: Function, ms?: number) => setTimeout(cb, ms);
export const EMPTY_ARRAY = [];

export const PT_PROXY_URL = `proxytown`;
export const PT_INITIALIZED_EVENT = `ptinit`;
export const PT_SCRIPT_TYPE = `text/partytown`;

export const PT_SCRIPT = `<script src="/~partytown/partytown${
  debug ? '.debug' : ''
}.js" async defer></script>`;

export const TOP_WIN_ID = 1;

export const randomId = () => Math.round(Math.random() * 9999999999 + PlatformInstanceId.body);
