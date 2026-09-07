package com.capacitorjs.plugins.splashscreen;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ObjectAnimator;
import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.res.ColorStateList;
import android.content.res.Resources;
import android.graphics.drawable.Animatable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.os.Build;
import android.os.Handler;
import android.util.Property;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.view.Window;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.view.animation.LinearInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.splashscreen.SplashScreenViewProvider;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.Logger;

/* JADX INFO: loaded from: classes2.dex */
public class SplashScreen {
    private SplashScreenConfig config;
    private View content;
    private Context context;
    private Dialog dialog;
    private ViewTreeObserver.OnPreDrawListener onPreDrawListener;
    private ProgressBar spinnerBar;
    private View splashImage;
    private WindowManager windowManager;
    private boolean isVisible = false;
    private boolean isHiding = false;

    SplashScreen(Context context, SplashScreenConfig config) {
        this.context = context;
        this.config = config;
    }

    public void showOnLaunch(AppCompatActivity activity) {
        if (this.config.getLaunchShowDuration().intValue() == 0) {
            return;
        }
        SplashScreenSettings settings = new SplashScreenSettings();
        settings.setShowDuration(this.config.getLaunchShowDuration());
        settings.setAutoHide(this.config.isLaunchAutoHide());
        try {
            showWithAndroid12API(activity, settings);
        } catch (Exception e) {
            Logger.warn("Android 12 Splash API failed... using previous method.");
            this.onPreDrawListener = null;
            settings.setFadeInDuration(this.config.getLaunchFadeInDuration());
            if (this.config.isUsingDialog()) {
                showDialog(activity, settings, null, true);
            } else {
                show(activity, settings, null, true);
            }
        }
    }

    private void showWithAndroid12API(final AppCompatActivity activity, final SplashScreenSettings settings) {
        if (activity == null || activity.isFinishing()) {
            return;
        }
        activity.runOnUiThread(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda9
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.lambda$showWithAndroid12API$2(activity, settings);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$showWithAndroid12API$2(AppCompatActivity activity, SplashScreenSettings settings) {
        androidx.core.splashscreen.SplashScreen windowSplashScreen = androidx.core.splashscreen.SplashScreen.installSplashScreen(activity);
        windowSplashScreen.setKeepOnScreenCondition(new androidx.core.splashscreen.SplashScreen.KeepOnScreenCondition() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda7
            @Override // androidx.core.splashscreen.SplashScreen.KeepOnScreenCondition
            public final boolean shouldKeepOnScreen() {
                return this.f$0.lambda$showWithAndroid12API$0();
            }
        });
        if (this.config.getLaunchFadeOutDuration().intValue() > 0) {
            windowSplashScreen.setOnExitAnimationListener(new androidx.core.splashscreen.SplashScreen.OnExitAnimationListener() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda8
                @Override // androidx.core.splashscreen.SplashScreen.OnExitAnimationListener
                public final void onSplashScreenExit(SplashScreenViewProvider splashScreenViewProvider) {
                    this.f$0.lambda$showWithAndroid12API$1(splashScreenViewProvider);
                }
            });
        }
        this.content = activity.findViewById(android.R.id.content);
        this.onPreDrawListener = new AnonymousClass2(settings);
        this.content.getViewTreeObserver().addOnPreDrawListener(this.onPreDrawListener);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ boolean lambda$showWithAndroid12API$0() {
        return this.isVisible || this.isHiding;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$showWithAndroid12API$1(final SplashScreenViewProvider windowSplashScreenView) {
        ObjectAnimator fadeAnimator = ObjectAnimator.ofFloat(windowSplashScreenView.getView(), (Property<View, Float>) View.ALPHA, 1.0f, 0.0f);
        fadeAnimator.setInterpolator(new LinearInterpolator());
        fadeAnimator.setDuration(this.config.getLaunchFadeOutDuration().intValue());
        fadeAnimator.addListener(new AnimatorListenerAdapter() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen.1
            @Override // android.animation.AnimatorListenerAdapter, android.animation.Animator.AnimatorListener
            public void onAnimationEnd(Animator animation) {
                SplashScreen.this.isHiding = false;
                windowSplashScreenView.remove();
            }
        });
        fadeAnimator.start();
        this.isHiding = true;
        this.isVisible = false;
    }

    /* JADX INFO: renamed from: com.capacitorjs.plugins.splashscreen.SplashScreen$2, reason: invalid class name */
    class AnonymousClass2 implements ViewTreeObserver.OnPreDrawListener {
        final /* synthetic */ SplashScreenSettings val$settings;

        AnonymousClass2(SplashScreenSettings splashScreenSettings) {
            this.val$settings = splashScreenSettings;
        }

        @Override // android.view.ViewTreeObserver.OnPreDrawListener
        public boolean onPreDraw() {
            if (!SplashScreen.this.isVisible && !SplashScreen.this.isHiding) {
                SplashScreen.this.isVisible = true;
                Handler handler = new Handler(SplashScreen.this.context.getMainLooper());
                final SplashScreenSettings splashScreenSettings = this.val$settings;
                handler.postDelayed(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$2$$ExternalSyntheticLambda0
                    @Override // java.lang.Runnable
                    public final void run() {
                        this.f$0.lambda$onPreDraw$0(splashScreenSettings);
                    }
                }, this.val$settings.getShowDuration().intValue());
                return false;
            }
            return false;
        }

        /* JADX INFO: Access modifiers changed from: private */
        public /* synthetic */ void lambda$onPreDraw$0(SplashScreenSettings settings) {
            if (settings.isAutoHide()) {
                SplashScreen.this.isVisible = false;
                SplashScreen.this.onPreDrawListener = null;
                SplashScreen.this.content.getViewTreeObserver().removeOnPreDrawListener(this);
            }
        }
    }

    public void show(AppCompatActivity activity, SplashScreenSettings settings, SplashListener splashListener) {
        if (this.config.isUsingDialog()) {
            showDialog(activity, settings, splashListener, false);
        } else {
            show(activity, settings, splashListener, false);
        }
    }

    private void showDialog(final AppCompatActivity activity, final SplashScreenSettings settings, final SplashListener splashListener, final boolean isLaunchSplash) {
        if (activity == null || activity.isFinishing()) {
            return;
        }
        if (this.isVisible) {
            splashListener.completed();
        } else {
            activity.runOnUiThread(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda6
                @Override // java.lang.Runnable
                public final void run() {
                    this.f$0.lambda$showDialog$4(activity, settings, isLaunchSplash, splashListener);
                }
            });
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$showDialog$4(final AppCompatActivity activity, SplashScreenSettings settings, final boolean isLaunchSplash, final SplashListener splashListener) {
        if (this.config.isImmersive()) {
            this.dialog = new Dialog(activity, R.style.capacitor_immersive_style);
        } else if (this.config.isFullScreen()) {
            this.dialog = new Dialog(activity, R.style.capacitor_full_screen_style);
        } else {
            this.dialog = new Dialog(activity, R.style.capacitor_default_style);
        }
        int splashId = 0;
        if (this.config.getLayoutName() != null && (splashId = this.context.getResources().getIdentifier(this.config.getLayoutName(), "layout", this.context.getPackageName())) == 0) {
            Logger.warn("Layout not found, using default");
        }
        if (splashId != 0) {
            this.dialog.setContentView(splashId);
        } else {
            Drawable splash = getSplashDrawable();
            LinearLayout parent = new LinearLayout(this.context);
            parent.setLayoutParams(new LinearLayout.LayoutParams(-1, -2));
            parent.setOrientation(1);
            if (splash != null) {
                parent.setBackground(splash);
            }
            this.dialog.setContentView(parent);
        }
        this.dialog.setCancelable(false);
        if (!this.dialog.isShowing()) {
            this.dialog.show();
        }
        this.isVisible = true;
        if (settings.isAutoHide()) {
            new Handler(this.context.getMainLooper()).postDelayed(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda0
                @Override // java.lang.Runnable
                public final void run() {
                    this.f$0.lambda$showDialog$3(activity, isLaunchSplash, splashListener);
                }
            }, settings.getShowDuration().intValue());
        } else if (splashListener != null) {
            splashListener.completed();
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$showDialog$3(AppCompatActivity activity, boolean isLaunchSplash, SplashListener splashListener) {
        hideDialog(activity, isLaunchSplash);
        if (splashListener != null) {
            splashListener.completed();
        }
    }

    public void hide(SplashScreenSettings settings) {
        hide(settings.getFadeOutDuration().intValue(), false);
    }

    public void hideDialog(AppCompatActivity activity) {
        hideDialog(activity, false);
    }

    public void onPause() {
        tearDown(true);
    }

    public void onDestroy() {
        tearDown(true);
    }

    /* JADX WARN: Multi-variable type inference failed */
    private void buildViews() {
        if (this.splashImage == null) {
            int splashId = 0;
            if (this.config.getLayoutName() != null && (splashId = this.context.getResources().getIdentifier(this.config.getLayoutName(), "layout", this.context.getPackageName())) == 0) {
                Logger.warn("Layout not found, defaulting to ImageView");
            }
            if (splashId != 0) {
                Activity activity = (Activity) this.context;
                LayoutInflater inflator = activity.getLayoutInflater();
                ViewGroup root = new FrameLayout(this.context);
                root.setLayoutParams(new FrameLayout.LayoutParams(-1, -1));
                this.splashImage = inflator.inflate(splashId, root, false);
            } else {
                Drawable splashDrawable = getSplashDrawable();
                if (splashDrawable != 0) {
                    if (splashDrawable instanceof Animatable) {
                        ((Animatable) splashDrawable).start();
                    }
                    if (splashDrawable instanceof LayerDrawable) {
                        LayerDrawable layeredSplash = (LayerDrawable) splashDrawable;
                        for (int i = 0; i < layeredSplash.getNumberOfLayers(); i++) {
                            Object drawable = layeredSplash.getDrawable(i);
                            if (drawable instanceof Animatable) {
                                ((Animatable) drawable).start();
                            }
                        }
                    }
                    ImageView imageView = new ImageView(this.context);
                    this.splashImage = imageView;
                    ImageView imageView2 = imageView;
                    if (Build.VERSION.SDK_INT >= 28) {
                        imageView2.setLayerType(1, null);
                    } else {
                        legacyStopFlickers(imageView2);
                    }
                    imageView2.setScaleType(this.config.getScaleType());
                    imageView2.setImageDrawable(splashDrawable);
                } else {
                    return;
                }
            }
            this.splashImage.setFitsSystemWindows(true);
            if (this.config.getBackgroundColor() != null) {
                this.splashImage.setBackgroundColor(this.config.getBackgroundColor().intValue());
            }
        }
        if (this.spinnerBar == null) {
            if (this.config.getSpinnerStyle() != null) {
                int spinnerBarStyle = this.config.getSpinnerStyle().intValue();
                this.spinnerBar = new ProgressBar(this.context, null, spinnerBarStyle);
            } else {
                this.spinnerBar = new ProgressBar(this.context);
            }
            this.spinnerBar.setIndeterminate(true);
            Integer spinnerBarColor = this.config.getSpinnerColor();
            if (spinnerBarColor != null) {
                int[][] states = {new int[]{android.R.attr.state_enabled}, new int[]{-16842910}, new int[]{-16842912}, new int[]{android.R.attr.state_pressed}};
                int[] colors = {spinnerBarColor.intValue(), spinnerBarColor.intValue(), spinnerBarColor.intValue(), spinnerBarColor.intValue()};
                ColorStateList colorStateList = new ColorStateList(states, colors);
                this.spinnerBar.setIndeterminateTintList(colorStateList);
            }
        }
    }

    private void legacyStopFlickers(ImageView imageView) {
        imageView.setDrawingCacheEnabled(true);
    }

    private Drawable getSplashDrawable() {
        int splashId = this.context.getResources().getIdentifier(this.config.getResourceName(), "drawable", this.context.getPackageName());
        try {
            Drawable drawable = this.context.getResources().getDrawable(splashId, this.context.getTheme());
            return drawable;
        } catch (Resources.NotFoundException e) {
            Logger.warn("No splash screen found, not displaying");
            return null;
        }
    }

    private void show(final AppCompatActivity activity, final SplashScreenSettings settings, SplashListener splashListener, boolean isLaunchSplash) {
        this.windowManager = (WindowManager) activity.getSystemService("window");
        if (activity.isFinishing()) {
            return;
        }
        buildViews();
        if (this.isVisible) {
            splashListener.completed();
            return;
        }
        final Animator.AnimatorListener listener = new AnonymousClass3(settings, isLaunchSplash, splashListener);
        Handler mainHandler = new Handler(this.context.getMainLooper());
        mainHandler.post(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda3
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.lambda$show$7(activity, settings, listener);
            }
        });
    }

    /* JADX INFO: renamed from: com.capacitorjs.plugins.splashscreen.SplashScreen$3, reason: invalid class name */
    class AnonymousClass3 implements Animator.AnimatorListener {
        final /* synthetic */ boolean val$isLaunchSplash;
        final /* synthetic */ SplashScreenSettings val$settings;
        final /* synthetic */ SplashListener val$splashListener;

        AnonymousClass3(SplashScreenSettings splashScreenSettings, boolean z, SplashListener splashListener) {
            this.val$settings = splashScreenSettings;
            this.val$isLaunchSplash = z;
            this.val$splashListener = splashListener;
        }

        @Override // android.animation.Animator.AnimatorListener
        public void onAnimationEnd(Animator animator) {
            SplashScreen.this.isVisible = true;
            if (this.val$settings.isAutoHide()) {
                Handler handler = new Handler(SplashScreen.this.context.getMainLooper());
                final SplashScreenSettings splashScreenSettings = this.val$settings;
                final boolean z = this.val$isLaunchSplash;
                final SplashListener splashListener = this.val$splashListener;
                handler.postDelayed(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$3$$ExternalSyntheticLambda0
                    @Override // java.lang.Runnable
                    public final void run() {
                        this.f$0.lambda$onAnimationEnd$0(splashScreenSettings, z, splashListener);
                    }
                }, this.val$settings.getShowDuration().intValue());
                return;
            }
            SplashListener splashListener2 = this.val$splashListener;
            if (splashListener2 != null) {
                splashListener2.completed();
            }
        }

        /* JADX INFO: Access modifiers changed from: private */
        public /* synthetic */ void lambda$onAnimationEnd$0(SplashScreenSettings settings, boolean isLaunchSplash, SplashListener splashListener) {
            SplashScreen.this.hide(settings.getFadeOutDuration().intValue(), isLaunchSplash);
            if (splashListener != null) {
                splashListener.completed();
            }
        }

        @Override // android.animation.Animator.AnimatorListener
        public void onAnimationCancel(Animator animator) {
        }

        @Override // android.animation.Animator.AnimatorListener
        public void onAnimationRepeat(Animator animator) {
        }

        @Override // android.animation.Animator.AnimatorListener
        public void onAnimationStart(Animator animator) {
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$show$7(final AppCompatActivity activity, SplashScreenSettings settings, Animator.AnimatorListener listener) {
        WindowManager.LayoutParams params = new WindowManager.LayoutParams();
        params.gravity = 17;
        params.flags = activity.getWindow().getAttributes().flags;
        params.format = -3;
        try {
            this.windowManager.addView(this.splashImage, params);
            if (this.config.isImmersive()) {
                if (Build.VERSION.SDK_INT >= 30) {
                    activity.runOnUiThread(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda4
                        @Override // java.lang.Runnable
                        public final void run() {
                            this.f$0.lambda$show$5(activity);
                        }
                    });
                } else {
                    legacyImmersive();
                }
            } else if (this.config.isFullScreen()) {
                if (Build.VERSION.SDK_INT >= 30) {
                    activity.runOnUiThread(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda5
                        @Override // java.lang.Runnable
                        public final void run() {
                            this.f$0.lambda$show$6(activity);
                        }
                    });
                } else {
                    legacyFullscreen();
                }
            }
            this.splashImage.setAlpha(0.0f);
            this.splashImage.animate().alpha(1.0f).setInterpolator(new LinearInterpolator()).setDuration(settings.getFadeInDuration().intValue()).setListener(listener).start();
            this.splashImage.setVisibility(0);
            ProgressBar progressBar = this.spinnerBar;
            if (progressBar != null) {
                progressBar.setVisibility(4);
                if (this.spinnerBar.getParent() != null) {
                    this.windowManager.removeView(this.spinnerBar);
                }
                params.height = -2;
                params.width = -2;
                this.windowManager.addView(this.spinnerBar, params);
                if (this.config.isShowSpinner()) {
                    this.spinnerBar.setAlpha(0.0f);
                    this.spinnerBar.animate().alpha(1.0f).setInterpolator(new LinearInterpolator()).setDuration(settings.getFadeInDuration().intValue()).start();
                    this.spinnerBar.setVisibility(0);
                }
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            Logger.debug("Could not add splash view");
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$show$5(AppCompatActivity activity) {
        Window window = activity.getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        WindowInsetsController controller = this.splashImage.getWindowInsetsController();
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(2);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$show$6(AppCompatActivity activity) {
        Window window = activity.getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        WindowInsetsController controller = this.splashImage.getWindowInsetsController();
        controller.hide(WindowInsetsCompat.Type.statusBars());
    }

    private void legacyImmersive() {
        this.splashImage.setSystemUiVisibility(5894);
    }

    private void legacyFullscreen() {
        this.splashImage.setSystemUiVisibility(4);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void hide(final int fadeOutDuration, boolean isLaunchSplash) {
        if (isLaunchSplash && this.isVisible) {
            Logger.debug("SplashScreen was automatically hidden after the launch timeout. You should call `SplashScreen.hide()` as soon as your web app is loaded (or increase the timeout).Read more at https://capacitorjs.com/docs/apis/splash-screen#hiding-the-splash-screen");
        }
        if (this.isHiding) {
            return;
        }
        if (this.onPreDrawListener != null) {
            if (fadeOutDuration != 200) {
                Logger.warn("fadeOutDuration parameter doesn't work on initial splash screen, use launchFadeOutDuration configuration option");
            }
            this.isVisible = false;
            View view = this.content;
            if (view != null) {
                view.getViewTreeObserver().removeOnPreDrawListener(this.onPreDrawListener);
            }
            this.onPreDrawListener = null;
            return;
        }
        View view2 = this.splashImage;
        if (view2 == null || view2.getParent() == null) {
            return;
        }
        this.isHiding = true;
        final Animator.AnimatorListener listener = new Animator.AnimatorListener() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen.4
            @Override // android.animation.Animator.AnimatorListener
            public void onAnimationEnd(Animator animator) {
                SplashScreen.this.tearDown(false);
            }

            @Override // android.animation.Animator.AnimatorListener
            public void onAnimationCancel(Animator animator) {
                SplashScreen.this.tearDown(false);
            }

            @Override // android.animation.Animator.AnimatorListener
            public void onAnimationStart(Animator animator) {
            }

            @Override // android.animation.Animator.AnimatorListener
            public void onAnimationRepeat(Animator animator) {
            }
        };
        Handler mainHandler = new Handler(this.context.getMainLooper());
        mainHandler.post(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda1
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.lambda$hide$8(fadeOutDuration, listener);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$hide$8(int fadeOutDuration, Animator.AnimatorListener listener) {
        ProgressBar progressBar = this.spinnerBar;
        if (progressBar != null) {
            progressBar.setAlpha(1.0f);
            this.spinnerBar.animate().alpha(0.0f).setInterpolator(new LinearInterpolator()).setDuration(fadeOutDuration).start();
        }
        this.splashImage.setAlpha(1.0f);
        this.splashImage.animate().alpha(0.0f).setInterpolator(new LinearInterpolator()).setDuration(fadeOutDuration).setListener(listener).start();
    }

    private void hideDialog(final AppCompatActivity activity, boolean isLaunchSplash) {
        if (isLaunchSplash && this.isVisible) {
            Logger.debug("SplashScreen was automatically hidden after the launch timeout. You should call `SplashScreen.hide()` as soon as your web app is loaded (or increase the timeout).Read more at https://capacitorjs.com/docs/apis/splash-screen#hiding-the-splash-screen");
        }
        if (this.isHiding) {
            return;
        }
        if (this.onPreDrawListener != null) {
            this.isVisible = false;
            View view = this.content;
            if (view != null) {
                view.getViewTreeObserver().removeOnPreDrawListener(this.onPreDrawListener);
            }
            this.onPreDrawListener = null;
            return;
        }
        this.isHiding = true;
        activity.runOnUiThread(new Runnable() { // from class: com.capacitorjs.plugins.splashscreen.SplashScreen$$ExternalSyntheticLambda2
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.lambda$hideDialog$9(activity);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$hideDialog$9(AppCompatActivity activity) {
        Dialog dialog = this.dialog;
        if (dialog != null && dialog.isShowing()) {
            if (!activity.isFinishing() && !activity.isDestroyed()) {
                this.dialog.dismiss();
            }
            this.dialog = null;
            this.isHiding = false;
            this.isVisible = false;
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public void tearDown(boolean removeSpinner) {
        ProgressBar progressBar = this.spinnerBar;
        if (progressBar != null && progressBar.getParent() != null) {
            this.spinnerBar.setVisibility(4);
            if (removeSpinner) {
                this.windowManager.removeView(this.spinnerBar);
            }
        }
        View view = this.splashImage;
        if (view != null && view.getParent() != null) {
            this.splashImage.setVisibility(4);
            this.windowManager.removeView(this.splashImage);
        }
        if ((Build.VERSION.SDK_INT >= 30 && this.config.isFullScreen()) || this.config.isImmersive()) {
            Window window = ((Activity) this.context).getWindow();
            WindowCompat.setDecorFitsSystemWindows(window, true);
        }
        this.isHiding = false;
        this.isVisible = false;
    }
}
