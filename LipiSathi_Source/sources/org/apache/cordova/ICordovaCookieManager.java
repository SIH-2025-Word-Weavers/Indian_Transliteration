package org.apache.cordova;

/* JADX INFO: loaded from: classes5.dex */
public interface ICordovaCookieManager {
    void clearCookies();

    void flush();

    String getCookie(final String url);

    void setCookie(final String url, final String value);

    void setCookiesEnabled(boolean accept);
}
