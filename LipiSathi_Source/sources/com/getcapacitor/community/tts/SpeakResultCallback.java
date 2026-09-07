package com.getcapacitor.community.tts;

/* JADX INFO: loaded from: classes2.dex */
public interface SpeakResultCallback {
    void onDone();

    void onError();

    void onRangeStart(int i, int i2, String str);
}
