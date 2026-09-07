package com.capacitorjs.plugins.splashscreen;

import android.widget.ImageView;
import androidx.recyclerview.widget.ItemTouchHelper;

/* JADX INFO: loaded from: classes2.dex */
public class SplashScreenConfig {
    private Integer backgroundColor;
    private String layoutName;
    private Integer spinnerColor;
    private Integer spinnerStyle;
    private boolean showSpinner = false;
    private Integer launchShowDuration = 500;
    private boolean launchAutoHide = true;
    private Integer launchFadeInDuration = 0;
    private Integer launchFadeOutDuration = Integer.valueOf(ItemTouchHelper.Callback.DEFAULT_DRAG_ANIMATION_DURATION);
    private String resourceName = "splash";
    private boolean immersive = false;
    private boolean fullScreen = false;
    private ImageView.ScaleType scaleType = ImageView.ScaleType.FIT_XY;
    private boolean usingDialog = false;

    public Integer getBackgroundColor() {
        return this.backgroundColor;
    }

    public void setBackgroundColor(Integer backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public Integer getSpinnerStyle() {
        return this.spinnerStyle;
    }

    public void setSpinnerStyle(Integer spinnerStyle) {
        this.spinnerStyle = spinnerStyle;
    }

    public Integer getSpinnerColor() {
        return this.spinnerColor;
    }

    public void setSpinnerColor(Integer spinnerColor) {
        this.spinnerColor = spinnerColor;
    }

    public boolean isShowSpinner() {
        return this.showSpinner;
    }

    public void setShowSpinner(boolean showSpinner) {
        this.showSpinner = showSpinner;
    }

    public Integer getLaunchShowDuration() {
        return this.launchShowDuration;
    }

    public void setLaunchShowDuration(Integer launchShowDuration) {
        this.launchShowDuration = launchShowDuration;
    }

    public boolean isLaunchAutoHide() {
        return this.launchAutoHide;
    }

    public void setLaunchAutoHide(boolean launchAutoHide) {
        this.launchAutoHide = launchAutoHide;
    }

    public Integer getLaunchFadeInDuration() {
        return this.launchFadeInDuration;
    }

    public String getResourceName() {
        return this.resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public boolean isImmersive() {
        return this.immersive;
    }

    public void setImmersive(boolean immersive) {
        this.immersive = immersive;
    }

    public boolean isFullScreen() {
        return this.fullScreen;
    }

    public void setFullScreen(boolean fullScreen) {
        this.fullScreen = fullScreen;
    }

    public ImageView.ScaleType getScaleType() {
        return this.scaleType;
    }

    public void setScaleType(ImageView.ScaleType scaleType) {
        this.scaleType = scaleType;
    }

    public boolean isUsingDialog() {
        return this.usingDialog;
    }

    public void setUsingDialog(boolean usingDialog) {
        this.usingDialog = usingDialog;
    }

    public String getLayoutName() {
        return this.layoutName;
    }

    public void setLayoutName(String layoutName) {
        this.layoutName = layoutName;
    }

    public Integer getLaunchFadeOutDuration() {
        return this.launchFadeOutDuration;
    }

    public void setLaunchFadeOutDuration(Integer launchFadeOutDuration) {
        this.launchFadeOutDuration = launchFadeOutDuration;
    }
}
