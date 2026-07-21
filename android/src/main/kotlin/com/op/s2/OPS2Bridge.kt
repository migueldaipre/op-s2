package com.op.s2

import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import java.util.concurrent.Executor
import java.util.concurrent.Semaphore
import android.util.Log

class OPS2Bridge(reactContext: ReactApplicationContext) {
  private val context = reactContext;
  private val cryptoManager = CryptoManager(reactContext)
  private external fun initialize(jsiPtr: Long)

  private fun buildAuthenticators(options: BiometricPromptOptions): Int {
    var authenticators = 0
    if (options.allowBiometricWeak) {
      authenticators = authenticators or BiometricManager.Authenticators.BIOMETRIC_WEAK
    } else {
      authenticators = authenticators or BiometricManager.Authenticators.BIOMETRIC_STRONG
    }
    if (options.allowDeviceCredential) {
      authenticators = authenticators or BiometricManager.Authenticators.DEVICE_CREDENTIAL
    }
    return authenticators
  }

  private fun runBiometricPrompt(options: BiometricPromptOptions): TSSAuthenticationCallback {
    val activity = this.context.currentActivity
    val executor: Executor = ContextCompat.getMainExecutor(this.context)

    val authenticators = buildAuthenticators(options)

    val promptBuilder = BiometricPrompt.PromptInfo.Builder()
      .setTitle(options.title)
      .setSubtitle(options.subtitle)
      .setAllowedAuthenticators(authenticators)

    // setNegativeButtonText is incompatible with DEVICE_CREDENTIAL on API < 30.
    // Only set it when the user supplied one and we are not relying on the device
    // credential as the implicit "negative" button.
    if (options.negativeButtonText.isNotEmpty() && !options.allowDeviceCredential) {
      promptBuilder.setNegativeButtonText(options.negativeButtonText)
    }

    val promptInfo = promptBuilder.build()

    val mutex = Semaphore(0)
    val authenticationCallback = TSSAuthenticationCallback(mutex)

    activity?.runOnUiThread {
      val biometricPrompt = BiometricPrompt(activity as AppCompatActivity, executor, authenticationCallback)
      biometricPrompt.authenticate(promptInfo)
    }

    try {
      mutex.acquire()
    } catch (e: Exception) {
      Log.e("OPS2", "Interrupted mutex exception", e)
    }

    return authenticationCallback
  }

  fun setItem(key: String, value: String, withBiometrics: Boolean, options: BiometricPromptOptions) {
    if (withBiometrics) {
      val authenticationCallback = runBiometricPrompt(options)

      if (authenticationCallback.isAuthenticated) {
        cryptoManager.set(key, value, true)
      } else {
        throw Exception(authenticationCallback.errorStr)
      }
    } else {
      cryptoManager.set(key, value)
    }
  }

  fun getItem(key: String, withBiometrics: Boolean, options: BiometricPromptOptions): String? {
    if (withBiometrics) {
      val authenticationCallback = runBiometricPrompt(options)

      if (authenticationCallback.isAuthenticated) {
        return cryptoManager.get(key, true)
      } else {
        throw Exception(authenticationCallback.errorStr)
      }
    } else {
      return cryptoManager.get(key)
    }
  }

  fun deleteItem(key: String, withBiometrics: Boolean, options: BiometricPromptOptions) {
    if (withBiometrics) {
      val authenticationCallback = runBiometricPrompt(options)

      if (authenticationCallback.isAuthenticated) {
        cryptoManager.delete(key, true)
      } else {
        throw Exception(authenticationCallback.errorStr)
      }
    } else {
      cryptoManager.delete(key)
    }
  }

  fun install(context: ReactContext) {
      val jsContextPointer = context.javaScriptContextHolder!!.get()

      initialize(
          jsContextPointer,
      )
  }
}
