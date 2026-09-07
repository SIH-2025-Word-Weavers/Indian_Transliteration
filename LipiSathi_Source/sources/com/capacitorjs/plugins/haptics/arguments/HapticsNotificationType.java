package com.capacitorjs.plugins.haptics.arguments;

import androidx.recyclerview.widget.ItemTouchHelper;

/* JADX INFO: loaded from: classes2.dex */
public enum HapticsNotificationType implements HapticsVibrationType {
    SUCCESS("SUCCESS", new long[]{0, 35, 65, 21}, new int[]{0, ItemTouchHelper.Callback.DEFAULT_SWIPE_ANIMATION_DURATION, 0, 180}, new long[]{0, 35, 65, 21}),
    WARNING("WARNING", new long[]{0, 30, 40, 30, 50, 60}, new int[]{255, 255, 255, 255, 255, 255}, new long[]{0, 30, 40, 30, 50, 60}),
    ERROR("ERROR", new long[]{0, 27, 45, 50}, new int[]{0, 120, 0, ItemTouchHelper.Callback.DEFAULT_SWIPE_ANIMATION_DURATION}, new long[]{0, 27, 45, 50});

    private final int[] amplitudes;
    private final long[] oldSDKPattern;
    private final long[] timings;
    private final String type;

    HapticsNotificationType(String type, long[] timings, int[] amplitudes, long[] oldSDKPattern) {
        this.type = type;
        this.timings = timings;
        this.amplitudes = amplitudes;
        this.oldSDKPattern = oldSDKPattern;
    }

    public static HapticsNotificationType fromString(String type) {
        for (HapticsNotificationType nt : values()) {
            if (nt.type.equals(type)) {
                return nt;
            }
        }
        return SUCCESS;
    }

    @Override // com.capacitorjs.plugins.haptics.arguments.HapticsVibrationType
    public long[] getTimings() {
        return this.timings;
    }

    @Override // com.capacitorjs.plugins.haptics.arguments.HapticsVibrationType
    public int[] getAmplitudes() {
        return this.amplitudes;
    }

    @Override // com.capacitorjs.plugins.haptics.arguments.HapticsVibrationType
    public long[] getOldSDKPattern() {
        return this.oldSDKPattern;
    }
}
