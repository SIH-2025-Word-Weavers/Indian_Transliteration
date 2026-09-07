package com.capacitorjs.plugins.geolocation;

import android.location.Location;

/* JADX INFO: loaded from: classes2.dex */
public interface LocationResultCallback {
    void error(String str);

    void success(Location location);
}
