package com.op.s2

data class BiometricPromptOptions(
    val title: String,
    val subtitle: String,
    val negativeButtonText: String,
    val allowDeviceCredential: Boolean,
    val allowBiometricWeak: Boolean,
)
