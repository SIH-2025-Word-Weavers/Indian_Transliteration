package com.google.android.gms.common.server.response;

import android.util.Log;
import com.google.android.gms.common.server.response.FastJsonResponse;
import com.google.android.gms.common.util.Base64Utils;
import com.google.android.gms.common.util.JsonUtils;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Stack;
import kotlin.text.Typography;

/* JADX INFO: compiled from: com.google.android.gms:play-services-base@@18.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class FastParser<T extends FastJsonResponse> {
    private static final char[] zaa = {'u', 'l', 'l'};
    private static final char[] zab = {'r', 'u', 'e'};
    private static final char[] zac = {'r', 'u', 'e', Typography.quote};
    private static final char[] zad = {'a', 'l', 's', 'e'};
    private static final char[] zae = {'a', 'l', 's', 'e', Typography.quote};
    private static final char[] zaf = {'\n'};
    private static final zai zag = new zaa();
    private static final zai zah = new zab();
    private static final zai zai = new zac();
    private static final zai zaj = new zad();
    private static final zai zak = new zae();
    private static final zai zal = new zaf();
    private static final zai zam = new zag();
    private static final zai zan = new zah();
    private final char[] zao = new char[1];
    private final char[] zap = new char[32];
    private final char[] zaq = new char[1024];
    private final StringBuilder zar = new StringBuilder(32);
    private final StringBuilder zas = new StringBuilder(1024);
    private final Stack zat = new Stack();

    /* JADX INFO: compiled from: com.google.android.gms:play-services-base@@18.1.0 */
    public static class ParseException extends Exception {
        public ParseException(String str) {
            super(str);
        }

        public ParseException(String str, Throwable th) {
            super("Error instantiating inner object", th);
        }

        public ParseException(Throwable th) {
            super(th);
        }
    }

    private static final String zaA(BufferedReader bufferedReader, char[] cArr, StringBuilder sb, char[] cArr2) throws ParseException, IOException {
        sb.setLength(0);
        bufferedReader.mark(cArr.length);
        boolean z = false;
        boolean z2 = false;
        while (true) {
            int i = bufferedReader.read(cArr);
            if (i == -1) {
                throw new ParseException("Unexpected EOF while parsing string");
            }
            for (int i2 = 0; i2 < i; i2++) {
                char c = cArr[i2];
                if (Character.isISOControl(c)) {
                    if (cArr2 != null) {
                        int i3 = 0;
                        while (true) {
                            if (i3 <= 0) {
                                if (cArr2[i3] == c) {
                                    break;
                                }
                                i3++;
                            }
                        }
                    }
                    throw new ParseException("Unexpected control character while reading string");
                }
                if (c != '\"') {
                    if (c == '\\') {
                        z2 = !z2;
                        z = true;
                    }
                } else if (!z2) {
                    sb.append(cArr, 0, i2);
                    bufferedReader.reset();
                    bufferedReader.skip(i2 + 1);
                    return z ? JsonUtils.unescapeString(sb.toString()) : sb.toString();
                }
                z2 = false;
            }
            sb.append(cArr, 0, i);
            bufferedReader.mark(cArr.length);
        }
    }

    private final char zai(BufferedReader bufferedReader) throws ParseException, IOException {
        if (bufferedReader.read(this.zao) == -1) {
            return (char) 0;
        }
        while (Character.isWhitespace(this.zao[0])) {
            if (bufferedReader.read(this.zao) == -1) {
                return (char) 0;
            }
        }
        return this.zao[0];
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final double zaj(BufferedReader bufferedReader) throws ParseException, IOException {
        int iZam = zam(bufferedReader, this.zaq);
        if (iZam == 0) {
            return 0.0d;
        }
        return Double.parseDouble(new String(this.zaq, 0, iZam));
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final float zak(BufferedReader bufferedReader) throws ParseException, IOException {
        int iZam = zam(bufferedReader, this.zaq);
        if (iZam == 0) {
            return 0.0f;
        }
        return Float.parseFloat(new String(this.zaq, 0, iZam));
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final int zal(BufferedReader bufferedReader) throws ParseException, IOException {
        int i;
        int i2;
        int iZam = zam(bufferedReader, this.zaq);
        if (iZam == 0) {
            return 0;
        }
        char[] cArr = this.zaq;
        if (iZam <= 0) {
            throw new ParseException("No number to parse");
        }
        char c = cArr[0];
        int i3 = c == '-' ? Integer.MIN_VALUE : -2147483647;
        int i4 = c == '-' ? 1 : 0;
        if (i4 < iZam) {
            i = i4 + 1;
            int iDigit = Character.digit(cArr[i4], 10);
            if (iDigit < 0) {
                throw new ParseException("Unexpected non-digit character");
            }
            i2 = -iDigit;
        } else {
            i = i4;
            i2 = 0;
        }
        while (i < iZam) {
            int i5 = i + 1;
            int iDigit2 = Character.digit(cArr[i], 10);
            if (iDigit2 < 0) {
                throw new ParseException("Unexpected non-digit character");
            }
            if (i2 < -214748364) {
                throw new ParseException("Number too large");
            }
            int i6 = i2 * 10;
            if (i6 < i3 + iDigit2) {
                throw new ParseException("Number too large");
            }
            i2 = i6 - iDigit2;
            i = i5;
        }
        if (i4 == 0) {
            return -i2;
        }
        if (i > 1) {
            return i2;
        }
        throw new ParseException("No digits to parse");
    }

    private final int zam(BufferedReader bufferedReader, char[] cArr) throws ParseException, IOException {
        int i;
        char cZai = zai(bufferedReader);
        if (cZai == 0) {
            throw new ParseException("Unexpected EOF");
        }
        if (cZai == ',') {
            throw new ParseException("Missing value");
        }
        if (cZai == 'n') {
            zax(bufferedReader, zaa);
            return 0;
        }
        bufferedReader.mark(1024);
        if (cZai == '\"') {
            i = 0;
            boolean z = false;
            while (i < 1024 && bufferedReader.read(cArr, i, 1) != -1) {
                char c = cArr[i];
                if (Character.isISOControl(c)) {
                    throw new ParseException("Unexpected control character while reading string");
                }
                if (c != '\"') {
                    z = c == '\\' ? !z : false;
                } else {
                    if (!z) {
                        bufferedReader.reset();
                        bufferedReader.skip(i + 1);
                        return i;
                    }
                    z = false;
                }
                i++;
            }
        } else {
            cArr[0] = cZai;
            i = 1;
            while (i < 1024 && bufferedReader.read(cArr, i, 1) != -1) {
                char c2 = cArr[i];
                if (c2 == '}' || c2 == ',' || Character.isWhitespace(c2) || cArr[i] == ']') {
                    bufferedReader.reset();
                    bufferedReader.skip(i - 1);
                    cArr[i] = 0;
                    return i;
                }
                i++;
            }
        }
        if (i == 1024) {
            throw new ParseException("Absurdly long value");
        }
        throw new ParseException("Unexpected EOF");
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final long zan(BufferedReader bufferedReader) throws ParseException, IOException {
        long j;
        int i;
        int iZam = zam(bufferedReader, this.zaq);
        if (iZam == 0) {
            return 0L;
        }
        char[] cArr = this.zaq;
        if (iZam <= 0) {
            throw new ParseException("No number to parse");
        }
        char c = cArr[0];
        long j2 = c == '-' ? Long.MIN_VALUE : -9223372036854775807L;
        int i2 = c == '-' ? 1 : 0;
        if (i2 < iZam) {
            i = i2 + 1;
            int iDigit = Character.digit(cArr[i2], 10);
            if (iDigit < 0) {
                throw new ParseException("Unexpected non-digit character");
            }
            j = -iDigit;
        } else {
            j = 0;
            i = i2;
        }
        while (i < iZam) {
            int i3 = i + 1;
            int iDigit2 = Character.digit(cArr[i], 10);
            if (iDigit2 < 0) {
                throw new ParseException("Unexpected non-digit character");
            }
            if (j < -922337203685477580L) {
                throw new ParseException("Number too large");
            }
            long j3 = j * 10;
            long j4 = iDigit2;
            if (j3 < j2 + j4) {
                throw new ParseException("Number too large");
            }
            j = j3 - j4;
            i = i3;
        }
        if (i2 == 0) {
            return -j;
        }
        if (i > 1) {
            return j;
        }
        throw new ParseException("No digits to parse");
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final String zao(BufferedReader bufferedReader) throws ParseException, IOException {
        return zap(bufferedReader, this.zap, this.zar, null);
    }

    private final String zap(BufferedReader bufferedReader, char[] cArr, StringBuilder sb, char[] cArr2) throws ParseException, IOException {
        switch (zai(bufferedReader)) {
            case '\"':
                return zaA(bufferedReader, cArr, sb, cArr2);
            case 'n':
                zax(bufferedReader, zaa);
                return null;
            default:
                throw new ParseException("Expected string");
        }
    }

    private final String zaq(BufferedReader bufferedReader) throws ParseException, IOException {
        this.zat.push(2);
        char cZai = zai(bufferedReader);
        switch (cZai) {
            case '\"':
                this.zat.push(3);
                String strZaA = zaA(bufferedReader, this.zap, this.zar, null);
                zaw(3);
                if (zai(bufferedReader) == ':') {
                    return strZaA;
                }
                throw new ParseException("Expected key/value separator");
            case ']':
                zaw(2);
                zaw(1);
                zaw(5);
                return null;
            case '}':
                zaw(2);
                return null;
            default:
                throw new ParseException("Unexpected token: " + cZai);
        }
    }

    private final String zar(BufferedReader bufferedReader) throws ParseException, IOException {
        bufferedReader.mark(1024);
        int i = 1;
        switch (zai(bufferedReader)) {
            case '\"':
                if (bufferedReader.read(this.zao) == -1) {
                    throw new ParseException("Unexpected EOF while parsing string");
                }
                char c = this.zao[0];
                boolean z = false;
                while (true) {
                    if (c == '\"') {
                        if (z) {
                            c = Typography.quote;
                            z = true;
                        }
                    }
                    z = c == '\\' ? !z : false;
                    if (bufferedReader.read(this.zao) == -1) {
                        throw new ParseException("Unexpected EOF while parsing string");
                    }
                    c = this.zao[0];
                    if (Character.isISOControl(c)) {
                        throw new ParseException("Unexpected control character while reading string");
                    }
                    break;
                }
                break;
            case ',':
                throw new ParseException("Missing value");
            case '[':
                this.zat.push(5);
                bufferedReader.mark(32);
                if (zai(bufferedReader) != ']') {
                    bufferedReader.reset();
                    boolean z2 = false;
                    boolean z3 = false;
                    while (i > 0) {
                        char cZai = zai(bufferedReader);
                        if (cZai == 0) {
                            throw new ParseException("Unexpected EOF while parsing array");
                        }
                        if (Character.isISOControl(cZai)) {
                            throw new ParseException("Unexpected control character while reading array");
                        }
                        if (cZai == '\"') {
                            if (!z3) {
                                z2 = !z2;
                            }
                            cZai = Typography.quote;
                        }
                        if (cZai == '[') {
                            if (!z2) {
                                i++;
                            }
                            cZai = '[';
                        }
                        if (cZai == ']' && !z2) {
                            i--;
                        }
                        z3 = (cZai == '\\' && z2) ? !z3 : false;
                    }
                    zaw(5);
                } else {
                    zaw(5);
                }
                break;
            case '{':
                this.zat.push(1);
                bufferedReader.mark(32);
                char cZai2 = zai(bufferedReader);
                if (cZai2 == '}') {
                    zaw(1);
                } else {
                    if (cZai2 != '\"') {
                        throw new ParseException("Unexpected token " + cZai2);
                    }
                    bufferedReader.reset();
                    zaq(bufferedReader);
                    while (zar(bufferedReader) != null) {
                    }
                    zaw(1);
                }
                break;
            default:
                bufferedReader.reset();
                zam(bufferedReader, this.zaq);
                break;
        }
        char cZai3 = zai(bufferedReader);
        switch (cZai3) {
            case ',':
                zaw(2);
                return zaq(bufferedReader);
            case '}':
                zaw(2);
                return null;
            default:
                throw new ParseException("Unexpected token " + cZai3);
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final BigDecimal zas(BufferedReader bufferedReader) throws ParseException, IOException {
        int iZam = zam(bufferedReader, this.zaq);
        if (iZam == 0) {
            return null;
        }
        return new BigDecimal(new String(this.zaq, 0, iZam));
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final BigInteger zat(BufferedReader bufferedReader) throws ParseException, IOException {
        int iZam = zam(bufferedReader, this.zaq);
        if (iZam == 0) {
            return null;
        }
        return new BigInteger(new String(this.zaq, 0, iZam));
    }

    private final ArrayList zau(BufferedReader bufferedReader, zai zaiVar) throws ParseException, IOException {
        char cZai = zai(bufferedReader);
        if (cZai == 'n') {
            zax(bufferedReader, zaa);
            return null;
        }
        if (cZai != '[') {
            throw new ParseException("Expected start of array");
        }
        this.zat.push(5);
        ArrayList arrayList = new ArrayList();
        while (true) {
            bufferedReader.mark(1024);
            switch (zai(bufferedReader)) {
                case 0:
                    throw new ParseException("Unexpected EOF");
                case ',':
                    break;
                case ']':
                    zaw(5);
                    return arrayList;
                default:
                    bufferedReader.reset();
                    arrayList.add(zaiVar.zaa(this, bufferedReader));
                    break;
            }
        }
    }

    /* JADX WARN: Switch 'out' block B:32:0x0030 for B:11:0x0041 already processed. Defaulting to fallback option. */
    private final ArrayList zav(BufferedReader bufferedReader, FastJsonResponse.Field field) throws ParseException, IOException {
        ArrayList arrayList = new ArrayList();
        char cZai = zai(bufferedReader);
        switch (cZai) {
            case ']':
                zaw(5);
                return arrayList;
            case 'n':
                zax(bufferedReader, zaa);
                zaw(5);
                return null;
            case '{':
                this.zat.push(1);
                while (true) {
                    try {
                        FastJsonResponse fastJsonResponseZad = field.zad();
                        if (!zaz(bufferedReader, fastJsonResponseZad)) {
                            return arrayList;
                        }
                        arrayList.add(fastJsonResponseZad);
                        char cZai2 = zai(bufferedReader);
                        switch (cZai2) {
                            case ',':
                                if (zai(bufferedReader) != '{') {
                                    throw new ParseException("Expected start of next object in array");
                                }
                                this.zat.push(1);
                                break;
                                break;
                            case ']':
                                zaw(5);
                                return arrayList;
                            default:
                                throw new ParseException("Unexpected token: " + cZai2);
                        }
                    } catch (IllegalAccessException e) {
                        throw new ParseException("Error instantiating inner object", e);
                    } catch (InstantiationException e2) {
                        throw new ParseException("Error instantiating inner object", e2);
                    }
                }
                break;
            default:
                throw new ParseException("Unexpected token: " + cZai);
        }
    }

    private final void zaw(int i) throws ParseException {
        if (this.zat.isEmpty()) {
            throw new ParseException("Expected state " + i + " but had empty stack");
        }
        int iIntValue = ((Integer) this.zat.pop()).intValue();
        if (iIntValue == i) {
            return;
        }
        throw new ParseException("Expected state " + i + " but had " + iIntValue);
    }

    private final void zax(BufferedReader bufferedReader, char[] cArr) throws ParseException, IOException {
        int i = 0;
        while (true) {
            int length = cArr.length;
            if (i >= length) {
                return;
            }
            int i2 = bufferedReader.read(this.zap, 0, length - i);
            if (i2 == -1) {
                throw new ParseException("Unexpected EOF");
            }
            for (int i3 = 0; i3 < i2; i3++) {
                if (cArr[i3 + i] != this.zap[i3]) {
                    throw new ParseException("Unexpected character");
                }
            }
            i += i2;
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final boolean zay(BufferedReader bufferedReader, boolean z) throws ParseException, IOException {
        char cZai = zai(bufferedReader);
        switch (cZai) {
            case '\"':
                if (z) {
                    throw new ParseException("No boolean value found in string");
                }
                return zay(bufferedReader, true);
            case 'f':
                zax(bufferedReader, z ? zae : zad);
                return false;
            case 'n':
                zax(bufferedReader, zaa);
                return false;
            case 't':
                zax(bufferedReader, z ? zac : zab);
                return true;
            default:
                throw new ParseException("Unexpected token: " + cZai);
        }
    }

    /* JADX WARN: Multi-variable type inference failed */
    private final boolean zaz(BufferedReader bufferedReader, FastJsonResponse fastJsonResponse) throws ParseException, IOException {
        HashMap map;
        Map<String, FastJsonResponse.Field<?, ?>> fieldMappings = fastJsonResponse.getFieldMappings();
        String strZaq = zaq(bufferedReader);
        if (strZaq == null) {
            zaw(1);
            return false;
        }
        while (strZaq != null) {
            FastJsonResponse.Field<?, ?> field = fieldMappings.get(strZaq);
            if (field == null) {
                strZaq = zar(bufferedReader);
            } else {
                this.zat.push(4);
                int i = field.zaa;
                switch (i) {
                    case 0:
                        if (!field.zab) {
                            fastJsonResponse.zau(field, zal(bufferedReader));
                        } else {
                            fastJsonResponse.zav(field, zau(bufferedReader, zag));
                        }
                        break;
                    case 1:
                        if (!field.zab) {
                            fastJsonResponse.zae(field, zat(bufferedReader));
                        } else {
                            fastJsonResponse.zag(field, zau(bufferedReader, zam));
                        }
                        break;
                    case 2:
                        if (!field.zab) {
                            fastJsonResponse.zax(field, zan(bufferedReader));
                        } else {
                            fastJsonResponse.zay(field, zau(bufferedReader, zah));
                        }
                        break;
                    case 3:
                        if (!field.zab) {
                            fastJsonResponse.zaq(field, zak(bufferedReader));
                        } else {
                            fastJsonResponse.zas(field, zau(bufferedReader, zai));
                        }
                        break;
                    case 4:
                        if (!field.zab) {
                            fastJsonResponse.zam(field, zaj(bufferedReader));
                        } else {
                            fastJsonResponse.zao(field, zau(bufferedReader, zaj));
                        }
                        break;
                    case 5:
                        if (!field.zab) {
                            fastJsonResponse.zaa(field, zas(bufferedReader));
                        } else {
                            fastJsonResponse.zac(field, zau(bufferedReader, zan));
                        }
                        break;
                    case 6:
                        if (!field.zab) {
                            fastJsonResponse.zai(field, zay(bufferedReader, false));
                        } else {
                            fastJsonResponse.zaj(field, zau(bufferedReader, zak));
                        }
                        break;
                    case 7:
                        if (!field.zab) {
                            fastJsonResponse.zaA(field, zao(bufferedReader));
                        } else {
                            fastJsonResponse.zaC(field, zau(bufferedReader, zal));
                        }
                        break;
                    case 8:
                        fastJsonResponse.zal(field, Base64Utils.decode(zap(bufferedReader, this.zaq, this.zas, zaf)));
                        break;
                    case 9:
                        fastJsonResponse.zal(field, Base64Utils.decodeUrlSafe(zap(bufferedReader, this.zaq, this.zas, zaf)));
                        break;
                    case 10:
                        char cZai = zai(bufferedReader);
                        if (cZai != 'n') {
                            if (cZai != '{') {
                                throw new ParseException("Expected start of a map object");
                            }
                            this.zat.push(1);
                            map = new HashMap();
                            while (true) {
                                switch (zai(bufferedReader)) {
                                    case 0:
                                        throw new ParseException("Unexpected EOF");
                                    case '\"':
                                        String strZaA = zaA(bufferedReader, this.zap, this.zar, null);
                                        if (zai(bufferedReader) != ':') {
                                            throw new ParseException("No map value found for key ".concat(String.valueOf(strZaA)));
                                        }
                                        if (zai(bufferedReader) != '\"') {
                                            throw new ParseException("Expected String value for key ".concat(String.valueOf(strZaA)));
                                        }
                                        map.put(strZaA, zaA(bufferedReader, this.zap, this.zar, null));
                                        char cZai2 = zai(bufferedReader);
                                        if (cZai2 != ',') {
                                            if (cZai2 != '}') {
                                                throw new ParseException("Unexpected character while parsing string map: " + cZai2);
                                            }
                                            zaw(1);
                                        }
                                        break;
                                        break;
                                    case '}':
                                        zaw(1);
                                        break;
                                    default:
                                        break;
                                }
                            }
                        } else {
                            zax(bufferedReader, zaa);
                            map = null;
                        }
                        fastJsonResponse.zaB(field, map);
                        break;
                    case 11:
                        if (field.zab) {
                            char cZai3 = zai(bufferedReader);
                            if (cZai3 == 'n') {
                                zax(bufferedReader, zaa);
                                fastJsonResponse.addConcreteTypeArrayInternal(field, field.zae, null);
                            } else {
                                this.zat.push(5);
                                if (cZai3 != '[') {
                                    throw new ParseException("Expected array start");
                                }
                                fastJsonResponse.addConcreteTypeArrayInternal(field, field.zae, zav(bufferedReader, field));
                            }
                        } else {
                            char cZai4 = zai(bufferedReader);
                            if (cZai4 == 'n') {
                                zax(bufferedReader, zaa);
                                fastJsonResponse.addConcreteTypeInternal(field, field.zae, null);
                            } else {
                                this.zat.push(1);
                                if (cZai4 != '{') {
                                    throw new ParseException("Expected start of object");
                                }
                                try {
                                    FastJsonResponse fastJsonResponseZad = field.zad();
                                    zaz(bufferedReader, fastJsonResponseZad);
                                    fastJsonResponse.addConcreteTypeInternal(field, field.zae, fastJsonResponseZad);
                                } catch (IllegalAccessException e) {
                                    throw new ParseException("Error instantiating inner object", e);
                                } catch (InstantiationException e2) {
                                    throw new ParseException("Error instantiating inner object", e2);
                                }
                            }
                        }
                        break;
                    default:
                        throw new ParseException("Invalid field type " + i);
                }
                zaw(4);
                zaw(2);
                char cZai5 = zai(bufferedReader);
                switch (cZai5) {
                    case ',':
                        strZaq = zaq(bufferedReader);
                        break;
                    case '}':
                        strZaq = null;
                        break;
                    default:
                        throw new ParseException("Expected end of object or field separator, but found: " + cZai5);
                }
            }
        }
        zaw(1);
        return true;
    }

    public void parse(InputStream is, T t) throws ParseException {
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(is), 1024);
        try {
            try {
                this.zat.push(0);
                char cZai = zai(bufferedReader);
                switch (cZai) {
                    case 0:
                        throw new ParseException("No data to parse");
                    case '[':
                        this.zat.push(5);
                        Map<String, FastJsonResponse.Field<?, ?>> fieldMappings = t.getFieldMappings();
                        if (fieldMappings.size() != 1) {
                            throw new ParseException("Object array response class must have a single Field");
                        }
                        FastJsonResponse.Field<?, ?> value = fieldMappings.entrySet().iterator().next().getValue();
                        t.addConcreteTypeArrayInternal(value, value.zae, zav(bufferedReader, value));
                        break;
                        break;
                    case '{':
                        this.zat.push(1);
                        zaz(bufferedReader, t);
                        break;
                    default:
                        throw new ParseException("Unexpected token: " + cZai);
                }
                zaw(0);
                try {
                    bufferedReader.close();
                } catch (IOException e) {
                    Log.w("FastParser", "Failed to close reader while parsing.");
                }
            } catch (IOException e2) {
                throw new ParseException(e2);
            }
        } catch (Throwable th) {
            try {
                bufferedReader.close();
            } catch (IOException e3) {
                Log.w("FastParser", "Failed to close reader while parsing.");
            }
            throw th;
        }
    }
}
