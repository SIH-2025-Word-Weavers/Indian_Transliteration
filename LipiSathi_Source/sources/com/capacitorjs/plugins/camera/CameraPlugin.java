package com.capacitorjs.plugins.camera;

import android.content.ActivityNotFoundException;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Parcelable;
import android.provider.MediaStore;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.ActivityResultRegistryOwner;
import androidx.activity.result.PickVisualMediaRequest;
import androidx.activity.result.contract.ActivityResultContract;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.FileProvider;
import com.getcapacitor.FileUtils;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import org.json.JSONException;

/* JADX INFO: loaded from: classes2.dex */
@CapacitorPlugin(name = "Camera", permissions = {@Permission(alias = CameraPlugin.CAMERA, strings = {"android.permission.CAMERA"}), @Permission(alias = CameraPlugin.PHOTOS, strings = {}), @Permission(alias = CameraPlugin.SAVE_GALLERY, strings = {"android.permission.READ_EXTERNAL_STORAGE", "android.permission.WRITE_EXTERNAL_STORAGE"}), @Permission(alias = CameraPlugin.READ_EXTERNAL_STORAGE, strings = {"android.permission.READ_EXTERNAL_STORAGE"})})
public class CameraPlugin extends Plugin {
    static final String CAMERA = "camera";
    private static final String IMAGE_EDIT_ERROR = "Unable to edit image";
    private static final String IMAGE_FILE_SAVE_ERROR = "Unable to create photo on disk";
    private static final String IMAGE_GALLERY_SAVE_ERROR = "Unable to save the image in the gallery";
    private static final String IMAGE_PROCESS_NO_FILE_ERROR = "Unable to process image, file not found on disk";
    private static final String INVALID_RESULT_TYPE_ERROR = "Invalid resultType option";
    private static final String NO_CAMERA_ACTIVITY_ERROR = "Unable to resolve camera activity";
    private static final String NO_CAMERA_ERROR = "Device doesn't have a camera available";
    private static final String NO_PHOTO_ACTIVITY_ERROR = "Unable to resolve photo activity";
    private static final String PERMISSION_DENIED_ERROR_CAMERA = "User denied access to camera";
    static final String PHOTOS = "photos";
    static final String READ_EXTERNAL_STORAGE = "readExternalStorage";
    static final String SAVE_GALLERY = "saveGallery";
    private static final String UNABLE_TO_PROCESS_IMAGE = "Unable to process image";
    private static final String USER_CANCELLED = "User cancelled photos app";
    private String imageEditedFileSavePath;
    private String imageFileSavePath;
    private Uri imageFileUri;
    private Uri imagePickedContentUri;
    private boolean isEdited = false;
    private boolean isFirstRequest = true;
    private boolean isSaved = false;
    private ActivityResultLauncher<PickVisualMediaRequest> pickMultipleMedia = null;
    private ActivityResultLauncher<PickVisualMediaRequest> pickMedia = null;
    private final AtomicInteger mNextLocalRequestCode = new AtomicInteger();
    private CameraSettings settings = new CameraSettings();

    @Override // com.getcapacitor.Plugin
    public void load() {
        super.load();
    }

    @PluginMethod
    public void getPhoto(PluginCall call) {
        this.isEdited = false;
        this.settings = getSettings(call);
        doShow(call);
    }

    @PluginMethod
    public void pickImages(PluginCall call) {
        this.settings = getSettings(call);
        openPhotos(call, true);
    }

    @PluginMethod
    public void pickLimitedLibraryPhotos(PluginCall call) {
        call.unimplemented("not supported on android");
    }

    @PluginMethod
    public void getLimitedLibraryPhotos(PluginCall call) {
        call.unimplemented("not supported on android");
    }

    /* JADX INFO: renamed from: com.capacitorjs.plugins.camera.CameraPlugin$1, reason: invalid class name */
    static /* synthetic */ class AnonymousClass1 {
        static final /* synthetic */ int[] $SwitchMap$com$capacitorjs$plugins$camera$CameraSource;

        static {
            int[] iArr = new int[CameraSource.values().length];
            $SwitchMap$com$capacitorjs$plugins$camera$CameraSource = iArr;
            try {
                iArr[CameraSource.CAMERA.ordinal()] = 1;
            } catch (NoSuchFieldError e) {
            }
            try {
                $SwitchMap$com$capacitorjs$plugins$camera$CameraSource[CameraSource.PHOTOS.ordinal()] = 2;
            } catch (NoSuchFieldError e2) {
            }
        }
    }

    private void doShow(PluginCall call) {
        switch (AnonymousClass1.$SwitchMap$com$capacitorjs$plugins$camera$CameraSource[this.settings.getSource().ordinal()]) {
            case 1:
                showCamera(call);
                break;
            case 2:
                showPhotos(call);
                break;
            default:
                showPrompt(call);
                break;
        }
    }

    private void showPrompt(final PluginCall call) {
        List<String> options = new ArrayList<>();
        options.add(call.getString("promptLabelPhoto", "From Photos"));
        options.add(call.getString("promptLabelPicture", "Take Picture"));
        CameraBottomSheetDialogFragment fragment = new CameraBottomSheetDialogFragment();
        fragment.setTitle(call.getString("promptLabelHeader", "Photo"));
        fragment.setOptions(options, new CameraBottomSheetDialogFragment.BottomSheetOnSelectedListener() { // from class: com.capacitorjs.plugins.camera.CameraPlugin$$ExternalSyntheticLambda3
            @Override // com.capacitorjs.plugins.camera.CameraBottomSheetDialogFragment.BottomSheetOnSelectedListener
            public final void onSelected(int i) {
                this.f$0.lambda$showPrompt$0(call, i);
            }
        }, new CameraBottomSheetDialogFragment.BottomSheetOnCanceledListener() { // from class: com.capacitorjs.plugins.camera.CameraPlugin$$ExternalSyntheticLambda4
            @Override // com.capacitorjs.plugins.camera.CameraBottomSheetDialogFragment.BottomSheetOnCanceledListener
            public final void onCanceled() {
                call.reject(CameraPlugin.USER_CANCELLED);
            }
        });
        fragment.show(getActivity().getSupportFragmentManager(), "capacitorModalsActionSheet");
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$showPrompt$0(PluginCall call, int index) {
        if (index == 0) {
            this.settings.setSource(CameraSource.PHOTOS);
            openPhotos(call);
        } else if (index == 1) {
            this.settings.setSource(CameraSource.CAMERA);
            openCamera(call);
        }
    }

    private void showCamera(PluginCall call) {
        if (!getContext().getPackageManager().hasSystemFeature("android.hardware.camera.any")) {
            call.reject(NO_CAMERA_ERROR);
        } else {
            openCamera(call);
        }
    }

    private void showPhotos(PluginCall call) {
        openPhotos(call);
    }

    private boolean checkCameraPermissions(PluginCall call) {
        String[] aliases;
        boolean needCameraPerms = isPermissionDeclared(CAMERA);
        boolean hasCameraPerms = !needCameraPerms || getPermissionState(CAMERA) == PermissionState.GRANTED;
        boolean hasGalleryPerms = getPermissionState(SAVE_GALLERY) == PermissionState.GRANTED;
        if (Build.VERSION.SDK_INT >= 29) {
            if (hasCameraPerms) {
                return true;
            }
            requestPermissionForAlias(CAMERA, call, "cameraPermissionsCallback");
            return false;
        }
        if (this.settings.isSaveToGallery() && ((!hasCameraPerms || !hasGalleryPerms) && this.isFirstRequest)) {
            this.isFirstRequest = false;
            if (needCameraPerms) {
                aliases = new String[]{CAMERA, SAVE_GALLERY};
            } else {
                aliases = new String[]{SAVE_GALLERY};
            }
            requestPermissionForAliases(aliases, call, "cameraPermissionsCallback");
            return false;
        }
        if (hasCameraPerms) {
            return true;
        }
        requestPermissionForAlias(CAMERA, call, "cameraPermissionsCallback");
        return false;
    }

    @PermissionCallback
    private void cameraPermissionsCallback(PluginCall call) {
        if (call.getMethodName().equals("pickImages")) {
            openPhotos(call, true);
        } else if (this.settings.getSource() == CameraSource.CAMERA && getPermissionState(CAMERA) != PermissionState.GRANTED) {
            Logger.debug(getLogTag(), "User denied camera permission: " + getPermissionState(CAMERA).toString());
            call.reject(PERMISSION_DENIED_ERROR_CAMERA);
        } else {
            doShow(call);
        }
    }

    @Override // com.getcapacitor.Plugin
    protected void requestPermissionForAliases(String[] aliases, PluginCall call, String callbackName) {
        if (Build.VERSION.SDK_INT >= 33) {
            for (int i = 0; i < aliases.length; i++) {
                if (aliases[i].equals(SAVE_GALLERY)) {
                    aliases[i] = PHOTOS;
                }
            }
        } else if (Build.VERSION.SDK_INT >= 30) {
            for (int i2 = 0; i2 < aliases.length; i2++) {
                if (aliases[i2].equals(SAVE_GALLERY)) {
                    aliases[i2] = READ_EXTERNAL_STORAGE;
                }
            }
        }
        super.requestPermissionForAliases(aliases, call, callbackName);
    }

    private CameraSettings getSettings(PluginCall call) {
        CameraSettings settings = new CameraSettings();
        settings.setResultType(getResultType(call.getString("resultType")));
        settings.setSaveToGallery(call.getBoolean("saveToGallery", false).booleanValue());
        settings.setAllowEditing(call.getBoolean("allowEditing", false).booleanValue());
        settings.setQuality(call.getInt("quality", 90).intValue());
        settings.setWidth(call.getInt("width", 0).intValue());
        settings.setHeight(call.getInt("height", 0).intValue());
        settings.setShouldResize(settings.getWidth() > 0 || settings.getHeight() > 0);
        settings.setShouldCorrectOrientation(call.getBoolean("correctOrientation", true).booleanValue());
        try {
            settings.setSource(CameraSource.valueOf(call.getString("source", CameraSource.PROMPT.getSource())));
        } catch (IllegalArgumentException e) {
            settings.setSource(CameraSource.PROMPT);
        }
        return settings;
    }

    private CameraResultType getResultType(String resultType) {
        if (resultType == null) {
            return null;
        }
        try {
            return CameraResultType.valueOf(resultType.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            Logger.debug(getLogTag(), "Invalid result type \"" + resultType + "\", defaulting to base64");
            return CameraResultType.BASE64;
        }
    }

    public void openCamera(PluginCall call) {
        if (checkCameraPermissions(call)) {
            Intent takePictureIntent = new Intent("android.media.action.IMAGE_CAPTURE");
            if (takePictureIntent.resolveActivity(getContext().getPackageManager()) != null) {
                try {
                    String appId = getAppId();
                    File photoFile = CameraUtils.createImageFile(getActivity());
                    this.imageFileSavePath = photoFile.getAbsolutePath();
                    Uri uriForFile = FileProvider.getUriForFile(getActivity(), appId + ".fileprovider", photoFile);
                    this.imageFileUri = uriForFile;
                    takePictureIntent.putExtra("output", uriForFile);
                    startActivityForResult(call, takePictureIntent, "processCameraImage");
                    return;
                } catch (Exception ex) {
                    call.reject(IMAGE_FILE_SAVE_ERROR, ex);
                    return;
                }
            }
            call.reject(NO_CAMERA_ACTIVITY_ERROR);
        }
    }

    public void openPhotos(PluginCall call) {
        openPhotos(call, false);
    }

    private <I, O> ActivityResultLauncher<I> registerActivityResultLauncher(ActivityResultContract<I, O> contract, ActivityResultCallback<O> callback) {
        String key = "cap_activity_rq#" + this.mNextLocalRequestCode.getAndIncrement();
        if (this.bridge.getFragment() != null) {
            Object host = this.bridge.getFragment().getHost();
            if (host instanceof ActivityResultRegistryOwner) {
                return ((ActivityResultRegistryOwner) host).getActivityResultRegistry().register(key, contract, callback);
            }
            return this.bridge.getFragment().requireActivity().getActivityResultRegistry().register(key, contract, callback);
        }
        return this.bridge.getActivity().getActivityResultRegistry().register(key, contract, callback);
    }

    private ActivityResultContract<PickVisualMediaRequest, List<Uri>> getContractForCall(PluginCall call) {
        int limit = call.getInt("limit", 0).intValue();
        if (limit > 1) {
            return new ActivityResultContracts.PickMultipleVisualMedia(limit);
        }
        return new ActivityResultContracts.PickMultipleVisualMedia();
    }

    private void openPhotos(final PluginCall call, boolean multiple) {
        try {
            if (multiple) {
                ActivityResultLauncher<PickVisualMediaRequest> activityResultLauncherRegisterActivityResultLauncher = registerActivityResultLauncher(getContractForCall(call), new ActivityResultCallback() { // from class: com.capacitorjs.plugins.camera.CameraPlugin$$ExternalSyntheticLambda1
                    @Override // androidx.activity.result.ActivityResultCallback
                    public final void onActivityResult(Object obj) {
                        this.f$0.lambda$openPhotos$3(call, (List) obj);
                    }
                });
                this.pickMultipleMedia = activityResultLauncherRegisterActivityResultLauncher;
                activityResultLauncherRegisterActivityResultLauncher.launch(new PickVisualMediaRequest.Builder().setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly.INSTANCE).build());
            } else {
                ActivityResultLauncher<PickVisualMediaRequest> activityResultLauncherRegisterActivityResultLauncher2 = registerActivityResultLauncher(new ActivityResultContracts.PickVisualMedia(), new ActivityResultCallback() { // from class: com.capacitorjs.plugins.camera.CameraPlugin$$ExternalSyntheticLambda2
                    @Override // androidx.activity.result.ActivityResultCallback
                    public final void onActivityResult(Object obj) {
                        this.f$0.lambda$openPhotos$4(call, (Uri) obj);
                    }
                });
                this.pickMedia = activityResultLauncherRegisterActivityResultLauncher2;
                activityResultLauncherRegisterActivityResultLauncher2.launch(new PickVisualMediaRequest.Builder().setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly.INSTANCE).build());
            }
        } catch (ActivityNotFoundException e) {
            call.reject(NO_PHOTO_ACTIVITY_ERROR);
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$openPhotos$3(final PluginCall call, final List uris) {
        if (!uris.isEmpty()) {
            Executor executor = Executors.newSingleThreadExecutor();
            executor.execute(new Runnable() { // from class: com.capacitorjs.plugins.camera.CameraPlugin$$ExternalSyntheticLambda0
                @Override // java.lang.Runnable
                public final void run() {
                    this.f$0.lambda$openPhotos$2(uris, call);
                }
            });
        } else {
            call.reject(USER_CANCELLED);
        }
        this.pickMultipleMedia.unregister();
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$openPhotos$2(List uris, PluginCall call) {
        JSObject ret = new JSObject();
        JSArray photos = new JSArray();
        Iterator it = uris.iterator();
        while (it.hasNext()) {
            Uri imageUri = (Uri) it.next();
            try {
                JSObject processResult = processPickedImages(imageUri);
                if (processResult.getString("error") != null && !processResult.getString("error").isEmpty()) {
                    call.reject(processResult.getString("error"));
                    return;
                }
                photos.put(processResult);
            } catch (SecurityException e) {
                call.reject("SecurityException");
            }
        }
        ret.put(PHOTOS, (Object) photos);
        call.resolve(ret);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$openPhotos$4(PluginCall call, Uri uri) {
        if (uri != null) {
            this.imagePickedContentUri = uri;
            processPickedImage(uri, call);
        } else {
            call.reject(USER_CANCELLED);
        }
        this.pickMedia.unregister();
    }

    @ActivityCallback
    public void processCameraImage(PluginCall call, ActivityResult result) throws IOException {
        this.settings = getSettings(call);
        if (this.imageFileSavePath == null) {
            call.reject(IMAGE_PROCESS_NO_FILE_ERROR);
            return;
        }
        File f = new File(this.imageFileSavePath);
        BitmapFactory.Options bmOptions = new BitmapFactory.Options();
        Uri contentUri = Uri.fromFile(f);
        Bitmap bitmap = BitmapFactory.decodeFile(this.imageFileSavePath, bmOptions);
        if (bitmap == null) {
            call.reject(USER_CANCELLED);
        } else {
            returnResult(call, bitmap, contentUri);
        }
    }

    public void processPickedImage(PluginCall call, ActivityResult result) {
        this.settings = getSettings(call);
        Intent data = result.getData();
        if (data == null) {
            call.reject(USER_CANCELLED);
            return;
        }
        Uri u = data.getData();
        this.imagePickedContentUri = u;
        processPickedImage(u, call);
    }

    private ArrayList<Parcelable> getLegacyParcelableArrayList(Bundle bundle, String key) {
        return bundle.getParcelableArrayList(key);
    }

    private void processPickedImage(Uri imageUri, PluginCall call) {
        InputStream imageStream = null;
        try {
            try {
                try {
                    InputStream imageStream2 = getContext().getContentResolver().openInputStream(imageUri);
                    Bitmap bitmap = BitmapFactory.decodeStream(imageStream2);
                    if (bitmap != null) {
                        returnResult(call, bitmap, imageUri);
                        if (imageStream2 != null) {
                            imageStream2.close();
                            return;
                        }
                        return;
                    }
                    call.reject("Unable to process bitmap");
                    if (imageStream2 != null) {
                        try {
                            imageStream2.close();
                        } catch (IOException e) {
                            Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e);
                        }
                    }
                } catch (FileNotFoundException ex) {
                    call.reject("No such image found", ex);
                    if (0 != 0) {
                        imageStream.close();
                    }
                } catch (OutOfMemoryError e2) {
                    call.reject("Out of memory");
                    if (0 != 0) {
                        imageStream.close();
                    }
                }
            } catch (IOException e3) {
                Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e3);
            }
        } catch (Throwable th) {
            if (0 != 0) {
                try {
                    imageStream.close();
                } catch (IOException e4) {
                    Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e4);
                }
            }
            throw th;
        }
    }

    private JSObject processPickedImages(Uri imageUri) {
        InputStream imageStream = null;
        JSObject ret = new JSObject();
        try {
            try {
                try {
                    try {
                        InputStream imageStream2 = getContext().getContentResolver().openInputStream(imageUri);
                        Bitmap bitmap = BitmapFactory.decodeStream(imageStream2);
                        if (bitmap == null) {
                            ret.put("error", "Unable to process bitmap");
                            if (imageStream2 != null) {
                                try {
                                    imageStream2.close();
                                } catch (IOException e) {
                                    Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e);
                                }
                            }
                            return ret;
                        }
                        ExifWrapper exif = ImageUtils.getExifData(getContext(), bitmap, imageUri);
                        try {
                            Bitmap bitmap2 = prepareBitmap(bitmap, imageUri, exif);
                            ByteArrayOutputStream bitmapOutputStream = new ByteArrayOutputStream();
                            bitmap2.compress(Bitmap.CompressFormat.JPEG, this.settings.getQuality(), bitmapOutputStream);
                            Uri newUri = getTempImage(imageUri, bitmapOutputStream);
                            exif.copyExif(newUri.getPath());
                            if (newUri != null) {
                                ret.put("format", "jpeg");
                                ret.put("exif", (Object) exif.toJson());
                                ret.put("path", newUri.toString());
                                ret.put("webPath", FileUtils.getPortablePath(getContext(), this.bridge.getLocalUrl(), newUri));
                            } else {
                                ret.put("error", UNABLE_TO_PROCESS_IMAGE);
                            }
                            if (imageStream2 != null) {
                                try {
                                    imageStream2.close();
                                } catch (IOException e2) {
                                    Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e2);
                                }
                            }
                            return ret;
                        } catch (IOException e3) {
                            ret.put("error", UNABLE_TO_PROCESS_IMAGE);
                            if (imageStream2 != null) {
                                try {
                                    imageStream2.close();
                                } catch (IOException e4) {
                                    Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e4);
                                }
                            }
                            return ret;
                        }
                    } catch (OutOfMemoryError e5) {
                        ret.put("error", "Out of memory");
                        if (0 != 0) {
                            imageStream.close();
                        }
                        return ret;
                    }
                } catch (FileNotFoundException ex) {
                    ret.put("error", "No such image found");
                    Logger.error(getLogTag(), "No such image found", ex);
                    if (0 != 0) {
                        imageStream.close();
                    }
                    return ret;
                }
            } catch (Throwable th) {
                if (0 != 0) {
                    try {
                        imageStream.close();
                    } catch (IOException e6) {
                        Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e6);
                    }
                }
                throw th;
            }
        } catch (IOException e7) {
            Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e7);
        }
    }

    @ActivityCallback
    private void processEditedImage(PluginCall call, ActivityResult result) throws IOException {
        this.isEdited = true;
        this.settings = getSettings(call);
        if (result.getResultCode() == 0) {
            Uri uri = this.imagePickedContentUri;
            if (uri != null) {
                processPickedImage(uri, call);
                return;
            } else {
                processCameraImage(call, result);
                return;
            }
        }
        processPickedImage(call, result);
    }

    private Uri saveImage(Uri uri, InputStream is) throws IOException {
        File outFile;
        if (uri.getScheme().equals("content")) {
            outFile = getTempFile(uri);
        } else {
            outFile = new File(uri.getPath());
        }
        try {
            writePhoto(outFile, is);
        } catch (FileNotFoundException e) {
            outFile = getTempFile(uri);
            writePhoto(outFile, is);
        }
        return Uri.fromFile(outFile);
    }

    private void writePhoto(File outFile, InputStream is) throws IOException {
        FileOutputStream fos = new FileOutputStream(outFile);
        byte[] buffer = new byte[1024];
        while (true) {
            int len = is.read(buffer);
            if (len != -1) {
                fos.write(buffer, 0, len);
            } else {
                fos.close();
                return;
            }
        }
    }

    private File getTempFile(Uri uri) {
        String filename = Uri.parse(Uri.decode(uri.toString())).getLastPathSegment();
        if (!filename.contains(".jpg") && !filename.contains(".jpeg")) {
            filename = filename + "." + new Date().getTime() + ".jpeg";
        }
        File cacheDir = getContext().getCacheDir();
        return new File(cacheDir, filename);
    }

    /* JADX WARN: Code duplicated, block: B:22:0x0065 A[Catch: FileNotFoundException -> 0x00e0, IOException -> 0x00e3, TryCatch #0 {FileNotFoundException -> 0x00e0, blocks: (B:20:0x005a, B:22:0x0065, B:24:0x0091, B:26:0x0097, B:28:0x00af, B:30:0x00b3, B:31:0x00bc, B:32:0x00bd, B:33:0x00c6, B:34:0x00c7, B:36:0x00dc), top: B:63:0x005a }] */
    /* JADX WARN: Code duplicated, block: B:24:0x0091 A[Catch: FileNotFoundException -> 0x00e0, IOException -> 0x00e3, TryCatch #0 {FileNotFoundException -> 0x00e0, blocks: (B:20:0x005a, B:22:0x0065, B:24:0x0091, B:26:0x0097, B:28:0x00af, B:30:0x00b3, B:31:0x00bc, B:32:0x00bd, B:33:0x00c6, B:34:0x00c7, B:36:0x00dc), top: B:63:0x005a }] */
    /* JADX WARN: Code duplicated, block: B:26:0x0097 A[Catch: FileNotFoundException -> 0x00e0, IOException -> 0x00e3, TryCatch #0 {FileNotFoundException -> 0x00e0, blocks: (B:20:0x005a, B:22:0x0065, B:24:0x0091, B:26:0x0097, B:28:0x00af, B:30:0x00b3, B:31:0x00bc, B:32:0x00bd, B:33:0x00c6, B:34:0x00c7, B:36:0x00dc), top: B:63:0x005a }] */
    /* JADX WARN: Code duplicated, block: B:28:0x00af A[Catch: FileNotFoundException -> 0x00e0, IOException -> 0x00e3, TryCatch #0 {FileNotFoundException -> 0x00e0, blocks: (B:20:0x005a, B:22:0x0065, B:24:0x0091, B:26:0x0097, B:28:0x00af, B:30:0x00b3, B:31:0x00bc, B:32:0x00bd, B:33:0x00c6, B:34:0x00c7, B:36:0x00dc), top: B:63:0x005a }] */
    /* JADX WARN: Code duplicated, block: B:30:0x00b3 A[Catch: FileNotFoundException -> 0x00e0, IOException -> 0x00e3, TryCatch #0 {FileNotFoundException -> 0x00e0, blocks: (B:20:0x005a, B:22:0x0065, B:24:0x0091, B:26:0x0097, B:28:0x00af, B:30:0x00b3, B:31:0x00bc, B:32:0x00bd, B:33:0x00c6, B:34:0x00c7, B:36:0x00dc), top: B:63:0x005a }] */
    /* JADX WARN: Code duplicated, block: B:32:0x00bd A[Catch: FileNotFoundException -> 0x00e0, IOException -> 0x00e3, TryCatch #0 {FileNotFoundException -> 0x00e0, blocks: (B:20:0x005a, B:22:0x0065, B:24:0x0091, B:26:0x0097, B:28:0x00af, B:30:0x00b3, B:31:0x00bc, B:32:0x00bd, B:33:0x00c6, B:34:0x00c7, B:36:0x00dc), top: B:63:0x005a }] */
    /* JADX WARN: Code duplicated, block: B:34:0x00c7 A[Catch: FileNotFoundException -> 0x00e0, IOException -> 0x00e3, TryCatch #0 {FileNotFoundException -> 0x00e0, blocks: (B:20:0x005a, B:22:0x0065, B:24:0x0091, B:26:0x0097, B:28:0x00af, B:30:0x00b3, B:31:0x00bc, B:32:0x00bd, B:33:0x00c6, B:34:0x00c7, B:36:0x00dc), top: B:63:0x005a }] */
    /* JADX WARN: Code duplicated, block: B:36:0x00dc A[Catch: FileNotFoundException -> 0x00e0, IOException -> 0x00e3, TRY_LEAVE, TryCatch #0 {FileNotFoundException -> 0x00e0, blocks: (B:20:0x005a, B:22:0x0065, B:24:0x0091, B:26:0x0097, B:28:0x00af, B:30:0x00b3, B:31:0x00bc, B:32:0x00bd, B:33:0x00c6, B:34:0x00c7, B:36:0x00dc), top: B:63:0x005a }] */
    /* JADX WARN: Code duplicated, block: B:47:0x0104  */
    /* JADX WARN: Code duplicated, block: B:48:0x0108  */
    /* JADX WARN: Code duplicated, block: B:50:0x0112  */
    /* JADX WARN: Code duplicated, block: B:51:0x011f  */
    /* JADX WARN: Code duplicated, block: B:53:0x0129  */
    /* JADX WARN: Code duplicated, block: B:54:0x012d  */
    /* JADX WARN: Code duplicated, block: B:57:0x013c  */
    private void returnResult(PluginCall call, Bitmap bitmap, Uri u) throws IOException {
        String fileToSavePath;
        File fileToSave;
        String inserted;
        ContentResolver resolver;
        Uri uri;
        OutputStream stream;
        Boolean inserted2;
        ExifWrapper exif = ImageUtils.getExifData(getContext(), bitmap, u);
        try {
            Bitmap bitmap2 = prepareBitmap(bitmap, u, exif);
            ByteArrayOutputStream bitmapOutputStream = new ByteArrayOutputStream();
            bitmap2.compress(Bitmap.CompressFormat.JPEG, this.settings.getQuality(), bitmapOutputStream);
            if (this.settings.isAllowEditing() && !this.isEdited) {
                editImage(call, u, bitmapOutputStream);
                return;
            }
            boolean z = false;
            boolean saveToGallery = call.getBoolean("saveToGallery", false).booleanValue();
            if (saveToGallery && ((fileToSavePath = this.imageEditedFileSavePath) != null || this.imageFileSavePath != null)) {
                this.isSaved = true;
                if (fileToSavePath == null) {
                    try {
                        try {
                            fileToSavePath = this.imageFileSavePath;
                            fileToSave = new File(fileToSavePath);
                            if (Build.VERSION.SDK_INT >= 29) {
                                resolver = getContext().getContentResolver();
                                ContentValues values = new ContentValues();
                                values.put("_display_name", fileToSave.getName());
                                values.put("mime_type", "image/jpeg");
                                values.put("relative_path", Environment.DIRECTORY_DCIM);
                                Uri contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                                uri = resolver.insert(contentUri, values);
                                if (uri != null) {
                                    throw new IOException("Failed to create new MediaStore record.");
                                }
                                stream = resolver.openOutputStream(uri);
                                if (stream != null) {
                                    throw new IOException("Failed to open output stream.");
                                }
                                inserted2 = Boolean.valueOf(bitmap2.compress(Bitmap.CompressFormat.JPEG, this.settings.getQuality(), stream));
                                if (!inserted2.booleanValue()) {
                                    this.isSaved = false;
                                }
                            } else {
                                inserted = MediaStore.Images.Media.insertImage(getContext().getContentResolver(), fileToSavePath, fileToSave.getName(), "");
                                if (inserted == null) {
                                    this.isSaved = false;
                                }
                            }
                        } catch (IOException e) {
                            this.isSaved = false;
                            Logger.error(getLogTag(), IMAGE_GALLERY_SAVE_ERROR, e);
                        }
                    } catch (FileNotFoundException e2) {
                        e = e2;
                        this.isSaved = z;
                        Logger.error(getLogTag(), IMAGE_GALLERY_SAVE_ERROR, e);
                        if (this.settings.getResultType() == CameraResultType.BASE64) {
                            returnBase64(call, exif, bitmapOutputStream);
                        } else if (this.settings.getResultType() == CameraResultType.URI) {
                            returnFileURI(call, exif, bitmap2, u, bitmapOutputStream);
                        } else if (this.settings.getResultType() == CameraResultType.DATAURL) {
                            returnDataUrl(call, exif, bitmapOutputStream);
                        } else {
                            call.reject(INVALID_RESULT_TYPE_ERROR);
                        }
                        if (this.settings.getResultType() != CameraResultType.URI) {
                            deleteImageFile();
                        }
                        this.imageFileSavePath = null;
                        this.imageFileUri = null;
                        this.imagePickedContentUri = null;
                        this.imageEditedFileSavePath = null;
                    }
                } else {
                    try {
                        fileToSave = new File(fileToSavePath);
                        if (Build.VERSION.SDK_INT >= 29) {
                            resolver = getContext().getContentResolver();
                            ContentValues values2 = new ContentValues();
                            values2.put("_display_name", fileToSave.getName());
                            values2.put("mime_type", "image/jpeg");
                            values2.put("relative_path", Environment.DIRECTORY_DCIM);
                            Uri contentUri2 = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                            uri = resolver.insert(contentUri2, values2);
                            if (uri != null) {
                                throw new IOException("Failed to create new MediaStore record.");
                            }
                            stream = resolver.openOutputStream(uri);
                            if (stream != null) {
                                throw new IOException("Failed to open output stream.");
                            }
                            inserted2 = Boolean.valueOf(bitmap2.compress(Bitmap.CompressFormat.JPEG, this.settings.getQuality(), stream));
                            if (!inserted2.booleanValue()) {
                                this.isSaved = false;
                            }
                        } else {
                            inserted = MediaStore.Images.Media.insertImage(getContext().getContentResolver(), fileToSavePath, fileToSave.getName(), "");
                            if (inserted == null) {
                                this.isSaved = false;
                            }
                        }
                    } catch (FileNotFoundException e3) {
                        e = e3;
                        z = false;
                        this.isSaved = z;
                        Logger.error(getLogTag(), IMAGE_GALLERY_SAVE_ERROR, e);
                    }
                }
            }
            if (this.settings.getResultType() == CameraResultType.BASE64) {
                returnBase64(call, exif, bitmapOutputStream);
            } else if (this.settings.getResultType() == CameraResultType.URI) {
                returnFileURI(call, exif, bitmap2, u, bitmapOutputStream);
            } else if (this.settings.getResultType() == CameraResultType.DATAURL) {
                returnDataUrl(call, exif, bitmapOutputStream);
            } else {
                call.reject(INVALID_RESULT_TYPE_ERROR);
            }
            if (this.settings.getResultType() != CameraResultType.URI) {
                deleteImageFile();
            }
            this.imageFileSavePath = null;
            this.imageFileUri = null;
            this.imagePickedContentUri = null;
            this.imageEditedFileSavePath = null;
        } catch (IOException e4) {
            call.reject(UNABLE_TO_PROCESS_IMAGE);
        }
    }

    private void deleteImageFile() {
        if (this.imageFileSavePath != null && !this.settings.isSaveToGallery()) {
            File photoFile = new File(this.imageFileSavePath);
            if (photoFile.exists()) {
                photoFile.delete();
            }
        }
    }

    private void returnFileURI(PluginCall call, ExifWrapper exif, Bitmap bitmap, Uri u, ByteArrayOutputStream bitmapOutputStream) throws IOException {
        Uri newUri = getTempImage(u, bitmapOutputStream);
        exif.copyExif(newUri.getPath());
        if (newUri != null) {
            JSObject ret = new JSObject();
            ret.put("format", "jpeg");
            ret.put("exif", (Object) exif.toJson());
            ret.put("path", newUri.toString());
            ret.put("webPath", FileUtils.getPortablePath(getContext(), this.bridge.getLocalUrl(), newUri));
            ret.put("saved", this.isSaved);
            call.resolve(ret);
            return;
        }
        call.reject(UNABLE_TO_PROCESS_IMAGE);
    }

    private Uri getTempImage(Uri u, ByteArrayOutputStream bitmapOutputStream) throws IOException {
        ByteArrayInputStream bis = null;
        Uri newUri = null;
        try {
            try {
                bis = new ByteArrayInputStream(bitmapOutputStream.toByteArray());
                newUri = saveImage(u, bis);
                bis.close();
            } catch (IOException e) {
                if (bis != null) {
                    bis.close();
                }
                return newUri;
            } catch (Throwable th) {
                if (bis != null) {
                    try {
                        bis.close();
                    } catch (IOException e2) {
                        Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e2);
                    }
                }
                throw th;
            }
        } catch (IOException e3) {
            Logger.error(getLogTag(), UNABLE_TO_PROCESS_IMAGE, e3);
        }
        return newUri;
    }

    private Bitmap prepareBitmap(Bitmap bitmap, Uri imageUri, ExifWrapper exif) throws IOException {
        if (this.settings.isShouldCorrectOrientation()) {
            Bitmap newBitmap = ImageUtils.correctOrientation(getContext(), bitmap, imageUri, exif);
            bitmap = replaceBitmap(bitmap, newBitmap);
        }
        if (this.settings.isShouldResize()) {
            Bitmap newBitmap2 = ImageUtils.resize(bitmap, this.settings.getWidth(), this.settings.getHeight());
            return replaceBitmap(bitmap, newBitmap2);
        }
        return bitmap;
    }

    private Bitmap replaceBitmap(Bitmap bitmap, Bitmap newBitmap) {
        if (bitmap != newBitmap) {
            bitmap.recycle();
        }
        return newBitmap;
    }

    private void returnDataUrl(PluginCall call, ExifWrapper exif, ByteArrayOutputStream bitmapOutputStream) {
        byte[] byteArray = bitmapOutputStream.toByteArray();
        String encoded = Base64.encodeToString(byteArray, 2);
        JSObject data = new JSObject();
        data.put("format", "jpeg");
        data.put("dataUrl", "data:image/jpeg;base64," + encoded);
        data.put("exif", (Object) exif.toJson());
        call.resolve(data);
    }

    private void returnBase64(PluginCall call, ExifWrapper exif, ByteArrayOutputStream bitmapOutputStream) {
        byte[] byteArray = bitmapOutputStream.toByteArray();
        String encoded = Base64.encodeToString(byteArray, 2);
        JSObject data = new JSObject();
        data.put("format", "jpeg");
        data.put("base64String", encoded);
        data.put("exif", (Object) exif.toJson());
        call.resolve(data);
    }

    @Override // com.getcapacitor.Plugin
    @PluginMethod
    public void requestPermissions(PluginCall call) throws JSONException {
        if (isPermissionDeclared(CAMERA)) {
            super.requestPermissions(call);
            return;
        }
        JSArray providedPerms = call.getArray("permissions");
        List<String> permsList = null;
        if (providedPerms != null) {
            try {
                permsList = providedPerms.toList();
            } catch (JSONException e) {
            }
        }
        if (permsList != null && permsList.size() == 1 && (permsList.contains(CAMERA) || permsList.contains(PHOTOS))) {
            checkPermissions(call);
        } else {
            requestPermissionForAlias(SAVE_GALLERY, call, "checkPermissions");
        }
    }

    @Override // com.getcapacitor.Plugin
    public Map<String, PermissionState> getPermissionStates() {
        Map<String, PermissionState> permissionStates = super.getPermissionStates();
        if (!isPermissionDeclared(CAMERA)) {
            permissionStates.put(CAMERA, PermissionState.GRANTED);
        }
        if (permissionStates.containsKey(PHOTOS)) {
            permissionStates.put(PHOTOS, PermissionState.GRANTED);
        }
        if (Build.VERSION.SDK_INT >= 30 && permissionStates.containsKey(READ_EXTERNAL_STORAGE)) {
            permissionStates.put(SAVE_GALLERY, permissionStates.get(READ_EXTERNAL_STORAGE));
        }
        return permissionStates;
    }

    private void editImage(PluginCall call, Uri uri, ByteArrayOutputStream bitmapOutputStream) {
        try {
            Uri tempImage = getTempImage(uri, bitmapOutputStream);
            Intent editIntent = createEditIntent(tempImage);
            if (editIntent != null) {
                startActivityForResult(call, editIntent, "processEditedImage");
            } else {
                call.reject(IMAGE_EDIT_ERROR);
            }
        } catch (Exception ex) {
            call.reject(IMAGE_EDIT_ERROR, ex);
        }
    }

    private Intent createEditIntent(Uri origPhotoUri) {
        List<ResolveInfo> resInfoList;
        try {
            File editFile = new File(origPhotoUri.getPath());
            Uri editUri = FileProvider.getUriForFile(getActivity(), getContext().getPackageName() + ".fileprovider", editFile);
            Intent editIntent = new Intent("android.intent.action.EDIT");
            editIntent.setDataAndType(editUri, "image/*");
            this.imageEditedFileSavePath = editFile.getAbsolutePath();
            editIntent.addFlags(3);
            editIntent.putExtra("output", editUri);
            if (Build.VERSION.SDK_INT >= 33) {
                resInfoList = getContext().getPackageManager().queryIntentActivities(editIntent, PackageManager.ResolveInfoFlags.of(65536L));
            } else {
                resInfoList = legacyQueryIntentActivities(editIntent);
            }
            for (ResolveInfo resolveInfo : resInfoList) {
                String packageName = resolveInfo.activityInfo.packageName;
                getContext().grantUriPermission(packageName, editUri, 3);
            }
            return editIntent;
        } catch (Exception e) {
            return null;
        }
    }

    private List<ResolveInfo> legacyQueryIntentActivities(Intent intent) {
        return getContext().getPackageManager().queryIntentActivities(intent, 65536);
    }

    @Override // com.getcapacitor.Plugin
    protected Bundle saveInstanceState() {
        Bundle bundle = super.saveInstanceState();
        if (bundle != null) {
            bundle.putString("cameraImageFileSavePath", this.imageFileSavePath);
        }
        return bundle;
    }

    @Override // com.getcapacitor.Plugin
    protected void restoreState(Bundle state) {
        String storedImageFileSavePath = state.getString("cameraImageFileSavePath");
        if (storedImageFileSavePath != null) {
            this.imageFileSavePath = storedImageFileSavePath;
        }
    }

    @Override // com.getcapacitor.Plugin
    protected void handleOnDestroy() {
        ActivityResultLauncher<PickVisualMediaRequest> activityResultLauncher = this.pickMedia;
        if (activityResultLauncher != null) {
            activityResultLauncher.unregister();
        }
        ActivityResultLauncher<PickVisualMediaRequest> activityResultLauncher2 = this.pickMultipleMedia;
        if (activityResultLauncher2 != null) {
            activityResultLauncher2.unregister();
        }
    }
}
