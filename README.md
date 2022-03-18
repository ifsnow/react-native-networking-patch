[![NPM Version][npm-image]][npm-url]

# What is this for?

React Native uses 6 event listeners to process networking events. For each request, these 6 listeners are registered and removed whenever processing. This is not the most effective approach. This patch makes RN's networking module work more efficiently.

### # Performance Improvement
It improves performance using only one event for each request. Because bridge communication is reduced, it's more efficient and improves overall app performance.

The following bridge communications occur for each `fetch` request.
```javascript
JS->N : Networking.addListener(["didSendNetworkData"])
JS->N : Networking.addListener(["didReceiveNetworkResponse"])
JS->N : Networking.addListener(["didReceiveNetworkData"])
JS->N : Networking.addListener(["didReceiveNetworkIncrementalData"])
JS->N : Networking.addListener(["didReceiveNetworkDataProgress"])
JS->N : Networking.addListener(["didCompleteNetworkResponse"])
JS->N : Networking.sendRequest([{"method":"GET","url":"...."....])
N->JS : <callback for Networking.sendRequest>([2])
N->JS : RCTDeviceEventEmitter.emit(["didReceiveNetworkResponse", ....])
N->JS : RCTDeviceEventEmitter.emit(["didReceiveNetworkData", ...])
N->JS : RCTDeviceEventEmitter.emit(["didCompleteNetworkResponse", ...])
JS->N : Networking.removeListeners([1])
JS->N : Networking.removeListeners([1])
JS->N : Networking.removeListeners([1])
JS->N : Networking.removeListeners([1])
JS->N : Networking.removeListeners([1])
JS->N : Networking.removeListeners([1])
```

The patched version looks like this.
```javascript
JS->N : Networking.addListener(["events"])
JS->N : Networking.sendRequest([{"method":"GET","url":"...."....])
N->JS : <callback for Networking.sendRequest>([2])
N->JS : RCTDeviceEventEmitter.emit(["events", ....])
N->JS : RCTDeviceEventEmitter.emit(["events", ...])
N->JS : RCTDeviceEventEmitter.emit(["events", ...])
JS->N : Networking.removeListeners([1])
```

Other optimizations are also included.

### # Global Timeout
`fetch` has no built-in timeout option. As you know, there are many workarounds such as using `XMLHttpRequest` API, `AbortController` and `setTimeout` + `Promise`. I want a simple and easy way. Now, you can set a global timeout without these workarounds.

```javascript
// RN >= 0.62
import { Networking } from 'react-native';

// RN < 0.62
// import Networking from 'react-native/Libraries/Network/RCTNetworking';

// Setting default global timeout. You only need to set it once.
Networking.setTimeout(3000);

// After 3 seconds, a timeout exception is thrown.
async function getItem() {
  let item = null;

  try {
    const response = await fetch(....);
    item = await response.json();
  } catch (e) {
    console.error(e);
  }

  return item;
}

// `axios` works with a 10 second timeout, not 3 seconds.
async function getLongItem() {
  const instance = axios.create({
    baseURL: '...',
    timeout: 10000,
  });
  ....
}
```

# Usage

### Requirement
It works with v0.63.2 or higher of RN. If not, please upgrade to the latest version. Of course, it works on `Expo`.

### Install
Once installed, react-native is automatically patched.
```bash
yarn add react-native-networking-patch --dev
```

**If you're using RN v0.63.x ~ v0.65.0, You must use the version below.**
- RN v0.65.0, RN v0.64.3
```bash
yarn add react-native-networking-patch@1.2.0 --dev
```

- RN v0.64.2
```bash
yarn add react-native-networking-patch@1.1.8 --dev
```

- RN v0.64.0
```bash
yarn add react-native-networking-patch@1.1.7 --dev
```

- RN v0.63.x
```bash
yarn add react-native-networking-patch@1.1.6 --dev
```

`prepare` should be added to prevent this patch from being restored whenever packages are changed.
```javascript
// package.json
{
  ...
  "scripts": {
    ...,
    "prepare": "yarn rn-networking-patch"
  }
}
```

If you were already using `prepare`, you can add the patch script later.
```javascript
"prepare": "yarn jetify; yarn rn-networking-patch"
```

### Execute manually
You can execute the patch manually with the command below.
```bash
yarn rn-networking-patch
```

### Uninstall
Just delete the command you added to `prepare` and remove `react-native-networking-patch` package.

[npm-image]: https://img.shields.io/npm/v/react-native-networking-patch.svg?style=flat-square
[npm-url]: https://npmjs.org/package/react-native-networking-patch