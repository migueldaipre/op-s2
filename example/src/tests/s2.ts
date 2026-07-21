import { del, get, set, ACCESSIBILITY } from '@op-engineering/op-s2';
import { describe, expect, it } from '@op-engineering/op-test';

// Toggle to `true` when running on a simulator/emulator (where biometrics are
// not enrolled and the prompt short-circuits with "Biometrics not available").
// Leave `false` on physical devices — the Face ID / passcode prompt would
// otherwise block the test suite waiting for user interaction.
const RUN_BIOMETRIC_TESTS = true;

describe('securely storage/retrieve', () => {
  it('set/get', () => {
    const key = 'key1';
    const { error: setError } = set({
      key,
      value: 'myTestValue',
    });

    if (setError) {
      console.warn(setError);
    }
    expect(setError).toBe(undefined);

    const { value, error } = get({
      key,
    });

    expect(error).toBe(undefined);
    expect(value).toEqual('myTestValue');
  });

  it('get not set returns empty', () => {
    const key = 'key2';
    const { value, error } = get({
      key,
    });

    expect(value).toBe(undefined);
    expect(error).toEqual('[op-s2] Item not found');
  });

  it('Setting not a string gives error', () => {
    const key = 'key3';

    const { error } = set({
      key,
      // @ts-ignore
      value: 123,
    });

    expect(error).toBe('Value property is not a string');
  });

  it('Deletes a key', () => {
    const key = 'key4';

    set({
      key,
      value: 'myTestValue',
    });

    let { value, error } = get({
      key,
    });

    expect(error).toBe(undefined);
    expect(value).toEqual('myTestValue');

    del({
      key,
    });

    let { value: val2, error: error2 } = get({
      key,
    });

    expect(val2).toBe(undefined);
    expect(error2).toEqual('[op-s2] Item not found');
  });
});

describe('accessibility option (iOS)', () => {
  it('set/get with WHEN_UNLOCKED accessibility', () => {
    const key = 'key5';

    const { error: setError } = set({
      key,
      value: 'myValue',
      accessibility: ACCESSIBILITY.WHEN_UNLOCKED,
    });

    expect(setError).toBe(undefined);

    const { value, error } = get({ key });
    expect(error).toBe(undefined);
    expect(value).toEqual('myValue');

    del({ key });
  });

  it('set/get with WHEN_PASSCODE_SET_THIS_DEVICE_ONLY accessibility', () => {
    const key = 'key6';

    const { error: setError } = set({
      key,
      value: 'myValue',
      accessibility: ACCESSIBILITY.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    });

    expect(setError).toBe(undefined);

    const { value, error } = get({ key });
    expect(error).toBe(undefined);
    expect(value).toEqual('myValue');

    del({ key });
  });

  it('set/get with AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY accessibility', () => {
    const key = 'key7';

    const { error: setError } = set({
      key,
      value: 'myValue',
      accessibility: ACCESSIBILITY.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });

    expect(setError).toBe(undefined);

    const { value, error } = get({ key });
    expect(error).toBe(undefined);
    expect(value).toEqual('myValue');

    del({ key });
  });

  it('set/get with WHEN_UNLOCKED_THIS_DEVICE_ONLY accessibility (covers int code 6)', () => {
    const key = 'key_unlocked_this_device_only';

    const { error: setError } = set({
      key,
      value: 'myValue',
      accessibility: ACCESSIBILITY.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    expect(setError).toBe(undefined);

    const { value, error } = get({ key });
    expect(error).toBe(undefined);
    expect(value).toEqual('myValue');

    del({ key });
  });

  it('set/get with ALWAYS accessibility', () => {
    const key = 'key_always';

    const { error: setError } = set({
      key,
      value: 'myValue',
      accessibility: ACCESSIBILITY.ALWAYS,
    });

    expect(setError).toBe(undefined);

    const { value, error } = get({ key });
    expect(error).toBe(undefined);
    expect(value).toEqual('myValue');

    del({ key });
  });

  it('set/get with ALWAYS_THIS_DEVICE_ONLY accessibility', () => {
    const key = 'key_always_this_device_only';

    const { error: setError } = set({
      key,
      value: 'myValue',
      accessibility: ACCESSIBILITY.ALWAYS_THIS_DEVICE_ONLY,
    });

    expect(setError).toBe(undefined);

    const { value, error } = get({ key });
    expect(error).toBe(undefined);
    expect(value).toEqual('myValue');

    del({ key });
  });
});

if (RUN_BIOMETRIC_TESTS) {
  describe('biometricPrompt options', () => {
    it('set/get with only title/subtitle (defaults: no device credential, strong biometric)', () => {
      const key = 'key8';

      const { error: setError } = set({
        key,
        value: 'myValueDefault',
        withBiometrics: true,
        biometricPrompt: {
          title: 'Default title',
          subtitle: 'Default subtitle',
        },
      });

      expect(setError).toBe(undefined);

      const { value, error } = get({
        key,
        withBiometrics: true,
        biometricPrompt: {
          title: 'Default read',
          subtitle: 'Default read subtitle',
        },
      });

      expect(error).toBe(undefined);
      expect(value).toEqual('myValueDefault');

      del({ key });
    });

    it('set/get with allowDeviceCredential: true', () => {
      const key = 'key9';

      const { error: setError } = set({
        key,
        value: 'myValueDeviceCredTrue',
        withBiometrics: true,
        biometricPrompt: {
          title: 'Auth with device credential',
          subtitle: 'Strong biometric OR passcode',
          allowDeviceCredential: true,
          allowBiometricWeak: false,
        },
      });

      expect(setError).toBe(undefined);

      const { value, error } = get({
        key,
        withBiometrics: true,
        biometricPrompt: {
          title: 'Read with device credential',
          subtitle: 'Strong biometric OR passcode',
          allowDeviceCredential: true,
          allowBiometricWeak: false,
        },
      });

      expect(error).toBe(undefined);
      expect(value).toEqual('myValueDeviceCredTrue');

      del({ key });
    });

    it('set/get with allowDeviceCredential: false', () => {
      const key = 'key10';

      const { error: setError } = set({
        key,
        value: 'myValueDeviceCredFalse',
        withBiometrics: true,
        biometricPrompt: {
          title: 'Auth strong biometric only',
          subtitle: 'No passcode fallback',
          allowDeviceCredential: false,
          allowBiometricWeak: false,
        },
      });

      expect(setError).toBe(undefined);

      const { value, error } = get({
        key,
        withBiometrics: true,
        biometricPrompt: {
          title: 'Read strong biometric only',
          subtitle: 'No passcode fallback',
          allowDeviceCredential: false,
          allowBiometricWeak: false,
        },
      });

      expect(error).toBe(undefined);
      expect(value).toEqual('myValueDeviceCredFalse');

      del({ key });
    });

    it('set/get with allowBiometricWeak: true', () => {
      const key = 'key11';

      const { error: setError } = set({
        key,
        value: 'myValueWeakTrue',
        withBiometrics: true,
        biometricPrompt: {
          title: 'Auth weak biometric',
          subtitle: 'Class 2 biometrics accepted',
          allowDeviceCredential: false,
          allowBiometricWeak: true,
        },
      });

      expect(setError).toBe(undefined);

      const { value, error } = get({
        key,
        withBiometrics: true,
        biometricPrompt: {
          title: 'Read weak biometric',
          subtitle: 'Class 2 biometrics accepted',
          allowDeviceCredential: false,
          allowBiometricWeak: true,
        },
      });

      expect(error).toBe(undefined);
      expect(value).toEqual('myValueWeakTrue');

      del({ key });
    });

    it('set/get with allowBiometricWeak: false', () => {
      const key = 'key12';

      const { error: setError } = set({
        key,
        value: 'myValueWeakFalse',
        withBiometrics: true,
        biometricPrompt: {
          title: 'Auth strong biometric only',
          subtitle: 'Class 3 biometrics required',
          allowDeviceCredential: false,
          allowBiometricWeak: false,
        },
      });

      expect(setError).toBe(undefined);

      const { value, error } = get({
        key,
        withBiometrics: true,
        biometricPrompt: {
          title: 'Read strong biometric only',
          subtitle: 'Class 3 biometrics required',
          allowDeviceCredential: false,
          allowBiometricWeak: false,
        },
      });

      expect(error).toBe(undefined);
      expect(value).toEqual('myValueWeakFalse');

      del({ key });
    });

    it('set/get with allowDeviceCredential: true and allowBiometricWeak: true', () => {
      const key = 'key13';

      const { error: setError } = set({
        key,
        value: 'myValueBoth',
        withBiometrics: true,
        biometricPrompt: {
          title: 'Auth weak biometric + passcode',
          subtitle: 'Most permissive combination',
          allowDeviceCredential: true,
          allowBiometricWeak: true,
        },
      });

      expect(setError).toBe(undefined);

      const { value, error } = get({
        key,
        withBiometrics: true,
        biometricPrompt: {
          title: 'Read weak biometric + passcode',
          subtitle: 'Most permissive combination',
          allowDeviceCredential: true,
          allowBiometricWeak: true,
        },
      });

      expect(error).toBe(undefined);
      expect(value).toEqual('myValueBoth');

      del({ key });
    });

    it('set/get with withBiometrics: true and NO biometricPrompt (uses all defaults)', () => {
      const key = 'key14';

      // Only withBiometrics is passed — no biometricPrompt object at all.
      // The native layer should fall back to:
      //   title = "Please authenticate", subtitle = "", negativeButtonText = "Cancel",
      //   allowDeviceCredential = false, allowBiometricWeak = false
      const { error: setError } = set({
        key,
        value: 'myValueNoPrompt',
        withBiometrics: true,
      });

      expect(setError).toBe(undefined);

      const { value, error } = get({
        key,
        withBiometrics: true,
      });

      expect(error).toBe(undefined);
      expect(value).toEqual('myValueNoPrompt');

      del({ key });
    });

    it('set/get with empty title in biometricPrompt (falls back to default)', () => {
      // Regression: an empty `title` would crash BiometricPrompt on Android
      // because setTitle requires a non-empty CharSequence. The native layer
      // must treat "" the same as a missing property.
      const key = 'key_empty_title';

      const { error: setError } = set({
        key,
        value: 'myValueEmptyTitle',
        withBiometrics: true,
        biometricPrompt: {
          title: '',
          negativeButtonText: '',
          allowDeviceCredential: true,
        },
      });

      expect(setError).toBe(undefined);

      const { value, error } = get({
        key,
        withBiometrics: true,
        biometricPrompt: {
          title: '',
          allowDeviceCredential: true,
        },
      });

      expect(error).toBe(undefined);
      expect(value).toEqual('myValueEmptyTitle');

      del({ key });
    });
  });
}
