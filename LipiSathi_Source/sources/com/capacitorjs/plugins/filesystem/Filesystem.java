package com.capacitorjs.plugins.filesystem;

import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.util.Base64;
import androidx.core.app.NotificationCompat;
import com.capacitorjs.plugins.filesystem.exceptions.CopyFailedException;
import com.capacitorjs.plugins.filesystem.exceptions.DirectoryExistsException;
import com.capacitorjs.plugins.filesystem.exceptions.DirectoryNotFoundException;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.plugin.util.CapacitorHttpUrlConnection;
import com.getcapacitor.plugin.util.HttpRequestHandler;
import com.google.android.gms.common.internal.ImagesContract;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.channels.FileChannel;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONException;

/* JADX INFO: loaded from: classes2.dex */
public class Filesystem {
    private Context context;

    public interface FilesystemDownloadCallback {
        void onError(Exception exc);

        void onSuccess(JSObject jSObject);
    }

    Filesystem(Context context) {
        this.context = context;
    }

    public String readFile(String path, String directory, Charset charset) throws IOException {
        InputStream is = getInputStream(path, directory);
        if (charset != null) {
            String dataStr = readFileAsString(is, charset.name());
            return dataStr;
        }
        String dataStr2 = readFileAsBase64EncodedData(is);
        return dataStr2;
    }

    public void saveFile(File file, String data, Charset charset, Boolean append) throws IOException {
        if (charset != null) {
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file, append.booleanValue()), charset));
            writer.write(data);
            writer.close();
        } else {
            if (data.contains(",")) {
                data = data.split(",")[1];
            }
            FileOutputStream fos = new FileOutputStream(file, append.booleanValue());
            fos.write(Base64.decode(data, 2));
            fos.close();
        }
    }

    public boolean deleteFile(String file, String directory) throws FileNotFoundException {
        File fileObject = getFileObject(file, directory);
        if (!fileObject.exists()) {
            throw new FileNotFoundException("File does not exist");
        }
        return fileObject.delete();
    }

    public boolean mkdir(String path, String directory, Boolean recursive) throws DirectoryExistsException {
        File fileObject = getFileObject(path, directory);
        if (fileObject.exists()) {
            throw new DirectoryExistsException("Directory exists");
        }
        if (recursive.booleanValue()) {
            boolean created = fileObject.mkdirs();
            return created;
        }
        boolean created2 = fileObject.mkdir();
        return created2;
    }

    public File[] readdir(String path, String directory) throws DirectoryNotFoundException {
        File fileObject = getFileObject(path, directory);
        if (fileObject != null && fileObject.exists()) {
            File[] files = fileObject.listFiles();
            return files;
        }
        throw new DirectoryNotFoundException("Directory does not exist");
    }

    public File copy(String from, String directory, String to, String toDirectory, boolean doRename) throws CopyFailedException, IOException {
        if (toDirectory == null) {
            toDirectory = directory;
        }
        File fromObject = getFileObject(from, directory);
        File toObject = getFileObject(to, toDirectory);
        if (fromObject == null) {
            throw new CopyFailedException("from file is null");
        }
        if (toObject == null) {
            throw new CopyFailedException("to file is null");
        }
        if (toObject.equals(fromObject)) {
            return toObject;
        }
        if (!fromObject.exists()) {
            throw new CopyFailedException("The source object does not exist");
        }
        if (toObject.getParentFile().isFile()) {
            throw new CopyFailedException("The parent object of the destination is a file");
        }
        if (!toObject.getParentFile().exists()) {
            throw new CopyFailedException("The parent object of the destination does not exist");
        }
        if (toObject.isDirectory()) {
            throw new CopyFailedException("Cannot overwrite a directory");
        }
        toObject.delete();
        if (doRename) {
            boolean modified = fromObject.renameTo(toObject);
            if (!modified) {
                throw new CopyFailedException("Unable to rename, unknown reason");
            }
        } else {
            copyRecursively(fromObject, toObject);
        }
        return toObject;
    }

    public InputStream getInputStream(String path, String directory) throws IOException {
        if (directory == null) {
            Uri u = Uri.parse(path);
            if (u.getScheme().equals("content")) {
                return this.context.getContentResolver().openInputStream(u);
            }
            return new FileInputStream(new File(u.getPath()));
        }
        File androidDirectory = getDirectory(directory);
        if (androidDirectory == null) {
            throw new IOException("Directory not found");
        }
        return new FileInputStream(new File(androidDirectory, path));
    }

    public String readFileAsString(InputStream is, String encoding) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        while (true) {
            int length = is.read(buffer);
            if (length != -1) {
                outputStream.write(buffer, 0, length);
            } else {
                return outputStream.toString(encoding);
            }
        }
    }

    public String readFileAsBase64EncodedData(InputStream is) throws IOException {
        FileInputStream fileInputStreamReader = (FileInputStream) is;
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        while (true) {
            int c = fileInputStreamReader.read(buffer);
            if (c != -1) {
                byteStream.write(buffer, 0, c);
            } else {
                fileInputStreamReader.close();
                return Base64.encodeToString(byteStream.toByteArray(), 2);
            }
        }
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Code duplicated, block: B:23:0x0046  */
    public File getDirectory(String directory) {
        Context c = this.context;
        switch (directory) {
            case "DOCUMENTS":
                return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
            case "DATA":
            case "LIBRARY":
                return c.getFilesDir();
            case "CACHE":
                return c.getCacheDir();
            case "EXTERNAL":
                return c.getExternalFilesDir(null);
            case "EXTERNAL_STORAGE":
                return Environment.getExternalStorageDirectory();
            default:
                return null;
        }
    }

    public File getFileObject(String path, String directory) {
        if (directory == null) {
            Uri u = Uri.parse(path);
            if (u.getScheme() == null || u.getScheme().equals("file")) {
                return new File(u.getPath());
            }
        }
        File androidDirectory = getDirectory(directory);
        if (androidDirectory == null) {
            return null;
        }
        if (!androidDirectory.exists()) {
            androidDirectory.mkdir();
        }
        return new File(androidDirectory, path);
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Code duplicated, block: B:17:0x002a  */
    public Charset getEncoding(String encoding) {
        if (encoding == null) {
            return null;
        }
        switch (encoding) {
            case "utf8":
                return StandardCharsets.UTF_8;
            case "utf16":
                return StandardCharsets.UTF_16;
            case "ascii":
                return StandardCharsets.US_ASCII;
            default:
                return null;
        }
    }

    public void deleteRecursively(File file) throws IOException {
        if (file.isFile()) {
            file.delete();
            return;
        }
        for (File f : file.listFiles()) {
            deleteRecursively(f);
        }
        file.delete();
    }

    public void copyRecursively(File src, File dst) throws IOException {
        if (src.isDirectory()) {
            dst.mkdir();
            for (String file : src.list()) {
                copyRecursively(new File(src, file), new File(dst, file));
            }
            return;
        }
        if (!dst.getParentFile().exists()) {
            dst.getParentFile().mkdirs();
        }
        if (!dst.exists()) {
            dst.createNewFile();
        }
        FileChannel source = new FileInputStream(src).getChannel();
        try {
            FileChannel destination = new FileOutputStream(dst).getChannel();
            try {
                destination.transferFrom(source, 0L, source.size());
                if (destination != null) {
                    destination.close();
                }
                if (source != null) {
                    source.close();
                }
            } catch (Throwable th) {
                if (destination != null) {
                    try {
                        destination.close();
                    } catch (Throwable th2) {
                        th.addSuppressed(th2);
                    }
                }
                throw th;
            }
        } catch (Throwable th3) {
            if (source != null) {
                try {
                    source.close();
                } catch (Throwable th4) {
                    th3.addSuppressed(th4);
                }
            }
            throw th3;
        }
    }

    public void downloadFile(final PluginCall call, final Bridge bridge, final HttpRequestHandler.ProgressEmitter emitter, final FilesystemDownloadCallback callback) {
        final String urlString = call.getString(ImagesContract.URL, "");
        final ExecutorService executor = Executors.newSingleThreadExecutor();
        final Handler handler = new Handler(Looper.getMainLooper());
        executor.execute(new Runnable() { // from class: com.capacitorjs.plugins.filesystem.Filesystem$$ExternalSyntheticLambda2
            @Override // java.lang.Runnable
            public final void run() {
                this.f$0.lambda$downloadFile$2(urlString, call, bridge, emitter, handler, callback, executor);
            }
        });
    }

    /* JADX INFO: Access modifiers changed from: private */
    public /* synthetic */ void lambda$downloadFile$2(String urlString, PluginCall call, Bridge bridge, HttpRequestHandler.ProgressEmitter emitter, Handler handler, final FilesystemDownloadCallback callback, ExecutorService executor) {
        try {
            try {
                final JSObject result = doDownloadInBackground(urlString, call, bridge, emitter);
                handler.post(new Runnable() { // from class: com.capacitorjs.plugins.filesystem.Filesystem$$ExternalSyntheticLambda0
                    @Override // java.lang.Runnable
                    public final void run() {
                        callback.onSuccess(result);
                    }
                });
            } catch (Exception error) {
                handler.post(new Runnable() { // from class: com.capacitorjs.plugins.filesystem.Filesystem$$ExternalSyntheticLambda1
                    @Override // java.lang.Runnable
                    public final void run() {
                        callback.onError(error);
                    }
                });
            }
        } finally {
            executor.shutdown();
        }
    }

    private JSObject doDownloadInBackground(String urlString, PluginCall call, Bridge bridge, HttpRequestHandler.ProgressEmitter emitter) throws JSONException, URISyntaxException, IOException {
        int i;
        JSObject headers = call.getObject("headers", new JSObject());
        JSObject params = call.getObject("params", new JSObject());
        Integer connectTimeout = call.getInt("connectTimeout");
        Integer readTimeout = call.getInt("readTimeout");
        Boolean disableRedirects = call.getBoolean("disableRedirects");
        Boolean shouldEncode = call.getBoolean("shouldEncodeUrlParams", true);
        Boolean progress = call.getBoolean(NotificationCompat.CATEGORY_PROGRESS, false);
        String method = call.getString("method", "GET").toUpperCase(Locale.ROOT);
        String path = call.getString("path");
        String directory = call.getString("directory", Environment.DIRECTORY_DOWNLOADS);
        URL url = new URL(urlString);
        File file = getFileObject(path, directory);
        HttpRequestHandler.HttpURLConnectionBuilder connectionBuilder = new HttpRequestHandler.HttpURLConnectionBuilder().setUrl(url).setMethod(method).setHeaders(headers).setUrlParams(params, shouldEncode.booleanValue()).setConnectTimeout(connectTimeout).setReadTimeout(readTimeout).setDisableRedirects(disableRedirects).openConnection();
        CapacitorHttpUrlConnection connection = connectionBuilder.build();
        connection.setSSLSocketFactory(bridge);
        InputStream connectionInputStream = connection.getInputStream();
        FileOutputStream fileOutputStream = new FileOutputStream(file, false);
        String contentLength = connection.getHeaderField("content-length");
        int bytes = 0;
        int maxBytes = 0;
        if (contentLength != null) {
            try {
                i = Integer.parseInt(contentLength);
            } catch (NumberFormatException e) {
            }
        } else {
            i = 0;
        }
        maxBytes = i;
        byte[] buffer = new byte[1024];
        long lastEmitTime = System.currentTimeMillis();
        while (true) {
            int len = connectionInputStream.read(buffer);
            if (len <= 0) {
                break;
            }
            connection = connection;
            readTimeout = readTimeout;
            fileOutputStream.write(buffer, 0, len);
            bytes += len;
            if (!progress.booleanValue() || emitter == null) {
                buffer = buffer;
            } else {
                long currentTime = System.currentTimeMillis();
                if (currentTime - lastEmitTime > 100) {
                    emitter.emit(Integer.valueOf(bytes), Integer.valueOf(maxBytes));
                    lastEmitTime = currentTime;
                }
                buffer = buffer;
            }
        }
        if (progress.booleanValue() && emitter != null) {
            emitter.emit(Integer.valueOf(bytes), Integer.valueOf(maxBytes));
        }
        connectionInputStream.close();
        fileOutputStream.close();
        JSObject ret = new JSObject();
        ret.put("path", file.getAbsolutePath());
        return ret;
    }
}
