package com.getcapacitor.community.tts;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/* JADX INFO: loaded from: classes2.dex */
@CapacitorPlugin(name = TextToSpeech.LOG_TAG)
public class TextToSpeechPlugin extends Plugin {
    public static final String ERROR_UNSUPPORTED_LANGUAGE = "This language is not supported.";
    public static final String ERROR_UTTERANCE = "Failed to read text.";
    public static final String LOG_TAG = "TextToSpeechPlugin";
    private TextToSpeech implementation;

    @Override // com.getcapacitor.Plugin
    public void load() {
        this.implementation = new TextToSpeech(getContext());
    }

    @PluginMethod
    public void speak(final PluginCall call) {
        boolean isAvailable = this.implementation.isAvailable();
        if (!isAvailable) {
            call.unavailable("Not yet initialized or not available on this device.");
            return;
        }
        String text = call.getString("text", "");
        String lang = call.getString("lang", "en-US");
        float rate = call.getFloat("rate", Float.valueOf(1.0f)).floatValue();
        float pitch = call.getFloat("pitch", Float.valueOf(1.0f)).floatValue();
        float volume = call.getFloat("volume", Float.valueOf(1.0f)).floatValue();
        int voice = call.getInt("voice", -1).intValue();
        boolean isLanguageSupported = this.implementation.isLanguageSupported(lang);
        if (isLanguageSupported) {
            SpeakResultCallback resultCallback = new SpeakResultCallback() { // from class: com.getcapacitor.community.tts.TextToSpeechPlugin.1
                @Override // com.getcapacitor.community.tts.SpeakResultCallback
                public void onDone() {
                    call.resolve();
                }

                @Override // com.getcapacitor.community.tts.SpeakResultCallback
                public void onError() {
                    call.reject(TextToSpeechPlugin.ERROR_UTTERANCE);
                }

                @Override // com.getcapacitor.community.tts.SpeakResultCallback
                public void onRangeStart(int start, int end, String spokenWord) {
                    JSObject ret = new JSObject();
                    ret.put("start", start);
                    ret.put("end", end);
                    ret.put("spokenWord", spokenWord);
                    TextToSpeechPlugin.this.notifyListeners("onRangeStart", ret);
                }
            };
            try {
                this.implementation.speak(text, lang, rate, pitch, volume, voice, call.getCallbackId(), resultCallback);
                return;
            } catch (Exception ex) {
                call.reject(ex.getLocalizedMessage());
                return;
            }
        }
        call.reject(ERROR_UNSUPPORTED_LANGUAGE);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        boolean isAvailable = this.implementation.isAvailable();
        if (!isAvailable) {
            call.unavailable("Not yet initialized or not available on this device.");
            return;
        }
        try {
            this.implementation.stop();
            call.resolve();
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void getSupportedLanguages(PluginCall call) {
        try {
            JSArray languages = this.implementation.getSupportedLanguages();
            JSObject ret = new JSObject();
            ret.put("languages", (Object) languages);
            call.resolve(ret);
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void getSupportedVoices(PluginCall call) {
        try {
            JSArray voices = this.implementation.getSupportedVoices();
            JSObject ret = new JSObject();
            ret.put("voices", (Object) voices);
            call.resolve(ret);
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void isLanguageSupported(PluginCall call) {
        String lang = call.getString("lang", "");
        try {
            boolean isLanguageSupported = this.implementation.isLanguageSupported(lang);
            JSObject ret = new JSObject();
            ret.put("supported", isLanguageSupported);
            call.resolve(ret);
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void openInstall(PluginCall call) {
        try {
            this.implementation.openInstall();
            call.resolve();
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage());
        }
    }

    @Override // com.getcapacitor.Plugin
    protected void handleOnDestroy() {
        this.implementation.onDestroy();
    }
}
