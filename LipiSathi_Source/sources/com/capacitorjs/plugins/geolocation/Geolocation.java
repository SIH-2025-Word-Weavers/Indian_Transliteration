package com.capacitorjs.plugins.geolocation;

import android.content.Context;
import android.location.Location;
import android.location.LocationManager;
import android.os.Looper;
import android.os.SystemClock;
import androidx.core.location.LocationManagerCompat;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.location.DeviceOrientationRequest;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.CancellationToken;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;

/* JADX INFO: loaded from: classes2.dex */
public class Geolocation {
    private Context context;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;

    public Geolocation(Context context) {
        this.context = context;
    }

    public Boolean isLocationServicesEnabled() {
        LocationManager lm = (LocationManager) this.context.getSystemService("location");
        return Boolean.valueOf(LocationManagerCompat.isLocationEnabled(lm));
    }

    public void sendLocation(boolean enableHighAccuracy, final LocationResultCallback resultCallback) {
        int resultCode = GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(this.context);
        if (resultCode == 0) {
            LocationManager lm = (LocationManager) this.context.getSystemService("location");
            if (isLocationServicesEnabled().booleanValue()) {
                boolean networkEnabled = false;
                try {
                    networkEnabled = lm.isProviderEnabled("network");
                } catch (Exception e) {
                }
                int lowPriority = networkEnabled ? 102 : 104;
                int priority = enableHighAccuracy ? 100 : lowPriority;
                LocationServices.getFusedLocationProviderClient(this.context).getCurrentLocation(priority, (CancellationToken) null).addOnFailureListener(new OnFailureListener() { // from class: com.capacitorjs.plugins.geolocation.Geolocation$$ExternalSyntheticLambda0
                    @Override // com.google.android.gms.tasks.OnFailureListener
                    public final void onFailure(Exception exc) {
                        resultCallback.error(exc.getMessage());
                    }
                }).addOnSuccessListener(new OnSuccessListener() { // from class: com.capacitorjs.plugins.geolocation.Geolocation$$ExternalSyntheticLambda1
                    @Override // com.google.android.gms.tasks.OnSuccessListener
                    public final void onSuccess(Object obj) {
                        Geolocation.lambda$sendLocation$1(resultCallback, (Location) obj);
                    }
                });
                return;
            }
            resultCallback.error("location disabled");
            return;
        }
        resultCallback.error("Google Play Services not available");
    }

    static /* synthetic */ void lambda$sendLocation$1(LocationResultCallback resultCallback, Location location) {
        if (location == null) {
            resultCallback.error("location unavailable");
        } else {
            resultCallback.success(location);
        }
    }

    public void requestLocationUpdates(boolean enableHighAccuracy, int timeout, int minUpdateInterval, final LocationResultCallback resultCallback) {
        int resultCode = GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(this.context);
        if (resultCode == 0) {
            clearLocationUpdates();
            this.fusedLocationClient = LocationServices.getFusedLocationProviderClient(this.context);
            LocationManager lm = (LocationManager) this.context.getSystemService("location");
            if (isLocationServicesEnabled().booleanValue()) {
                boolean networkEnabled = false;
                try {
                    networkEnabled = lm.isProviderEnabled("network");
                } catch (Exception e) {
                }
                int lowPriority = networkEnabled ? 102 : 104;
                int priority = enableHighAccuracy ? 100 : lowPriority;
                LocationRequest locationRequest = new LocationRequest.Builder(DeviceOrientationRequest.OUTPUT_PERIOD_MEDIUM).setMaxUpdateDelayMillis(timeout).setMinUpdateIntervalMillis(minUpdateInterval).setPriority(priority).build();
                LocationCallback locationCallback = new LocationCallback() { // from class: com.capacitorjs.plugins.geolocation.Geolocation.1
                    @Override // com.google.android.gms.location.LocationCallback
                    public void onLocationResult(LocationResult locationResult) {
                        Location lastLocation = locationResult.getLastLocation();
                        if (lastLocation == null) {
                            resultCallback.error("location unavailable");
                        } else {
                            resultCallback.success(lastLocation);
                        }
                    }
                };
                this.locationCallback = locationCallback;
                this.fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, (Looper) null);
                return;
            }
            resultCallback.error("location disabled");
            return;
        }
        resultCallback.error("Google Play Services not available");
    }

    public void clearLocationUpdates() {
        LocationCallback locationCallback = this.locationCallback;
        if (locationCallback != null) {
            this.fusedLocationClient.removeLocationUpdates(locationCallback);
            this.locationCallback = null;
        }
    }

    public Location getLastLocation(int maximumAge) {
        Location lastLoc = null;
        LocationManager lm = (LocationManager) this.context.getSystemService("location");
        for (String provider : lm.getAllProviders()) {
            Location tmpLoc = lm.getLastKnownLocation(provider);
            if (tmpLoc != null) {
                long locationAge = SystemClock.elapsedRealtimeNanos() - tmpLoc.getElapsedRealtimeNanos();
                long maximumAgeNanoSec = ((long) maximumAge) * 1000000;
                if (locationAge <= maximumAgeNanoSec && (lastLoc == null || lastLoc.getElapsedRealtimeNanos() > tmpLoc.getElapsedRealtimeNanos())) {
                    lastLoc = tmpLoc;
                }
            }
        }
        return lastLoc;
    }
}
