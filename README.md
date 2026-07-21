![Header](Header.png)

<pre align="center">yarn add @op-engineering/op-s2</pre>

<div align="center">
  <a align="center" href="https://github.com/ospfranco?tab=followers">
    <img src="https://img.shields.io/github/followers/ospfranco?label=Follow%20%40ospfranco&style=social" />
  </a>
  <br />
  <a align="center" href="https://twitter.com/ospfranco">
    <img src="https://img.shields.io/twitter/follow/ospfranco?label=Follow%20%40ospfranco&style=social" />
  </a>
</div>
<br />

---

Modern encryption module for React Native. Uses `Keychain` on iOS and the [official libraries](https://developer.android.com/jetpack/androidx/releases/security), `KeyStore`/`EncryptedSharedPreferences`, on Android.

Created by [ospfranco](https://github.com/sponsors/ospfranco).

Join the Discord

https://discord.gg/W9XmqCQCKP

## Motivation

Other React Native stores hand-roll their encryption, via OpenSSL (does not use hardware when possible) or raw implementation of algorithms (outdated algorithms or improper implementations).

The benefit of using the official implementations is the use of encryption hardware on-device when possible. Using the hardware chips provides yet another layer of security to prevent tampering with the data as it is being decrypted/encrypted/stored.

## Examples

```ts
import { get, set, ACCESSIBILITY } from '@op-engineering/op-s2';

const { error } = set({
  key: 'myKey',
  value: 'myValue',
  // Only valid for iOS you have more control when to prompt for authentication
  accessibility: ACCESSIBILITY.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
  // OR works for both iOS and Android
  withBiometrics: true,
  // Optional — customize the biometric / device-credential prompt
  biometricPrompt: {
    title: 'Unlock to continue',
    subtitle: 'Authenticate to access your data',
    negativeButtonText: 'Cancel',
    allowDeviceCredential: true,
    allowBiometricWeak: false,
  },
});

const { error, value } = get({
  key: 'myValue',
  withBiometrics: true,
  biometricPrompt: {
    title: 'Unlock to read',
    allowDeviceCredential: true,
  },
});

const { error } = del({
  key: 'myValue',
  withBiometrics: true,
  biometricPrompt: {
    title: 'Unlock to delete',
  },
});
```

### iOS Accessibility

On iOS you can specify an accessibility value which allows you to customize when the data is readable. It is mutually exclusive with `withBiometrics`. So pick one or the other.

| Key                                 | Explanation                                                                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AFTER_FIRST_UNLOCK                  | The data in the keychain item cannot be accessed after a restart until the device has been unlocked once by the user. This may be useful if you need to access the item when the phone is locked. |
| AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY | Similar to AFTER_FIRST_UNLOCK, except the entry is not migrated to a new device when restoring from a backup.                                                                                     |
| ALWAYS                              | The data in the keychain item can always be accessed regardless of whether the device is locked. This is the least secure option.                                                                 |
| ALWAYS_THIS_DEVICE_ONLY             | Similar to ALWAYS, except the entry is not migrated to a new device when restoring from a backup.                                                                                                 |
| WHEN_PASSCODE_SET_THIS_DEVICE_ONLY  | Similar to WHEN_UNLOCKED_THIS_DEVICE_ONLY, except the user must have set a passcode to store an entry. If the user removes their passcode, the entry will be deleted.                             |
| WHEN_UNLOCKED                       | The data in the keychain item can be accessed only while the device is unlocked by the user.                                                                                                      |
| WHEN_UNLOCKED_THIS_DEVICE_ONLY      | Similar to WHEN_UNLOCKED, except the entry is not migrated to a new device when restoring from a backup.                                                                                          |

### With biometrics

When using biometric info you need to include `NSFaceIDUsageDescription` in your info.plist, which will prompt the user for permission to use faceID.

#### Customizing the prompt

Pass a `biometricPrompt` object to `set` / `get` / `del` to customize the auth UI and choose which authenticators are accepted:

| Field                   | Description                                                                                                                                                                                   | Default                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `title`                 | Prompt title                                                                                                                                                                                  | `"Please authenticate"` |
| `subtitle`              | Prompt subtitle. iOS has no native subtitle slot so it is appended to the title.                                                                                                              | `""`                    |
| `negativeButtonText`    | Label of the negative (cancel) button. Omitted on Android when `allowDeviceCredential: true` because the device-credential button takes that slot on API < 30.                                | `"Cancel"`              |
| `allowDeviceCredential` | Allow the device passcode (PIN/pattern/password) as an alternative to biometrics. On iOS adds `kSecAccessControlDevicePasscode`; on Android OR's in `DEVICE_CREDENTIAL`.                      | `false`                 |
| `allowBiometricWeak`    | Allow Class 2 (weak) biometrics. On iOS uses `kSecAccessControlBiometryAny` instead of `kSecAccessControlBiometryCurrentSet`; on Android uses `BIOMETRIC_WEAK` instead of `BIOMETRIC_STRONG`. | `false`                 |

The resulting Android authenticator combinations are:

| `allowDeviceCredential` | `allowBiometricWeak` | Android `BiometricManager.Authenticators` |
| ----------------------- | -------------------- | ----------------------------------------- |
| `false`                 | `false`              | `BIOMETRIC_STRONG`                        |
| `true`                  | `false`              | `BIOMETRIC_STRONG \| DEVICE_CREDENTIAL`   |
| `false`                 | `true`               | `BIOMETRIC_WEAK`                          |
| `true`                  | `true`               | `BIOMETRIC_WEAK \| DEVICE_CREDENTIAL`     |

If you pass `withBiometrics: true` without a `biometricPrompt` object at all, the prompt falls back to the defaults listed above.

## Secure Enclave

The library already uses the [Secure Enclave](https://support.apple.com/en-gb/guide/security/sec59b0b31ff/web) to encrypt the data before saving it on the keychain. However, it is not possible to store data directly on the Secure Enclave as it is meant to store the private part of asymmetrical keys, meaning data saved there cannot be retrieved to user space.

## Android Quirks

The official Android crypto implementation uses hardware-backed-up encryption when possible. However, it will depend on the vendor to use the hardware chips or not, there is not much that can be done about that.

The library currently depends on the latest available versions and is periodically updated to support fixes and updates.

## TODO

- [-] Add `getAllKeys`, `getAllItems` and `deleteAllItems` methods (Not possible on iOS)
- [ ] Device testing list
- [ ] Security audits

## License

MIT License
