package com.getcapacitor.community.tts;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Locale;
import java.util.Set;

/* JADX INFO: loaded from: classes2.dex */
public class TextToSpeech implements android.speech.tts.TextToSpeech.OnInitListener {
    public static final String LOG_TAG = "TextToSpeech";
    private Context context;
    private int initializationStatus;
    private JSObject[] supportedVoices = null;
    private android.speech.tts.TextToSpeech tts;

    TextToSpeech(Context context) {
        this.tts = null;
        this.context = context;
        try {
            this.tts = new android.speech.tts.TextToSpeech(context, this);
        } catch (Exception ex) {
            Log.d(LOG_TAG, ex.getLocalizedMessage());
        }
    }

    @Override // android.speech.tts.TextToSpeech.OnInitListener
    public void onInit(int status) {
        this.initializationStatus = status;
    }

    public void speak(final String text, String lang, float rate, float pitch, float volume, int voice, String callbackId, final SpeakResultCallback resultCallback) {
        this.tts.stop();
        this.tts.setOnUtteranceProgressListener(new UtteranceProgressListener() { // from class: com.getcapacitor.community.tts.TextToSpeech.1
            @Override // android.speech.tts.UtteranceProgressListener
            public void onStart(String utteranceId) {
            }

            @Override // android.speech.tts.UtteranceProgressListener
            public void onDone(String utteranceId) {
                resultCallback.onDone();
            }

            @Override // android.speech.tts.UtteranceProgressListener
            public void onError(String utteranceId) {
                resultCallback.onError();
            }

            @Override // android.speech.tts.UtteranceProgressListener
            public void onRangeStart(String utteranceId, int start, int end, int frame) {
                String spokenWord = text.substring(start, end);
                resultCallback.onRangeStart(start, end, spokenWord);
            }
        });
        Locale locale = Locale.forLanguageTag(lang);
        Bundle ttsParams = new Bundle();
        ttsParams.putSerializable("utteranceId", callbackId);
        ttsParams.putSerializable("volume", Float.valueOf(volume));
        this.tts.setLanguage(locale);
        this.tts.setSpeechRate(rate);
        this.tts.setPitch(pitch);
        if (voice >= 0) {
            ArrayList<Voice> supportedVoices = getSupportedVoicesOrdered();
            if (voice < supportedVoices.size()) {
                Voice newVoice = supportedVoices.get(voice);
                this.tts.setVoice(newVoice);
            }
        }
        this.tts.speak(text, 0, ttsParams, callbackId);
    }

    public void stop() {
        this.tts.stop();
    }

    public JSArray getSupportedLanguages() {
        ArrayList<String> languages = new ArrayList<>();
        Set<Locale> supportedLocales = this.tts.getAvailableLanguages();
        for (Locale supportedLocale : supportedLocales) {
            String tag = supportedLocale.toLanguageTag();
            languages.add(tag);
        }
        JSArray result = JSArray.from(languages.toArray());
        return result;
    }

    public ArrayList<Voice> getSupportedVoicesOrdered() {
        Set<Voice> supportedVoices = this.tts.getVoices();
        ArrayList<Voice> orderedVoices = new ArrayList<>();
        for (Voice supportedVoice : supportedVoices) {
            orderedVoices.add(supportedVoice);
        }
        Collections.sort(orderedVoices, new Comparator() { // from class: com.getcapacitor.community.tts.TextToSpeech$$ExternalSyntheticLambda0
            @Override // java.util.Comparator
            public final int compare(Object obj, Object obj2) {
                return ((Voice) obj).getName().compareTo(((Voice) obj2).getName());
            }
        });
        return orderedVoices;
    }

    public JSArray getSupportedVoices() {
        ArrayList<JSObject> voices = new ArrayList<>();
        ArrayList<Voice> supportedVoices = getSupportedVoicesOrdered();
        for (Voice supportedVoice : supportedVoices) {
            JSObject obj = convertVoiceToJSObject(supportedVoice);
            voices.add(obj);
        }
        JSArray result = JSArray.from(voices.toArray());
        return result;
    }

    public void openInstall() {
        PackageManager packageManager = this.context.getPackageManager();
        Intent installIntent = new Intent();
        installIntent.setAction("android.speech.tts.engine.CHECK_TTS_DATA");
        ResolveInfo resolveInfo = packageManager.resolveActivity(installIntent, 65536);
        if (resolveInfo != null) {
            installIntent.setFlags(268435456);
            this.context.startActivity(installIntent);
        }
    }

    public boolean isAvailable() {
        if (this.tts != null && this.initializationStatus == 0) {
            return true;
        }
        return false;
    }

    public boolean isLanguageSupported(String lang) {
        Locale locale = Locale.forLanguageTag(lang);
        int result = this.tts.isLanguageAvailable(locale);
        return result == 0 || result == 1 || result == 2;
    }

    public void onDestroy() {
        android.speech.tts.TextToSpeech textToSpeech = this.tts;
        if (textToSpeech == null) {
            return;
        }
        textToSpeech.stop();
        this.tts.shutdown();
    }

    private JSObject convertVoiceToJSObject(Voice voice) {
        Locale locale = voice.getLocale();
        JSObject obj = new JSObject();
        obj.put("voiceURI", voice.getName());
        obj.put("name", locale.getDisplayLanguage() + " " + locale.getDisplayCountry());
        obj.put("lang", locale.toLanguageTag());
        obj.put("localService", !voice.isNetworkConnectionRequired());
        obj.put("default", false);
        return obj;
    }
}
