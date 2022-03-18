/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import RCTDeviceEventEmitter from '../EventEmitter/RCTDeviceEventEmitter';
import NativeNetworkingIOS from './NativeNetworkingIOS';
import {type NativeResponseType} from './XMLHttpRequest';
import convertRequestBody, {type RequestBody} from './convertRequestBody';
import {type EventSubscription} from '../vendor/emitter/EventEmitter';

type RCTNetworkingEventDefinitions = $ReadOnly<{
  events: any,
}>;

let globalTimeout = 0;

const RCTNetworking = {
  addListener<K: $Keys<RCTNetworkingEventDefinitions>>(
    eventType: K,
    listener: (...$ElementType<RCTNetworkingEventDefinitions, K>) => mixed,
    context?: mixed,
  ): EventSubscription {
    return RCTDeviceEventEmitter.addListener(eventType, listener, context);
  },

  sendRequest(
    method: string,
    trackingName: string,
    url: string,
    headers: {...},
    data: RequestBody,
    responseType: NativeResponseType,
    incrementalUpdates: boolean,
    timeout: number,
    callback: (requestId: number) => void,
    withCredentials: boolean,
  ) {
    const body = convertRequestBody(data);
    NativeNetworkingIOS.sendRequest(
      {
        method,
        url,
        data: {...body, trackingName},
        headers,
        responseType,
        incrementalUpdates,
        timeout: timeout || globalTimeout,
        withCredentials,
      },
      callback,
    );
  },

  abortRequest(requestId: number) {
    NativeNetworkingIOS.abortRequest(requestId);
  },

  clearCookies(callback: (result: boolean) => void) {
    NativeNetworkingIOS.clearCookies(callback);
  },

  setTimeout(timeout: number) {
    this.globalTimeout = timeout;
  }
}

module.exports = RCTNetworking;
