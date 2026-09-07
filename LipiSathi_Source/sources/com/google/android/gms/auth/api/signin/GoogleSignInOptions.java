package com.google.android.gms.auth.api.signin;

import android.accounts.Account;
import android.os.Parcel;
import android.os.Parcelable;
import android.text.TextUtils;
import com.google.android.gms.auth.api.signin.internal.GoogleSignInOptionsExtensionParcelable;
import com.google.android.gms.auth.api.signin.internal.HashAccumulator;
import com.google.android.gms.common.Scopes;
import com.google.android.gms.common.api.Api;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.common.internal.AccountType;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.ReflectedParcelable;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/* JADX INFO: compiled from: com.google.android.gms:play-services-base@@18.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class GoogleSignInOptions extends AbstractSafeParcelable implements Api.ApiOptions.Optional, ReflectedParcelable {
    public static final Parcelable.Creator<GoogleSignInOptions> CREATOR;
    public static final GoogleSignInOptions DEFAULT_GAMES_SIGN_IN;
    public static final GoogleSignInOptions DEFAULT_SIGN_IN;
    public static final Scope zaa = new Scope(Scopes.PROFILE);
    public static final Scope zab = new Scope("email");
    public static final Scope zac = new Scope(Scopes.OPEN_ID);
    public static final Scope zad;
    public static final Scope zae;
    private static Comparator zag;
    final int zaf;
    private final ArrayList zah;
    private Account zai;
    private boolean zaj;
    private final boolean zak;
    private final boolean zal;
    private String zam;
    private String zan;
    private ArrayList zao;
    private String zap;
    private Map zaq;

    /* JADX INFO: compiled from: com.google.android.gms:play-services-base@@18.1.0 */
    public static final class Builder {
        private Set zaa;
        private boolean zab;
        private boolean zac;
        private boolean zad;
        private String zae;
        private Account zaf;
        private String zag;
        private Map zah;
        private String zai;

        public Builder() {
            this.zaa = new HashSet();
            this.zah = new HashMap();
        }

        private final String zaa(String str) {
            Preconditions.checkNotEmpty(str);
            String str2 = this.zae;
            boolean z = true;
            if (str2 != null && !str2.equals(str)) {
                z = false;
            }
            Preconditions.checkArgument(z, "two different server client ids provided");
            return str;
        }

        public Builder addExtension(GoogleSignInOptionsExtension extension) {
            if (this.zah.containsKey(Integer.valueOf(extension.getExtensionType()))) {
                throw new IllegalStateException("Only one extension per type may be added");
            }
            List<Scope> impliedScopes = extension.getImpliedScopes();
            if (impliedScopes != null) {
                this.zaa.addAll(impliedScopes);
            }
            this.zah.put(Integer.valueOf(extension.getExtensionType()), new GoogleSignInOptionsExtensionParcelable(extension));
            return this;
        }

        public GoogleSignInOptions build() {
            if (this.zaa.contains(GoogleSignInOptions.zae) && this.zaa.contains(GoogleSignInOptions.zad)) {
                this.zaa.remove(GoogleSignInOptions.zad);
            }
            if (this.zad && (this.zaf == null || !this.zaa.isEmpty())) {
                requestId();
            }
            return new GoogleSignInOptions(new ArrayList(this.zaa), this.zaf, this.zad, this.zab, this.zac, this.zae, this.zag, this.zah, this.zai);
        }

        public Builder requestEmail() {
            this.zaa.add(GoogleSignInOptions.zab);
            return this;
        }

        public Builder requestId() {
            this.zaa.add(GoogleSignInOptions.zac);
            return this;
        }

        public Builder requestIdToken(String serverClientId) {
            this.zad = true;
            zaa(serverClientId);
            this.zae = serverClientId;
            return this;
        }

        public Builder requestProfile() {
            this.zaa.add(GoogleSignInOptions.zaa);
            return this;
        }

        public Builder requestScopes(Scope scope, Scope... scopes) {
            this.zaa.add(scope);
            this.zaa.addAll(Arrays.asList(scopes));
            return this;
        }

        public Builder requestServerAuthCode(String serverClientId) {
            requestServerAuthCode(serverClientId, false);
            return this;
        }

        public Builder setAccountName(String accountName) {
            this.zaf = new Account(Preconditions.checkNotEmpty(accountName), AccountType.GOOGLE);
            return this;
        }

        public Builder setHostedDomain(String hostedDomain) {
            this.zag = Preconditions.checkNotEmpty(hostedDomain);
            return this;
        }

        public Builder setLogSessionId(String str) {
            this.zai = str;
            return this;
        }

        public Builder requestServerAuthCode(String serverClientId, boolean forceCodeForRefreshToken) {
            this.zab = true;
            zaa(serverClientId);
            this.zae = serverClientId;
            this.zac = forceCodeForRefreshToken;
            return this;
        }

        public Builder(GoogleSignInOptions googleSignInOptions) {
            this.zaa = new HashSet();
            this.zah = new HashMap();
            Preconditions.checkNotNull(googleSignInOptions);
            this.zaa = new HashSet(googleSignInOptions.zah);
            this.zab = googleSignInOptions.zak;
            this.zac = googleSignInOptions.zal;
            this.zad = googleSignInOptions.zaj;
            this.zae = googleSignInOptions.zam;
            this.zaf = googleSignInOptions.zai;
            this.zag = googleSignInOptions.zan;
            this.zah = GoogleSignInOptions.zam(googleSignInOptions.zao);
            this.zai = googleSignInOptions.zap;
        }
    }

    static {
        Scope scope = new Scope(Scopes.GAMES_LITE);
        zad = scope;
        zae = new Scope(Scopes.GAMES);
        Builder builder = new Builder();
        builder.requestId();
        builder.requestProfile();
        DEFAULT_SIGN_IN = builder.build();
        Builder builder2 = new Builder();
        builder2.requestScopes(scope, new Scope[0]);
        DEFAULT_GAMES_SIGN_IN = builder2.build();
        CREATOR = new zae();
        zag = new zac();
    }

    GoogleSignInOptions(int i, ArrayList arrayList, Account account, boolean z, boolean z2, boolean z3, String str, String str2, ArrayList arrayList2, String str3) {
        this(i, arrayList, account, z, z2, z3, str, str2, zam(arrayList2), str3);
    }

    public static GoogleSignInOptions zab(String str) throws JSONException {
        if (TextUtils.isEmpty(str)) {
            return null;
        }
        JSONObject jSONObject = new JSONObject(str);
        HashSet hashSet = new HashSet();
        JSONArray jSONArray = jSONObject.getJSONArray("scopes");
        int length = jSONArray.length();
        for (int i = 0; i < length; i++) {
            hashSet.add(new Scope(jSONArray.getString(i)));
        }
        String strOptString = jSONObject.has("accountName") ? jSONObject.optString("accountName") : null;
        return new GoogleSignInOptions(3, new ArrayList(hashSet), !TextUtils.isEmpty(strOptString) ? new Account(strOptString, AccountType.GOOGLE) : null, jSONObject.getBoolean("idTokenRequested"), jSONObject.getBoolean("serverAuthRequested"), jSONObject.getBoolean("forceCodeForRefreshToken"), jSONObject.has("serverClientId") ? jSONObject.optString("serverClientId") : null, jSONObject.has("hostedDomain") ? jSONObject.optString("hostedDomain") : null, new HashMap(), (String) null);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static Map zam(List list) {
        HashMap map = new HashMap();
        if (list == null) {
            return map;
        }
        Iterator it = list.iterator();
        while (it.hasNext()) {
            GoogleSignInOptionsExtensionParcelable googleSignInOptionsExtensionParcelable = (GoogleSignInOptionsExtensionParcelable) it.next();
            map.put(Integer.valueOf(googleSignInOptionsExtensionParcelable.getType()), googleSignInOptionsExtensionParcelable);
        }
        return map;
    }

    /* JADX WARN: Code duplicated, block: B:25:0x0054 A[Catch: ClassCastException -> 0x0095, TryCatch #0 {ClassCastException -> 0x0095, blocks: (B:5:0x0005, B:7:0x000f, B:10:0x0019, B:12:0x0029, B:15:0x0036, B:17:0x003a, B:23:0x004c, B:25:0x0054, B:31:0x006c, B:33:0x0074, B:35:0x007c, B:37:0x0084, B:28:0x005f, B:20:0x0041), top: B:46:0x0005 }] */
    /* JADX WARN: Code duplicated, block: B:27:0x005e  */
    /* JADX WARN: Code duplicated, block: B:28:0x005f A[Catch: ClassCastException -> 0x0095, TryCatch #0 {ClassCastException -> 0x0095, blocks: (B:5:0x0005, B:7:0x000f, B:10:0x0019, B:12:0x0029, B:15:0x0036, B:17:0x003a, B:23:0x004c, B:25:0x0054, B:31:0x006c, B:33:0x0074, B:35:0x007c, B:37:0x0084, B:28:0x005f, B:20:0x0041), top: B:46:0x0005 }] */
    /* JADX WARN: Code duplicated, block: B:30:0x006b  */
    /* JADX WARN: Code duplicated, block: B:31:0x006c A[Catch: ClassCastException -> 0x0095, TryCatch #0 {ClassCastException -> 0x0095, blocks: (B:5:0x0005, B:7:0x000f, B:10:0x0019, B:12:0x0029, B:15:0x0036, B:17:0x003a, B:23:0x004c, B:25:0x0054, B:31:0x006c, B:33:0x0074, B:35:0x007c, B:37:0x0084, B:28:0x005f, B:20:0x0041), top: B:46:0x0005 }] */
    /* JADX WARN: Code duplicated, block: B:33:0x0074 A[Catch: ClassCastException -> 0x0095, TryCatch #0 {ClassCastException -> 0x0095, blocks: (B:5:0x0005, B:7:0x000f, B:10:0x0019, B:12:0x0029, B:15:0x0036, B:17:0x003a, B:23:0x004c, B:25:0x0054, B:31:0x006c, B:33:0x0074, B:35:0x007c, B:37:0x0084, B:28:0x005f, B:20:0x0041), top: B:46:0x0005 }] */
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        try {
            GoogleSignInOptions googleSignInOptions = (GoogleSignInOptions) obj;
            if (this.zao.size() <= 0 && googleSignInOptions.zao.size() <= 0 && this.zah.size() == googleSignInOptions.getScopes().size() && this.zah.containsAll(googleSignInOptions.getScopes())) {
                Account account = this.zai;
                if (account == null) {
                    if (googleSignInOptions.getAccount() == null) {
                        if (TextUtils.isEmpty(this.zam)) {
                            if (TextUtils.isEmpty(googleSignInOptions.getServerClientId())) {
                                if (this.zal != googleSignInOptions.isForceCodeForRefreshToken() && this.zaj == googleSignInOptions.isIdTokenRequested() && this.zak == googleSignInOptions.isServerAuthCodeRequested() && TextUtils.equals(this.zap, googleSignInOptions.getLogSessionId())) {
                                    return true;
                                }
                            }
                        } else if (!this.zam.equals(googleSignInOptions.getServerClientId())) {
                            if (this.zal != googleSignInOptions.isForceCodeForRefreshToken()) {
                            }
                        }
                    }
                } else if (account.equals(googleSignInOptions.getAccount())) {
                    if (TextUtils.isEmpty(this.zam)) {
                        if (TextUtils.isEmpty(googleSignInOptions.getServerClientId())) {
                            if (this.zal != googleSignInOptions.isForceCodeForRefreshToken()) {
                            }
                        }
                    } else if (!this.zam.equals(googleSignInOptions.getServerClientId())) {
                        if (this.zal != googleSignInOptions.isForceCodeForRefreshToken()) {
                        }
                    }
                }
                return false;
            }
            return false;
        } catch (ClassCastException e) {
            return false;
        }
    }

    public Account getAccount() {
        return this.zai;
    }

    public ArrayList<GoogleSignInOptionsExtensionParcelable> getExtensions() {
        return this.zao;
    }

    public String getLogSessionId() {
        return this.zap;
    }

    public Scope[] getScopeArray() {
        ArrayList arrayList = this.zah;
        return (Scope[]) arrayList.toArray(new Scope[arrayList.size()]);
    }

    public ArrayList<Scope> getScopes() {
        return new ArrayList<>(this.zah);
    }

    public String getServerClientId() {
        return this.zam;
    }

    public int hashCode() {
        ArrayList arrayList = new ArrayList();
        ArrayList arrayList2 = this.zah;
        int size = arrayList2.size();
        for (int i = 0; i < size; i++) {
            arrayList.add(((Scope) arrayList2.get(i)).getScopeUri());
        }
        Collections.sort(arrayList);
        HashAccumulator hashAccumulator = new HashAccumulator();
        hashAccumulator.addObject(arrayList);
        hashAccumulator.addObject(this.zai);
        hashAccumulator.addObject(this.zam);
        hashAccumulator.zaa(this.zal);
        hashAccumulator.zaa(this.zaj);
        hashAccumulator.zaa(this.zak);
        hashAccumulator.addObject(this.zap);
        return hashAccumulator.hash();
    }

    public boolean isForceCodeForRefreshToken() {
        return this.zal;
    }

    public boolean isIdTokenRequested() {
        return this.zaj;
    }

    public boolean isServerAuthCodeRequested() {
        return this.zak;
    }

    @Override // android.os.Parcelable
    public void writeToParcel(Parcel out, int flags) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(out);
        SafeParcelWriter.writeInt(out, 1, this.zaf);
        SafeParcelWriter.writeTypedList(out, 2, getScopes(), false);
        SafeParcelWriter.writeParcelable(out, 3, getAccount(), flags, false);
        SafeParcelWriter.writeBoolean(out, 4, isIdTokenRequested());
        SafeParcelWriter.writeBoolean(out, 5, isServerAuthCodeRequested());
        SafeParcelWriter.writeBoolean(out, 6, isForceCodeForRefreshToken());
        SafeParcelWriter.writeString(out, 7, getServerClientId(), false);
        SafeParcelWriter.writeString(out, 8, this.zan, false);
        SafeParcelWriter.writeTypedList(out, 9, getExtensions(), false);
        SafeParcelWriter.writeString(out, 10, getLogSessionId(), false);
        SafeParcelWriter.finishObjectHeader(out, iBeginObjectHeader);
    }

    public final String zaf() {
        JSONObject jSONObject = new JSONObject();
        try {
            JSONArray jSONArray = new JSONArray();
            Collections.sort(this.zah, zag);
            Iterator it = this.zah.iterator();
            while (it.hasNext()) {
                jSONArray.put(((Scope) it.next()).getScopeUri());
            }
            jSONObject.put("scopes", jSONArray);
            Account account = this.zai;
            if (account != null) {
                jSONObject.put("accountName", account.name);
            }
            jSONObject.put("idTokenRequested", this.zaj);
            jSONObject.put("forceCodeForRefreshToken", this.zal);
            jSONObject.put("serverAuthRequested", this.zak);
            if (!TextUtils.isEmpty(this.zam)) {
                jSONObject.put("serverClientId", this.zam);
            }
            if (!TextUtils.isEmpty(this.zan)) {
                jSONObject.put("hostedDomain", this.zan);
            }
            return jSONObject.toString();
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private GoogleSignInOptions(int i, ArrayList arrayList, Account account, boolean z, boolean z2, boolean z3, String str, String str2, Map map, String str3) {
        this.zaf = i;
        this.zah = arrayList;
        this.zai = account;
        this.zaj = z;
        this.zak = z2;
        this.zal = z3;
        this.zam = str;
        this.zan = str2;
        this.zao = new ArrayList(map.values());
        this.zaq = map;
        this.zap = str3;
    }
}
