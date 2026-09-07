package com.capacitorjs.plugins.splashscreen;

import android.widget.ImageView;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.util.WebColor;
import java.util.Locale;

/* JADX INFO: loaded from: classes2.dex */
@CapacitorPlugin(name = "SplashScreen")
public class SplashScreenPlugin extends Plugin {
    private SplashScreenConfig config;
    private SplashScreen splashScreen;

    @Override // com.getcapacitor.Plugin
    public void load() {
        this.config = getSplashScreenConfig();
        this.splashScreen = new SplashScreen(getContext(), this.config);
        if (!this.bridge.isMinimumWebViewInstalled() && this.bridge.getConfig().getErrorPath() != null && !this.config.isLaunchAutoHide()) {
            return;
        }
        this.splashScreen.showOnLaunch(getActivity());
    }

    @PluginMethod
    public void show(final PluginCall call) {
        this.splashScreen.show(getActivity(), getSettings(call), new SplashListener() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreenPlugin.1
            @Override // com.capacitorjs.plugins.splashscreen.SplashListener
            public void completed() {
                call.resolve();
            }

            @Override // com.capacitorjs.plugins.splashscreen.SplashListener
            public void error() {
                call.reject("An error occurred while showing splash");
            }
        });
    }

    @PluginMethod
    public void hide(PluginCall call) {
        if (this.config.isUsingDialog()) {
            this.splashScreen.hideDialog(getActivity());
        } else {
            this.splashScreen.hide(getSettings(call));
        }
        call.resolve();
    }

    @Override // com.getcapacitor.Plugin
    protected void handleOnPause() {
        this.splashScreen.onPause();
    }

    @Override // com.getcapacitor.Plugin
    protected void handleOnDestroy() {
        this.splashScreen.onDestroy();
    }

    private SplashScreenSettings getSettings(PluginCall call) {
        SplashScreenSettings settings = new SplashScreenSettings();
        if (call.getInt("showDuration") != null) {
            settings.setShowDuration(call.getInt("showDuration"));
        }
        if (call.getInt("fadeInDuration") != null) {
            settings.setFadeInDuration(call.getInt("fadeInDuration"));
        }
        if (call.getInt("fadeOutDuration") != null) {
            settings.setFadeOutDuration(call.getInt("fadeOutDuration"));
        }
        if (call.getBoolean("autoHide") != null) {
            settings.setAutoHide(call.getBoolean("autoHide").booleanValue());
        }
        return settings;
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Code duplicated, block: B:34:0x0110  */
    private SplashScreenConfig getSplashScreenConfig() {
        ImageView.ScaleType scaleType;
        SplashScreenConfig config = new SplashScreenConfig();
        String backgroundColor = getConfig().getString("backgroundColor");
        if (backgroundColor != null) {
            try {
                config.setBackgroundColor(Integer.valueOf(WebColor.parseColor(backgroundColor)));
            } catch (IllegalArgumentException e) {
                Logger.debug("Background color not applied");
            }
        }
        Integer duration = Integer.valueOf(getConfig().getInt("launchShowDuration", config.getLaunchShowDuration().intValue()));
        config.setLaunchShowDuration(duration);
        Integer fadeOutDuration = Integer.valueOf(getConfig().getInt("launchFadeOutDuration", config.getLaunchFadeOutDuration().intValue()));
        config.setLaunchFadeOutDuration(fadeOutDuration);
        Boolean autohide = Boolean.valueOf(getConfig().getBoolean("launchAutoHide", config.isLaunchAutoHide()));
        config.setLaunchAutoHide(autohide.booleanValue());
        if (getConfig().getString("androidSplashResourceName") != null) {
            config.setResourceName(getConfig().getString("androidSplashResourceName"));
        }
        Boolean immersive = Boolean.valueOf(getConfig().getBoolean("splashImmersive", config.isImmersive()));
        config.setImmersive(immersive.booleanValue());
        Boolean fullScreen = Boolean.valueOf(getConfig().getBoolean("splashFullScreen", config.isFullScreen()));
        config.setFullScreen(fullScreen.booleanValue());
        String spinnerStyle = getConfig().getString("androidSpinnerStyle");
        if (spinnerStyle != null) {
            int spinnerBarStyle = android.R.attr.progressBarStyleLarge;
            switch (spinnerStyle.toLowerCase(Locale.ROOT)) {
                case "horizontal":
                    spinnerBarStyle = android.R.attr.progressBarStyleHorizontal;
                    break;
                case "small":
                    spinnerBarStyle = android.R.attr.progressBarStyleSmall;
                    break;
                case "large":
                    spinnerBarStyle = android.R.attr.progressBarStyleLarge;
                    break;
                case "inverse":
                    spinnerBarStyle = android.R.attr.progressBarStyleInverse;
                    break;
                case "smallinverse":
                    spinnerBarStyle = android.R.attr.progressBarStyleSmallInverse;
                    break;
                case "largeinverse":
                    spinnerBarStyle = android.R.attr.progressBarStyleLargeInverse;
                    break;
            }
            config.setSpinnerStyle(Integer.valueOf(spinnerBarStyle));
        }
        String spinnerColor = getConfig().getString("spinnerColor");
        if (spinnerColor != null) {
            try {
                config.setSpinnerColor(Integer.valueOf(WebColor.parseColor(spinnerColor)));
            } catch (IllegalArgumentException e2) {
                Logger.debug("Spinner color not applied");
            }
        }
        String scaleTypeName = getConfig().getString("androidScaleType");
        if (scaleTypeName != null) {
            try {
                scaleType = ImageView.ScaleType.valueOf(scaleTypeName);
            } catch (IllegalArgumentException e3) {
                scaleType = ImageView.ScaleType.FIT_XY;
            }
            config.setScaleType(scaleType);
        }
        Boolean showSpinner = Boolean.valueOf(getConfig().getBoolean("showSpinner", config.isShowSpinner()));
        config.setShowSpinner(showSpinner.booleanValue());
        Boolean useDialog = Boolean.valueOf(getConfig().getBoolean("useDialog", config.isUsingDialog()));
        config.setUsingDialog(useDialog.booleanValue());
        if (getConfig().getString("layoutName") != null) {
            config.setLayoutName(getConfig().getString("layoutName"));
        }
        return config;
    }
}
