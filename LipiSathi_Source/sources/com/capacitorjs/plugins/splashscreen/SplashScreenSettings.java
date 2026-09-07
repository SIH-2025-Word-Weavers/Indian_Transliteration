package com.capacitorjs.plugins.splashscreen;

import androidx.recyclerview.widget.ItemTouchHelper;
import androidx.vectordrawable.graphics.drawable.PathInterpolatorCompat;

/* JADX INFO: loaded from: classes2.dex */
public class SplashScreenSettings {
    private boolean autoHide;
    private Integer fadeInDuration;
    private Integer fadeOutDuration;
    private Integer showDuration = Integer.valueOf(PathInterpolatorCompat.MAX_NUM_POINTS);

    public SplashScreenSettings() {
        Integer numValueOf = Integer.valueOf(ItemTouchHelper.Callback.DEFAULT_DRAG_ANIMATION_DURATION);
        this.fadeInDuration = numValueOf;
        this.fadeOutDuration = numValueOf;
        this.autoHide = true;
    }

    public Integer getShowDuration() {
        return this.showDuration;
    }

    public void setShowDuration(Integer showDuration) {
        this.showDuration = showDuration;
    }

    public Integer getFadeInDuration() {
        return this.fadeInDuration;
    }

    public void setFadeInDuration(Integer fadeInDuration) {
        this.fadeInDuration = fadeInDuration;
    }

    public Integer getFadeOutDuration() {
        return this.fadeOutDuration;
    }

    public void setFadeOutDuration(Integer fadeOutDuration) {
        this.fadeOutDuration = fadeOutDuration;
    }

    public boolean isAutoHide() {
        return this.autoHide;
    }

    public void setAutoHide(boolean autoHide) {
        this.autoHide = autoHide;
    }
}
