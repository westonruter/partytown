import { getUrl } from './worker-exec';
import { setInstanceStateValue } from './worker-state';
import { setter } from './worker-proxy';
import { StateProp } from '../types';
import { WorkerElement } from './worker-element';

export class WorkerAnchorElement extends WorkerElement {
  get hash() {
    return getUrl(this).hash;
  }
  get host() {
    return getUrl(this).host;
  }
  get hostname() {
    return getUrl(this).hostname;
  }
  get href() {
    return getUrl(this) + '';
  }
  set href(href: string) {
    setInstanceStateValue(this, StateProp.href, href);
    setter(this, ['href'], href);
  }
  get origin() {
    return getUrl(this).origin;
  }
  get pathname() {
    return getUrl(this).pathname;
  }
  get port() {
    return getUrl(this).port;
  }
  get protocol() {
    return getUrl(this).protocol;
  }
  get search() {
    return getUrl(this).search;
  }
}
