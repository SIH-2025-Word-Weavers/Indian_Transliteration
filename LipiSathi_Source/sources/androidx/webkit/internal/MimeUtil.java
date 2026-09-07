package androidx.webkit.internal;

import androidx.constraintlayout.widget.ConstraintLayout;
import java.net.URLConnection;

/* JADX INFO: loaded from: classes.dex */
class MimeUtil {
    MimeUtil() {
    }

    public static String getMimeFromFileName(String fileName) {
        if (fileName == null) {
            return null;
        }
        String mimeType = URLConnection.guessContentTypeFromName(fileName);
        if (mimeType != null) {
            return mimeType;
        }
        return guessHardcodedMime(fileName);
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Code duplicated, block: B:158:0x0274  */
    private static String guessHardcodedMime(String fileName) {
        byte b = 46;
        int finalFullStop = fileName.lastIndexOf(46);
        if (finalFullStop == -1) {
            return null;
        }
        String extension = fileName.substring(finalFullStop + 1).toLowerCase();
        switch (extension.hashCode()) {
            case 3315:
                if (!extension.equals("gz")) {
                    b = -1;
                } else {
                    b = 42;
                }
                break;
            case 3401:
                if (!extension.equals("js")) {
                    b = -1;
                } else {
                    b = 33;
                }
                break;
            case 97669:
                if (!extension.equals("bmp")) {
                    b = -1;
                } else {
                    b = 47;
                }
                break;
            case 98819:
                if (!extension.equals("css")) {
                    b = -1;
                } else {
                    b = 27;
                }
                break;
            case 102340:
                if (!extension.equals("gif")) {
                    b = -1;
                } else {
                    b = 14;
                }
                break;
            case 103649:
                if (!extension.equals("htm")) {
                    b = -1;
                } else {
                    b = 29;
                }
                break;
            case 104085:
                if (!extension.equals("ico")) {
                    b = -1;
                } else {
                    b = 40;
                }
                break;
            case 105441:
                if (!extension.equals("jpg")) {
                    b = -1;
                } else {
                    b = 16;
                }
                break;
            case 106458:
                if (!extension.equals("m4a")) {
                    b = -1;
                } else {
                    b = 13;
                }
                break;
            case 106479:
                if (!extension.equals("m4v")) {
                    b = -1;
                } else {
                    b = 37;
                }
                break;
            case 108089:
                if (!extension.equals("mht")) {
                    b = -1;
                } else {
                    b = 25;
                }
                break;
            case 108150:
                if (!extension.equals("mjs")) {
                    b = -1;
                } else {
                    b = 34;
                }
                break;
            case 108272:
                if (!extension.equals("mp3")) {
                    b = -1;
                } else {
                    b = 3;
                }
                break;
            case 108273:
                if (!extension.equals("mp4")) {
                    b = -1;
                } else {
                    b = 36;
                }
                break;
            case 108324:
                if (!extension.equals("mpg")) {
                    b = -1;
                } else {
                    b = 2;
                }
                break;
            case 109961:
                if (!extension.equals("oga")) {
                    b = -1;
                } else {
                    b = 10;
                }
                break;
            case 109967:
                if (!extension.equals("ogg")) {
                    b = -1;
                } else {
                    b = 9;
                }
                break;
            case 109973:
                if (!extension.equals("ogm")) {
                    b = -1;
                } else {
                    b = 39;
                }
                break;
            case 109982:
                if (!extension.equals("ogv")) {
                    b = -1;
                } else {
                    b = 38;
                }
                break;
            case 110834:
                if (!extension.equals("pdf")) {
                    b = -1;
                } else {
                    b = 45;
                }
                break;
            case 111030:
                if (!extension.equals("pjp")) {
                    b = -1;
                } else {
                    b = 19;
                }
                break;
            case 111145:
                if (!extension.equals("png")) {
                    b = -1;
                } else {
                    b = 20;
                }
                break;
            case 114276:
                if (!extension.equals("svg")) {
                    b = -1;
                } else {
                    b = 22;
                }
                break;
            case 114791:
                if (!extension.equals("tgz")) {
                    b = -1;
                } else {
                    b = 43;
                }
                break;
            case 114833:
                if (!extension.equals("tif")) {
                    b = -1;
                } else {
                    b = 49;
                }
                break;
            case 117484:
                if (!extension.equals("wav")) {
                    b = -1;
                } else {
                    b = 12;
                }
                break;
            case 118660:
                if (!extension.equals("xht")) {
                    b = -1;
                } else {
                    b = 6;
                }
                break;
            case 118807:
                if (!extension.equals("xml")) {
                    b = -1;
                } else {
                    b = 35;
                }
                break;
            case 120609:
                if (!extension.equals("zip")) {
                    b = -1;
                }
                break;
            case 3000872:
                if (!extension.equals("apng")) {
                    b = -1;
                } else {
                    b = 21;
                }
                break;
            case 3145576:
                if (!extension.equals("flac")) {
                    b = -1;
                } else {
                    b = 8;
                }
                break;
            case 3213227:
                if (!extension.equals("html")) {
                    b = -1;
                } else {
                    b = 28;
                }
                break;
            case 3259225:
                if (!extension.equals("jfif")) {
                    b = -1;
                } else {
                    b = 17;
                }
                break;
            case 3268712:
                if (!extension.equals("jpeg")) {
                    b = -1;
                } else {
                    b = 15;
                }
                break;
            case 3271912:
                if (!extension.equals("json")) {
                    b = -1;
                } else {
                    b = 44;
                }
                break;
            case 3358085:
                if (!extension.equals("mpeg")) {
                    b = -1;
                } else {
                    b = 1;
                }
                break;
            case 3418175:
                if (!extension.equals("opus")) {
                    b = -1;
                } else {
                    b = 11;
                }
                break;
            case 3529614:
                if (!extension.equals("shtm")) {
                    b = -1;
                } else {
                    b = 31;
                }
                break;
            case 3542678:
                if (!extension.equals("svgz")) {
                    b = -1;
                } else {
                    b = 23;
                }
                break;
            case 3559925:
                if (!extension.equals("tiff")) {
                    b = -1;
                } else {
                    b = 48;
                }
                break;
            case 3642020:
                if (!extension.equals("wasm")) {
                    b = -1;
                } else {
                    b = 4;
                }
                break;
            case 3645337:
                if (!extension.equals("webm")) {
                    b = -1;
                } else {
                    b = 0;
                }
                break;
            case 3645340:
                if (!extension.equals("webp")) {
                    b = -1;
                } else {
                    b = 24;
                }
                break;
            case 3655064:
                if (!extension.equals("woff")) {
                    b = -1;
                } else {
                    b = 41;
                }
                break;
            case 3678569:
                if (!extension.equals("xhtm")) {
                    b = -1;
                } else {
                    b = 7;
                }
                break;
            case 96488848:
                if (!extension.equals("ehtml")) {
                    b = -1;
                } else {
                    b = 32;
                }
                break;
            case 103877016:
                if (!extension.equals("mhtml")) {
                    b = -1;
                } else {
                    b = 26;
                }
                break;
            case 106703064:
                if (!extension.equals("pjpeg")) {
                    b = -1;
                } else {
                    b = 18;
                }
                break;
            case 109418142:
                if (!extension.equals("shtml")) {
                    b = -1;
                } else {
                    b = 30;
                }
                break;
            case 114035747:
                if (!extension.equals("xhtml")) {
                    b = -1;
                } else {
                    b = 5;
                }
                break;
            default:
                b = -1;
                break;
        }
        switch (b) {
            case 0:
                return "video/webm";
            case 1:
            case 2:
                return "video/mpeg";
            case 3:
                return "audio/mpeg";
            case 4:
                return "application/wasm";
            case 5:
            case 6:
            case 7:
                return "application/xhtml+xml";
            case 8:
                return "audio/flac";
            case 9:
            case 10:
            case 11:
                return "audio/ogg";
            case 12:
                return "audio/wav";
            case 13:
                return "audio/x-m4a";
            case 14:
                return "image/gif";
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
                return "image/jpeg";
            case 20:
                return "image/png";
            case 21:
                return "image/apng";
            case 22:
            case 23:
                return "image/svg+xml";
            case 24:
                return "image/webp";
            case 25:
            case 26:
                return "multipart/related";
            case 27:
                return "text/css";
            case 28:
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_HORIZONTAL_BIAS /* 29 */:
            case 30:
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_WIDTH_DEFAULT /* 31 */:
            case 32:
                return "text/html";
            case 33:
            case 34:
                return "application/javascript";
            case 35:
                return "text/xml";
            case 36:
            case 37:
                return "video/mp4";
            case 38:
            case 39:
                return "video/ogg";
            case 40:
                return "image/x-icon";
            case 41:
                return "application/font-woff";
            case 42:
            case 43:
                return "application/gzip";
            case 44:
                return "application/json";
            case 45:
                return "application/pdf";
            case 46:
                return "application/zip";
            case 47:
                return "image/bmp";
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
            case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                return "image/tiff";
            default:
                return null;
        }
    }
}
