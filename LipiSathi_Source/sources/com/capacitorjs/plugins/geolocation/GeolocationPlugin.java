package com.capacitorjs.plugins.geolocation;

import android.location.Location;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONException;

/* JADX INFO: loaded from: classes2.dex */
@CapacitorPlugin(name = "Geolocation", permissions = {@Permission(alias = GeolocationPlugin.LOCATION, strings = {"android.permission.ACCESS_COARSE_LOCATION", "android.permission.ACCESS_FINE_LOCATION"}), @Permission(alias = GeolocationPlugin.COARSE_LOCATION, strings = {"android.permission.ACCESS_COARSE_LOCATION"})})
public class GeolocationPlugin extends Plugin {
    static final String COARSE_LOCATION = "coarseLocation";
    static final String LOCATION = "location";
    private Geolocation implementation;
    private Map<String, PluginCall> watchingCalls = new HashMap();

    @Override // com.getcapacitor.Plugin
    public void load() {
        this.implementation = new Geolocation(getContext());
    }

    @Override // com.getcapacitor.Plugin
    protected void handleOnPause() {
        super.handleOnPause();
        this.implementation.clearLocationUpdates();
    }

    @Override // com.getcapacitor.Plugin
    protected void handleOnResume() {
        super.handleOnResume();
        for (PluginCall call : this.watchingCalls.values()) {
            startWatch(call);
        }
    }

    @Override // com.getcapacitor.Plugin
    @PluginMethod
    public void checkPermissions(PluginCall call) {
        if (this.implementation.isLocationServicesEnabled().booleanValue()) {
            super.checkPermissions(call);
        } else {
            call.reject("Location services are not enabled");
        }
    }

    @Override // com.getcapacitor.Plugin
    @PluginMethod
    public void requestPermissions(PluginCall call) throws JSONException {
        if (this.implementation.isLocationServicesEnabled().booleanValue()) {
            super.requestPermissions(call);
        } else {
            call.reject("Location services are not enabled");
        }
    }

    @PluginMethod
    public void getCurrentPosition(PluginCall call) {
        String alias = getAlias(call);
        if (getPermissionState(alias) != PermissionState.GRANTED) {
            requestPermissionForAlias(alias, call, "completeCurrentPosition");
        } else {
            getPosition(call);
        }
    }

    @PermissionCallback
    private void completeCurrentPosition(final PluginCall call) {
        if (getPermissionState(COARSE_LOCATION) == PermissionState.GRANTED) {
            this.implementation.sendLocation(isHighAccuracy(call), new LocationResultCallback() { // from class: com.capacitorjs.plugins.geolocation.GeolocationPlugin.1
                @Override // com.capacitorjs.plugins.geolocation.LocationResultCallback
                public void success(Location location) {
                    call.resolve(GeolocationPlugin.this.getJSObjectForLocation(location));
                }

                @Override // com.capacitorjs.plugins.geolocation.LocationResultCallback
                public void error(String message) {
                    call.reject(message);
                }
            });
        } else {
            call.reject("Location permission was denied");
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    public void watchPosition(PluginCall call) {
        call.setKeepAlive(true);
        String alias = getAlias(call);
        if (getPermissionState(alias) != PermissionState.GRANTED) {
            requestPermissionForAlias(alias, call, "completeWatchPosition");
        } else {
            startWatch(call);
        }
    }

    @PermissionCallback
    private void completeWatchPosition(PluginCall call) {
        if (getPermissionState(COARSE_LOCATION) == PermissionState.GRANTED) {
            startWatch(call);
        } else {
            call.reject("Location permission was denied");
        }
    }

    private void getPosition(final PluginCall call) {
        int maximumAge = call.getInt("maximumAge", 0).intValue();
        Location location = this.implementation.getLastLocation(maximumAge);
        if (location != null) {
            call.resolve(getJSObjectForLocation(location));
        } else {
            this.implementation.sendLocation(isHighAccuracy(call), new LocationResultCallback() { // from class: com.capacitorjs.plugins.geolocation.GeolocationPlugin.2
                @Override // com.capacitorjs.plugins.geolocation.LocationResultCallback
                public void success(Location location2) {
                    call.resolve(GeolocationPlugin.this.getJSObjectForLocation(location2));
                }

                @Override // com.capacitorjs.plugins.geolocation.LocationResultCallback
                public void error(String message) {
                    call.reject(message);
                }
            });
        }
    }

    private void startWatch(final PluginCall call) {
        int timeout = call.getInt("timeout", 10000).intValue();
        int minUpdateInterval = call.getInt("minimumUpdateInterval", 5000).intValue();
        this.implementation.requestLocationUpdates(isHighAccuracy(call), timeout, minUpdateInterval, new LocationResultCallback() { // from class: com.capacitorjs.plugins.geolocation.GeolocationPlugin.3
            @Override // com.capacitorjs.plugins.geolocation.LocationResultCallback
            public void success(Location location) {
                call.resolve(GeolocationPlugin.this.getJSObjectForLocation(location));
            }

            @Override // com.capacitorjs.plugins.geolocation.LocationResultCallback
            public void error(String message) {
                call.reject(message);
            }
        });
        this.watchingCalls.put(call.getCallbackId(), call);
    }

    @PluginMethod
    public void clearWatch(PluginCall call) {
        String callbackId = call.getString("id");
        if (callbackId != null) {
            PluginCall removed = this.watchingCalls.remove(callbackId);
            if (removed != null) {
                removed.release(this.bridge);
            }
            if (this.watchingCalls.size() == 0) {
                this.implementation.clearLocationUpdates();
            }
            call.resolve();
            return;
        }
        call.reject("Watch call id must be provided");
    }

    /* JADX INFO: Access modifiers changed from: private */
    public JSObject getJSObjectForLocation(Location location) {
        JSObject ret = new JSObject();
        JSObject coords = new JSObject();
        ret.put("coords", (Object) coords);
        ret.put("timestamp", location.getTime());
        coords.put("latitude", location.getLatitude());
        coords.put("longitude", location.getLongitude());
        coords.put("accuracy", location.getAccuracy());
        coords.put("altitude", location.getAltitude());
        if (Build.VERSION.SDK_INT >= 26) {
            coords.put("altitudeAccuracy", location.getVerticalAccuracyMeters());
        }
        coords.put("speed", location.getSpeed());
        coords.put("heading", location.getBearing());
        return ret;
    }

    private String getAlias(PluginCall call) {
        if (Build.VERSION.SDK_INT < 31) {
            return LOCATION;
        }
        boolean enableHighAccuracy = call.getBoolean("enableHighAccuracy", false).booleanValue();
        if (enableHighAccuracy) {
            return LOCATION;
        }
        return COARSE_LOCATION;
    }

    private boolean isHighAccuracy(PluginCall call) {
        boolean enableHighAccuracy = call.getBoolean("enableHighAccuracy", false).booleanValue();
        return enableHighAccuracy && getPermissionState(LOCATION) == PermissionState.GRANTED;
    }
}
