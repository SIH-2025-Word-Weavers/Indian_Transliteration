package com.google.android.gms.dynamite;

import android.content.Context;
import android.content.pm.ProviderInfo;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.IInterface;
import android.os.RemoteException;
import android.os.SystemClock;
import android.util.Log;
import com.google.android.gms.common.GoogleApiAvailabilityLight;
import com.google.android.gms.common.internal.Objects;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.CrashUtils;
import com.google.android.gms.dynamic.IObjectWrapper;
import com.google.android.gms.dynamic.ObjectWrapper;
import dalvik.system.DelegateLastClassLoader;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-basement@@18.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class DynamiteModule {
    public static final int LOCAL = -1;
    public static final int NONE = 0;
    public static final int NO_SELECTION = 0;
    public static final int REMOTE = 1;
    private static Boolean zzb;
    private static String zzc;
    private static boolean zzd;
    private static zzq zzk;
    private static zzr zzl;
    private final Context zzj;
    private static int zze = -1;
    private static Boolean zzf = null;
    private static final ThreadLocal zzg = new ThreadLocal();
    private static final ThreadLocal zzh = new zzd();
    private static final VersionPolicy.IVersions zzi = new zze();
    public static final VersionPolicy PREFER_REMOTE = new zzf();
    public static final VersionPolicy PREFER_LOCAL = new zzg();
    public static final VersionPolicy PREFER_REMOTE_VERSION_NO_FORCE_STAGING = new zzh();
    public static final VersionPolicy PREFER_HIGHEST_OR_LOCAL_VERSION = new zzi();
    public static final VersionPolicy PREFER_HIGHEST_OR_LOCAL_VERSION_NO_FORCE_STAGING = new zzj();
    public static final VersionPolicy PREFER_HIGHEST_OR_REMOTE_VERSION = new zzk();
    public static final VersionPolicy zza = new zzl();

    /* JADX INFO: compiled from: com.google.android.gms:play-services-basement@@18.1.0 */
    public static class DynamiteLoaderClassLoader {
        public static ClassLoader sClassLoader;
    }

    /* JADX INFO: compiled from: com.google.android.gms:play-services-basement@@18.1.0 */
    public static class LoadingException extends Exception {
        /* synthetic */ LoadingException(String str, zzp zzpVar) {
            super(str);
        }

        /* synthetic */ LoadingException(String str, Throwable th, zzp zzpVar) {
            super(str, th);
        }
    }

    /* JADX INFO: compiled from: com.google.android.gms:play-services-basement@@18.1.0 */
    public interface VersionPolicy {

        /* JADX INFO: compiled from: com.google.android.gms:play-services-basement@@18.1.0 */
        public interface IVersions {
            int zza(Context context, String str);

            int zzb(Context context, String str, boolean z) throws LoadingException;
        }

        /* JADX INFO: compiled from: com.google.android.gms:play-services-basement@@18.1.0 */
        public static class SelectionResult {
            public int localVersion = 0;
            public int remoteVersion = 0;
            public int selection = 0;
        }

        SelectionResult selectModule(Context context, String str, IVersions iVersions) throws LoadingException;
    }

    private DynamiteModule(Context context) {
        Preconditions.checkNotNull(context);
        this.zzj = context;
    }

    public static int getLocalVersion(Context context, String moduleId) {
        try {
            Class<?> clsLoadClass = context.getApplicationContext().getClassLoader().loadClass("com.google.android.gms.dynamite.descriptors." + moduleId + ".ModuleDescriptor");
            Field declaredField = clsLoadClass.getDeclaredField("MODULE_ID");
            Field declaredField2 = clsLoadClass.getDeclaredField("MODULE_VERSION");
            if (Objects.equal(declaredField.get(null), moduleId)) {
                return declaredField2.getInt(null);
            }
            Log.e("DynamiteModule", "Module descriptor id '" + String.valueOf(declaredField.get(null)) + "' didn't match expected id '" + moduleId + "'");
            return 0;
        } catch (ClassNotFoundException e) {
            Log.w("DynamiteModule", "Local module descriptor class for " + moduleId + " not found.");
            return 0;
        } catch (Exception e2) {
            Log.e("DynamiteModule", "Failed to load module descriptor class: ".concat(String.valueOf(e2.getMessage())));
            return 0;
        }
    }

    public static int getRemoteVersion(Context context, String moduleId) {
        return zza(context, moduleId, false);
    }

    /* JADX WARN: Code duplicated, block: B:101:0x0209 A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:103:0x0212 A[Catch: all -> 0x021b, TRY_ENTER, TryCatch #3 {, blocks: (B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a), top: B:149:0x00a4, outer: #7 }] */
    /* JADX WARN: Code duplicated, block: B:133:0x0296 A[Catch: all -> 0x02df, TryCatch #7 {all -> 0x02df, blocks: (B:3:0x0025, B:7:0x006f, B:12:0x0077, B:15:0x007d, B:26:0x009f, B:109:0x021f, B:110:0x022a, B:112:0x022c, B:114:0x022e, B:115:0x0236, B:133:0x0296, B:134:0x02ad, B:117:0x0238, B:119:0x0256, B:121:0x0267, B:131:0x028d, B:132:0x0295, B:135:0x02ae, B:136:0x02de), top: B:153:0x0025, inners: #6 }] */
    /* JADX WARN: Code duplicated, block: B:149:0x00a4 A[EXC_TOP_SPLITTER, SYNTHETIC] */
    /* JADX WARN: Code duplicated, block: B:150:0x00d6 A[EXC_TOP_SPLITTER, SYNTHETIC] */
    /* JADX WARN: Code duplicated, block: B:152:0x009f A[EXC_TOP_SPLITTER, SYNTHETIC] */
    /* JADX WARN: Code duplicated, block: B:15:0x007d A[Catch: all -> 0x02df, TRY_LEAVE, TryCatch #7 {all -> 0x02df, blocks: (B:3:0x0025, B:7:0x006f, B:12:0x0077, B:15:0x007d, B:26:0x009f, B:109:0x021f, B:110:0x022a, B:112:0x022c, B:114:0x022e, B:115:0x0236, B:133:0x0296, B:134:0x02ad, B:117:0x0238, B:119:0x0256, B:121:0x0267, B:131:0x028d, B:132:0x0295, B:135:0x02ae, B:136:0x02de), top: B:153:0x0025, inners: #6 }] */
    /* JADX WARN: Code duplicated, block: B:18:0x0085  */
    /* JADX WARN: Code duplicated, block: B:19:0x0089  */
    /* JADX WARN: Code duplicated, block: B:22:0x0095  */
    /* JADX WARN: Code duplicated, block: B:25:0x009d A[DONT_INVERT] */
    /* JADX WARN: Code duplicated, block: B:31:0x00aa A[Catch: all -> 0x021b, TryCatch #3 {, blocks: (B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a), top: B:149:0x00a4, outer: #7 }] */
    /* JADX WARN: Code duplicated, block: B:34:0x00af A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TRY_ENTER, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:36:0x00b5 A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:41:0x00dc A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TRY_ENTER, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:67:0x0153 A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:72:0x015f A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:74:0x0183 A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:76:0x018a A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:78:0x0192 A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:79:0x01a1 A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:81:0x01aa  */
    /* JADX WARN: Code duplicated, block: B:83:0x01ad A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:84:0x01bd A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:87:0x01d2 A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TRY_LEAVE, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:90:0x01df  */
    /* JADX WARN: Code duplicated, block: B:91:0x01e3  */
    /* JADX WARN: Code duplicated, block: B:94:0x01ef  */
    /* JADX WARN: Code duplicated, block: B:97:0x01f7 A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TRY_ENTER, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Code duplicated, block: B:99:0x0200 A[Catch: all -> 0x021e, LoadingException -> 0x022b, RemoteException -> 0x022d, TryCatch #7 {RemoteException -> 0x022d, LoadingException -> 0x022b, all -> 0x021e, blocks: (B:28:0x00a3, B:34:0x00af, B:36:0x00b5, B:37:0x00d5, B:41:0x00dc, B:43:0x00e4, B:45:0x00e8, B:46:0x00f4, B:53:0x0102, B:55:0x0108, B:57:0x012f, B:59:0x0137, B:60:0x013e, B:61:0x0146, B:56:0x011c, B:64:0x0149, B:65:0x014a, B:66:0x0152, B:67:0x0153, B:68:0x015b, B:71:0x015e, B:72:0x015f, B:74:0x0183, B:76:0x018a, B:78:0x0192, B:85:0x01cc, B:87:0x01d2, B:97:0x01f7, B:98:0x01ff, B:79:0x01a1, B:80:0x01a9, B:83:0x01ad, B:84:0x01bd, B:99:0x0200, B:100:0x0208, B:101:0x0209, B:102:0x0211, B:107:0x021d, B:47:0x00f5, B:51:0x00fd, B:52:0x0101, B:29:0x00a4, B:31:0x00aa, B:32:0x00ac, B:103:0x0212, B:104:0x021a, B:38:0x00d6, B:39:0x00d8), top: B:154:0x00a3, inners: #2, #3, #4 }] */
    /* JADX WARN: Instruction removed from duplicated block: B:133:0x0296, please report this as an issue */
    /* JADX WARN: Instruction removed from duplicated block: B:36:0x00b5, please report this as an issue */
    /* JADX WARN: Instruction removed from duplicated block: B:72:0x015f, please report this as an issue */
    public static DynamiteModule load(Context context, VersionPolicy policy, String moduleId) throws LoadingException {
        int i;
        Boolean bool;
        zzq zzqVarZzg;
        int iZze;
        IObjectWrapper iObjectWrapperZzh;
        Object objUnwrap;
        DynamiteModule dynamiteModule;
        zzn zznVar;
        Cursor cursor;
        zzr zzrVar;
        zzn zznVar2;
        Boolean boolValueOf;
        IObjectWrapper iObjectWrapperZze;
        Cursor cursor2;
        ThreadLocal threadLocal = zzg;
        zzn zznVar3 = (zzn) threadLocal.get();
        zzn zznVar4 = new zzn(null);
        threadLocal.set(zznVar4);
        ThreadLocal threadLocal2 = zzh;
        long jLongValue = ((Long) threadLocal2.get()).longValue();
        try {
            threadLocal2.set(Long.valueOf(SystemClock.elapsedRealtime()));
            VersionPolicy.SelectionResult selectionResultSelectModule = policy.selectModule(context, moduleId, zzi);
            Log.i("DynamiteModule", "Considering local module " + moduleId + ":" + selectionResultSelectModule.localVersion + " and remote module " + moduleId + ":" + selectionResultSelectModule.remoteVersion);
            int i2 = selectionResultSelectModule.selection;
            if (i2 != 0) {
                if (i2 != -1) {
                    if (i2 == 1 || selectionResultSelectModule.remoteVersion != 0) {
                        if (i2 == -1) {
                            DynamiteModule dynamiteModuleZzc = zzc(context, moduleId);
                            if (jLongValue == 0) {
                                threadLocal2.remove();
                            } else {
                                threadLocal2.set(Long.valueOf(jLongValue));
                            }
                            cursor2 = zznVar4.zza;
                            if (cursor2 != null) {
                                cursor2.close();
                            }
                            threadLocal.set(zznVar3);
                            return dynamiteModuleZzc;
                        }
                        if (i2 == 1) {
                            throw new LoadingException("VersionPolicy returned invalid code:" + i2, null);
                        }
                        try {
                            i = selectionResultSelectModule.remoteVersion;
                            try {
                                synchronized (DynamiteModule.class) {
                                    if (zzf(context)) {
                                        throw new LoadingException("Remote loading disabled", null);
                                    }
                                    bool = zzb;
                                }
                                if (bool != null) {
                                    throw new LoadingException("Failed to determine which loading route to use.", null);
                                }
                                if (bool.booleanValue()) {
                                    Log.i("DynamiteModule", "Selected remote version of " + moduleId + ", version >= " + i);
                                    synchronized (DynamiteModule.class) {
                                        zzrVar = zzl;
                                    }
                                    if (zzrVar != null) {
                                        throw new LoadingException("DynamiteLoaderV2 was not cached.", null);
                                    }
                                    zznVar2 = (zzn) threadLocal.get();
                                    if (zznVar2 != null || zznVar2.zza == null) {
                                        throw new LoadingException("No result cursor", null);
                                    }
                                    Context applicationContext = context.getApplicationContext();
                                    Cursor cursor3 = zznVar2.zza;
                                    ObjectWrapper.wrap(null);
                                    synchronized (DynamiteModule.class) {
                                        boolValueOf = Boolean.valueOf(zze >= 2);
                                    }
                                    if (boolValueOf.booleanValue()) {
                                        Log.v("DynamiteModule", "Dynamite loader version >= 2, using loadModule2NoCrashUtils");
                                        iObjectWrapperZze = zzrVar.zzf(ObjectWrapper.wrap(applicationContext), moduleId, i, ObjectWrapper.wrap(cursor3));
                                    } else {
                                        Log.w("DynamiteModule", "Dynamite loader version < 2, falling back to loadModule2");
                                        iObjectWrapperZze = zzrVar.zze(ObjectWrapper.wrap(applicationContext), moduleId, i, ObjectWrapper.wrap(cursor3));
                                    }
                                    Context context2 = (Context) ObjectWrapper.unwrap(iObjectWrapperZze);
                                    if (context2 == null) {
                                        throw new LoadingException("Failed to get module context", null);
                                    }
                                    dynamiteModule = new DynamiteModule(context2);
                                } else {
                                    Log.i("DynamiteModule", "Selected remote version of " + moduleId + ", version >= " + i);
                                    zzqVarZzg = zzg(context);
                                    if (zzqVarZzg != null) {
                                        throw new LoadingException("Failed to create IDynamiteLoader.", null);
                                    }
                                    iZze = zzqVarZzg.zze();
                                    if (iZze >= 3) {
                                        zznVar = (zzn) threadLocal.get();
                                        if (zznVar != null) {
                                            throw new LoadingException("No cached result cursor holder", null);
                                        }
                                        iObjectWrapperZzh = zzqVarZzg.zzi(ObjectWrapper.wrap(context), moduleId, i, ObjectWrapper.wrap(zznVar.zza));
                                    } else if (iZze == 2) {
                                        Log.w("DynamiteModule", "IDynamite loader version = 2");
                                        iObjectWrapperZzh = zzqVarZzg.zzj(ObjectWrapper.wrap(context), moduleId, i);
                                    } else {
                                        Log.w("DynamiteModule", "Dynamite loader version < 2, falling back to createModuleContext");
                                        iObjectWrapperZzh = zzqVarZzg.zzh(ObjectWrapper.wrap(context), moduleId, i);
                                    }
                                    objUnwrap = ObjectWrapper.unwrap(iObjectWrapperZzh);
                                    if (objUnwrap != null) {
                                        throw new LoadingException("Failed to load remote module.", null);
                                    }
                                    dynamiteModule = new DynamiteModule((Context) objUnwrap);
                                }
                                if (jLongValue == 0) {
                                    threadLocal2.remove();
                                } else {
                                    threadLocal2.set(Long.valueOf(jLongValue));
                                }
                                cursor = zznVar4.zza;
                                if (cursor != null) {
                                    cursor.close();
                                }
                                threadLocal.set(zznVar3);
                                return dynamiteModule;
                            } catch (RemoteException e) {
                                throw new LoadingException("Failed to load remote module.", e, null);
                            } catch (LoadingException e2) {
                                throw e2;
                            } catch (Throwable th) {
                                CrashUtils.addDynamiteErrorToDropBox(context, th);
                                throw new LoadingException("Failed to load remote module.", th, null);
                            }
                        } catch (LoadingException e3) {
                            Log.w("DynamiteModule", "Failed to load remote module: " + e3.getMessage());
                            int i3 = selectionResultSelectModule.localVersion;
                            if (i3 == 0 || policy.selectModule(context, moduleId, new zzo(i3, 0)).selection != -1) {
                                throw new LoadingException("Remote load failed. No local fallback found.", e3, null);
                            }
                            DynamiteModule dynamiteModuleZzc2 = zzc(context, moduleId);
                            if (jLongValue == 0) {
                                zzh.remove();
                            } else {
                                zzh.set(Long.valueOf(jLongValue));
                            }
                            Cursor cursor4 = zznVar4.zza;
                            if (cursor4 != null) {
                                cursor4.close();
                            }
                            zzg.set(zznVar3);
                            return dynamiteModuleZzc2;
                        }
                    }
                } else if (selectionResultSelectModule.localVersion != 0) {
                    i2 = -1;
                    if (i2 == 1) {
                    }
                    if (i2 == -1) {
                        DynamiteModule dynamiteModuleZzc3 = zzc(context, moduleId);
                        if (jLongValue == 0) {
                            threadLocal2.remove();
                        } else {
                            threadLocal2.set(Long.valueOf(jLongValue));
                        }
                        cursor2 = zznVar4.zza;
                        if (cursor2 != null) {
                            cursor2.close();
                        }
                        threadLocal.set(zznVar3);
                        return dynamiteModuleZzc3;
                    }
                    if (i2 == 1) {
                        throw new LoadingException("VersionPolicy returned invalid code:" + i2, null);
                    }
                    i = selectionResultSelectModule.remoteVersion;
                    synchronized (DynamiteModule.class) {
                        if (zzf(context)) {
                            throw new LoadingException("Remote loading disabled", null);
                        }
                        bool = zzb;
                        if (bool != null) {
                            throw new LoadingException("Failed to determine which loading route to use.", null);
                        }
                        if (bool.booleanValue()) {
                            Log.i("DynamiteModule", "Selected remote version of " + moduleId + ", version >= " + i);
                            synchronized (DynamiteModule.class) {
                                zzrVar = zzl;
                                if (zzrVar != null) {
                                    throw new LoadingException("DynamiteLoaderV2 was not cached.", null);
                                }
                                zznVar2 = (zzn) threadLocal.get();
                                if (zznVar2 != null) {
                                }
                                throw new LoadingException("No result cursor", null);
                            }
                        }
                        Log.i("DynamiteModule", "Selected remote version of " + moduleId + ", version >= " + i);
                        zzqVarZzg = zzg(context);
                        if (zzqVarZzg != null) {
                            throw new LoadingException("Failed to create IDynamiteLoader.", null);
                        }
                        iZze = zzqVarZzg.zze();
                        if (iZze >= 3) {
                            zznVar = (zzn) threadLocal.get();
                            if (zznVar != null) {
                                throw new LoadingException("No cached result cursor holder", null);
                            }
                            iObjectWrapperZzh = zzqVarZzg.zzi(ObjectWrapper.wrap(context), moduleId, i, ObjectWrapper.wrap(zznVar.zza));
                        } else if (iZze == 2) {
                            Log.w("DynamiteModule", "IDynamite loader version = 2");
                            iObjectWrapperZzh = zzqVarZzg.zzj(ObjectWrapper.wrap(context), moduleId, i);
                        } else {
                            Log.w("DynamiteModule", "Dynamite loader version < 2, falling back to createModuleContext");
                            iObjectWrapperZzh = zzqVarZzg.zzh(ObjectWrapper.wrap(context), moduleId, i);
                        }
                        objUnwrap = ObjectWrapper.unwrap(iObjectWrapperZzh);
                        if (objUnwrap != null) {
                            throw new LoadingException("Failed to load remote module.", null);
                        }
                        dynamiteModule = new DynamiteModule((Context) objUnwrap);
                        if (jLongValue == 0) {
                            threadLocal2.remove();
                        } else {
                            threadLocal2.set(Long.valueOf(jLongValue));
                        }
                        cursor = zznVar4.zza;
                        if (cursor != null) {
                            cursor.close();
                        }
                        threadLocal.set(zznVar3);
                        return dynamiteModule;
                    }
                }
            }
            throw new LoadingException("No acceptable module " + moduleId + " found. Local version is " + selectionResultSelectModule.localVersion + " and remote version is " + selectionResultSelectModule.remoteVersion + ".", null);
        } catch (Throwable th2) {
            if (jLongValue == 0) {
                zzh.remove();
            } else {
                zzh.set(Long.valueOf(jLongValue));
            }
            Cursor cursor5 = zznVar4.zza;
            if (cursor5 != null) {
                cursor5.close();
            }
            zzg.set(zznVar3);
            throw th2;
        }
    }

    /* JADX WARN: Code duplicated, block: B:121:0x01c8 A[Catch: all -> 0x01cf, TryCatch #7 {all -> 0x01cf, blocks: (B:3:0x0002, B:64:0x00e0, B:66:0x00e6, B:71:0x0107, B:93:0x0161, B:97:0x0170, B:121:0x01c8, B:122:0x01cb, B:114:0x01be, B:69:0x00ec, B:125:0x01ce, B:4:0x0003, B:7:0x0009, B:8:0x0025, B:62:0x00dd, B:21:0x0048, B:43:0x009d, B:46:0x00a0, B:55:0x00bb, B:63:0x00df, B:61:0x00c1), top: B:136:0x0002, inners: #6, #8 }] */
    /* JADX WARN: Code duplicated, block: B:146:? A[Catch: all -> 0x01cf, SYNTHETIC, TRY_LEAVE, TryCatch #7 {all -> 0x01cf, blocks: (B:3:0x0002, B:64:0x00e0, B:66:0x00e6, B:71:0x0107, B:93:0x0161, B:97:0x0170, B:121:0x01c8, B:122:0x01cb, B:114:0x01be, B:69:0x00ec, B:125:0x01ce, B:4:0x0003, B:7:0x0009, B:8:0x0025, B:62:0x00dd, B:21:0x0048, B:43:0x009d, B:46:0x00a0, B:55:0x00bb, B:63:0x00df, B:61:0x00c1), top: B:136:0x0002, inners: #6, #8 }] */
    public static int zza(Context context, String str, boolean z) {
        Throwable th;
        RemoteException e;
        Cursor cursor;
        try {
            synchronized (DynamiteModule.class) {
                Boolean bool = zzb;
                Cursor cursor2 = null;
                int iZzf = 0;
                if (bool == null) {
                    try {
                        Field declaredField = context.getApplicationContext().getClassLoader().loadClass(DynamiteLoaderClassLoader.class.getName()).getDeclaredField("sClassLoader");
                        synchronized (declaredField.getDeclaringClass()) {
                            try {
                                ClassLoader classLoader = (ClassLoader) declaredField.get(null);
                                if (classLoader == ClassLoader.getSystemClassLoader()) {
                                    bool = Boolean.FALSE;
                                } else if (classLoader != null) {
                                    try {
                                        zzd(classLoader);
                                    } catch (LoadingException e2) {
                                    }
                                    bool = Boolean.TRUE;
                                } else {
                                    if (!zzf(context)) {
                                        return 0;
                                    }
                                    if (zzd || Boolean.TRUE.equals(null)) {
                                        declaredField.set(null, ClassLoader.getSystemClassLoader());
                                        bool = Boolean.FALSE;
                                    } else {
                                        try {
                                            int iZzb = zzb(context, str, z, true);
                                            String str2 = zzc;
                                            if (str2 != null && !str2.isEmpty()) {
                                                ClassLoader classLoaderZza = zzb.zza();
                                                if (classLoaderZza == null) {
                                                    if (Build.VERSION.SDK_INT >= 29) {
                                                        String str3 = zzc;
                                                        Preconditions.checkNotNull(str3);
                                                        classLoaderZza = new DelegateLastClassLoader(str3, ClassLoader.getSystemClassLoader());
                                                    } else {
                                                        String str4 = zzc;
                                                        Preconditions.checkNotNull(str4);
                                                        classLoaderZza = new zzc(str4, ClassLoader.getSystemClassLoader());
                                                    }
                                                }
                                                zzd(classLoaderZza);
                                                declaredField.set(null, classLoaderZza);
                                                zzb = Boolean.TRUE;
                                                return iZzb;
                                            }
                                            return iZzb;
                                        } catch (LoadingException e3) {
                                            declaredField.set(null, ClassLoader.getSystemClassLoader());
                                            bool = Boolean.FALSE;
                                        }
                                    }
                                }
                                zzb = bool;
                            } catch (Throwable th2) {
                                throw th2;
                            }
                        }
                    } catch (ClassNotFoundException | IllegalAccessException | NoSuchFieldException e4) {
                        Log.w("DynamiteModule", "Failed to load module via V2: " + e4.toString());
                        bool = Boolean.FALSE;
                    }
                }
                if (bool.booleanValue()) {
                    try {
                        return zzb(context, str, z, false);
                    } catch (LoadingException e5) {
                        Log.w("DynamiteModule", "Failed to retrieve remote module version: " + e5.getMessage());
                        return 0;
                    }
                }
                zzq zzqVarZzg = zzg(context);
                if (zzqVarZzg != null) {
                    try {
                        int iZze = zzqVarZzg.zze();
                        if (iZze >= 3) {
                            zzn zznVar = (zzn) zzg.get();
                            if (zznVar == null || (cursor = zznVar.zza) == null) {
                                Cursor cursor3 = (Cursor) ObjectWrapper.unwrap(zzqVarZzg.zzk(ObjectWrapper.wrap(context), str, z, ((Long) zzh.get()).longValue()));
                                if (cursor3 != null) {
                                    try {
                                        if (cursor3.moveToFirst()) {
                                            int i = cursor3.getInt(0);
                                            cursor2 = (i <= 0 || !zze(cursor3)) ? cursor3 : null;
                                            if (cursor2 != null) {
                                                cursor2.close();
                                            }
                                            iZzf = i;
                                        }
                                    } catch (RemoteException e6) {
                                        e = e6;
                                        cursor2 = cursor3;
                                        try {
                                            Log.w("DynamiteModule", "Failed to retrieve remote module version: " + e.getMessage());
                                            if (cursor2 != null) {
                                                cursor2.close();
                                            }
                                        } catch (Throwable th3) {
                                            th = th3;
                                            if (cursor2 != null) {
                                                throw th;
                                            }
                                            cursor2.close();
                                            throw th;
                                        }
                                    } catch (Throwable th4) {
                                        th = th4;
                                        cursor2 = cursor3;
                                        if (cursor2 != null) {
                                            throw th;
                                        }
                                        cursor2.close();
                                        throw th;
                                    }
                                }
                                Log.w("DynamiteModule", "Failed to retrieve remote module version.");
                                if (cursor3 != null) {
                                    cursor3.close();
                                }
                            } else {
                                iZzf = cursor.getInt(0);
                            }
                        } else if (iZze == 2) {
                            Log.w("DynamiteModule", "IDynamite loader version = 2, no high precision latency measurement.");
                            iZzf = zzqVarZzg.zzg(ObjectWrapper.wrap(context), str, z);
                        } else {
                            Log.w("DynamiteModule", "IDynamite loader version < 2, falling back to getModuleVersion2");
                            iZzf = zzqVarZzg.zzf(ObjectWrapper.wrap(context), str, z);
                        }
                    } catch (RemoteException e7) {
                        e = e7;
                    } catch (Throwable th5) {
                        th = th5;
                    }
                }
                return iZzf;
            }
        } catch (Throwable th6) {
            CrashUtils.addDynamiteErrorToDropBox(context, th6);
            throw th6;
        }
    }

    /* JADX WARN: Code duplicated, block: B:64:0x00d5  */
    private static int zzb(Context context, String str, boolean z, boolean z2) throws Throwable {
        Throwable th;
        Exception e;
        Cursor cursorQuery;
        Cursor cursor = null;
        byte b = 0;
        byte b2 = 0;
        byte b3 = 0;
        try {
            boolean z3 = true;
            cursorQuery = context.getContentResolver().query(new Uri.Builder().scheme("content").authority("com.google.android.gms.chimera").path(true != z ? "api" : "api_force_staging").appendPath(str).appendQueryParameter("requestStartTime", String.valueOf(((Long) zzh.get()).longValue())).build(), null, null, null, null);
            if (cursorQuery != null) {
                try {
                    if (cursorQuery.moveToFirst()) {
                        boolean z4 = false;
                        int i = cursorQuery.getInt(0);
                        if (i > 0) {
                            synchronized (DynamiteModule.class) {
                                zzc = cursorQuery.getString(2);
                                int columnIndex = cursorQuery.getColumnIndex("loaderVersion");
                                if (columnIndex >= 0) {
                                    zze = cursorQuery.getInt(columnIndex);
                                }
                                int columnIndex2 = cursorQuery.getColumnIndex("disableStandaloneDynamiteLoader2");
                                if (columnIndex2 >= 0) {
                                    if (cursorQuery.getInt(columnIndex2) == 0) {
                                        z3 = false;
                                    }
                                    zzd = z3;
                                    z4 = z3;
                                }
                            }
                            if (zze(cursorQuery)) {
                                cursorQuery = null;
                            }
                        }
                        if (!z2 || !z4) {
                            if (cursorQuery != null) {
                                cursorQuery.close();
                            }
                            return i;
                        }
                        try {
                            throw new LoadingException("forcing fallback to container DynamiteLoader impl", b2 == true ? 1 : 0);
                        } catch (Exception e2) {
                            e = e2;
                            try {
                                if (e instanceof LoadingException) {
                                    throw e;
                                }
                                throw new LoadingException("V2 version check failed", e, b == true ? 1 : 0);
                            } catch (Throwable th2) {
                                th = th2;
                                cursor = cursorQuery;
                                if (cursor != null) {
                                    cursor.close();
                                }
                                throw th;
                            }
                        } catch (Throwable th3) {
                            th = th3;
                            cursor = cursorQuery;
                            if (cursor != null) {
                                cursor.close();
                            }
                            throw th;
                        }
                    }
                } catch (Exception e3) {
                    e = e3;
                } catch (Throwable th4) {
                    th = th4;
                    cursor = cursorQuery;
                }
            }
            Log.w("DynamiteModule", "Failed to retrieve remote module version.");
            throw new LoadingException("Failed to connect to dynamite module ContentResolver.", b3 == true ? 1 : 0);
        } catch (Exception e4) {
            e = e4;
            cursorQuery = null;
        } catch (Throwable th5) {
            th = th5;
        }
    }

    private static DynamiteModule zzc(Context context, String str) {
        Log.i("DynamiteModule", "Selected local version of ".concat(String.valueOf(str)));
        return new DynamiteModule(context.getApplicationContext());
    }

    private static void zzd(ClassLoader classLoader) throws LoadingException {
        zzr zzrVar;
        zzp zzpVar = null;
        try {
            IBinder iBinder = (IBinder) classLoader.loadClass("com.google.android.gms.dynamiteloader.DynamiteLoaderV2").getConstructor(new Class[0]).newInstance(new Object[0]);
            if (iBinder == null) {
                zzrVar = null;
            } else {
                IInterface iInterfaceQueryLocalInterface = iBinder.queryLocalInterface("com.google.android.gms.dynamite.IDynamiteLoaderV2");
                zzrVar = iInterfaceQueryLocalInterface instanceof zzr ? (zzr) iInterfaceQueryLocalInterface : new zzr(iBinder);
            }
            zzl = zzrVar;
        } catch (ClassNotFoundException | IllegalAccessException | InstantiationException | NoSuchMethodException | InvocationTargetException e) {
            throw new LoadingException("Failed to instantiate dynamite loader", e, zzpVar);
        }
    }

    private static boolean zze(Cursor cursor) {
        zzn zznVar = (zzn) zzg.get();
        if (zznVar == null || zznVar.zza != null) {
            return false;
        }
        zznVar.zza = cursor;
        return true;
    }

    private static boolean zzf(Context context) {
        if (Boolean.TRUE.equals(null) || Boolean.TRUE.equals(zzf)) {
            return true;
        }
        boolean zBooleanValue = false;
        if (zzf == null) {
            ProviderInfo providerInfoResolveContentProvider = context.getPackageManager().resolveContentProvider("com.google.android.gms.chimera", 0);
            if (GoogleApiAvailabilityLight.getInstance().isGooglePlayServicesAvailable(context, 10000000) == 0 && providerInfoResolveContentProvider != null && "com.google.android.gms".equals(providerInfoResolveContentProvider.packageName)) {
                zBooleanValue = true;
            }
            Boolean boolValueOf = Boolean.valueOf(zBooleanValue);
            zzf = boolValueOf;
            zBooleanValue = boolValueOf.booleanValue();
            if (zBooleanValue && providerInfoResolveContentProvider != null && providerInfoResolveContentProvider.applicationInfo != null && (providerInfoResolveContentProvider.applicationInfo.flags & 129) == 0) {
                Log.i("DynamiteModule", "Non-system-image GmsCore APK, forcing V1");
                zzd = true;
            }
        }
        if (!zBooleanValue) {
            Log.e("DynamiteModule", "Invalid GmsCore APK, remote loading disabled.");
        }
        return zBooleanValue;
    }

    private static zzq zzg(Context context) {
        zzq zzqVar;
        synchronized (DynamiteModule.class) {
            zzq zzqVar2 = zzk;
            if (zzqVar2 != null) {
                return zzqVar2;
            }
            try {
                IBinder iBinder = (IBinder) context.createPackageContext("com.google.android.gms", 3).getClassLoader().loadClass("com.google.android.gms.chimera.container.DynamiteLoaderImpl").newInstance();
                if (iBinder == null) {
                    zzqVar = null;
                } else {
                    IInterface iInterfaceQueryLocalInterface = iBinder.queryLocalInterface("com.google.android.gms.dynamite.IDynamiteLoader");
                    zzqVar = iInterfaceQueryLocalInterface instanceof zzq ? (zzq) iInterfaceQueryLocalInterface : new zzq(iBinder);
                }
                if (zzqVar != null) {
                    zzk = zzqVar;
                    return zzqVar;
                }
            } catch (Exception e) {
                Log.e("DynamiteModule", "Failed to load IDynamiteLoader from GmsCore: " + e.getMessage());
            }
            return null;
        }
    }

    public Context getModuleContext() {
        return this.zzj;
    }

    public IBinder instantiate(String className) throws LoadingException {
        try {
            return (IBinder) this.zzj.getClassLoader().loadClass(className).newInstance();
        } catch (ClassNotFoundException | IllegalAccessException | InstantiationException e) {
            throw new LoadingException("Failed to instantiate module class: ".concat(String.valueOf(className)), e, null);
        }
    }
}
