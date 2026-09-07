package com.capacitorjs.plugins.keyboard;

import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/* JADX INFO: loaded from: classes2.dex */
@CapacitorPlugin(name = "Keyboard")
public class KeyboardPlugin extends Plugin {
    private Keyboard implementation;

    @Override // com.getcapacitor.Plugin
    public void load() {
        execute(new Runnable() { // from class: com.capacitorjs.plugins.keyboard.KeyboardPlugin$$ExternalSyntheticLambda3
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.lambda$load$0();
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$load$0() {
        boolean resizeOnFullScreen = getConfig().getBoolean("resizeOnFullScreen", false);
        Keyboard keyboard = new Keyboard(getActivity(), resizeOnFullScreen);
        this.implementation = keyboard;
        keyboard.setKeyboardEventListener(new Keyboard.KeyboardEventListener() { // from class: com.capacitorjs.plugins.keyboard.KeyboardPlugin$$ExternalSyntheticLambda2
            @Override // com.capacitorjs.plugins.keyboard.Keyboard.KeyboardEventListener
            public final void onKeyboardEvent(String str, int i) {
                this.f$0.onKeyboardEvent(str, i);
            }
        });
    }

    @PluginMethod
    public void show(final PluginCall call) {
        execute(new Runnable() { // from class: com.capacitorjs.plugins.keyboard.KeyboardPlugin$$ExternalSyntheticLambda4
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.lambda$show$2(call);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$show$2(final PluginCall call) {
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() { // from class: com.capacitorjs.plugins.keyboard.KeyboardPlugin$$ExternalSyntheticLambda1
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.lambda$show$1(call);
            }
        }, 350L);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$show$1(PluginCall call) {
        this.implementation.show();
        call.resolve();
    }

    @PluginMethod
    public void hide(final PluginCall call) {
        execute(new Runnable() { // from class: com.capacitorjs.plugins.keyboard.KeyboardPlugin$$ExternalSyntheticLambda0
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.lambda$hide$3(call);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$hide$3(PluginCall call) {
        if (!this.implementation.hide()) {
            call.reject("Can't close keyboard, not currently focused");
        } else {
            call.resolve();
        }
    }

    @PluginMethod
    public void setAccessoryBarVisible(PluginCall call) {
        call.unimplemented();
    }

    @PluginMethod
    public void setStyle(PluginCall call) {
        call.unimplemented();
    }

    @PluginMethod
    public void setResizeMode(PluginCall call) {
        call.unimplemented();
    }

    @PluginMethod
    public void getResizeMode(PluginCall call) {
        call.unimplemented();
    }

    @PluginMethod
    public void setScroll(PluginCall call) {
        call.unimplemented();
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Code duplicated, block: B:17:0x0035  */
    void onKeyboardEvent(String event, int size) {
        JSObject kbData = new JSObject();
        switch (event) {
            case "keyboardWillShow":
            case "keyboardDidShow":
                String data = "{ 'keyboardHeight': " + size + " }";
                this.bridge.triggerWindowJSEvent(event, data);
                kbData.put("keyboardHeight", size);
                notifyListeners(event, kbData);
                break;
            case "keyboardWillHide":
            case "keyboardDidHide":
                this.bridge.triggerWindowJSEvent(event);
                notifyListeners(event, kbData);
                break;
        }
    }

    @Override // com.getcapacitor.Plugin
    protected void handleOnDestroy() {
        this.implementation.setKeyboardEventListener(null);
    }
}
