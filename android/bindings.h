#include <jsi/jsilib.h>
#include <ReactCommon/CallInvoker.h>
#include <string>

namespace ops2 {
    namespace jsi = facebook::jsi;
    namespace react = facebook::react;

    // Mirrors the JS `BiometricPromptOptions` shape so we can pass it through
    // JNI without an explosion of method overloads. Strings are owned by the
    // struct and remain valid for the duration of the synchronous JNI call.
    struct BiometricPromptOptions {
        std::string title;
        std::string subtitle;
        std::string negativeButtonText;
        bool allowDeviceCredential;
        bool allowBiometricWeak;
    };

    void install(
        jsi::Runtime &rt,
        std::function<void(const char *, const char *, bool, BiometricPromptOptions)> setFn,
        std::function<std::string(const char *, bool, BiometricPromptOptions)> getFn,
        std::function<void(const char *, bool, BiometricPromptOptions)> delFn);
}
