package com.capacitorjs.plugins.camera;

/* JADX INFO: loaded from: classes2.dex */
public class CameraSettings {
    public static final boolean DEFAULT_CORRECT_ORIENTATION = true;
    public static final int DEFAULT_QUALITY = 90;
    public static final boolean DEFAULT_SAVE_IMAGE_TO_GALLERY = false;
    private CameraResultType resultType = CameraResultType.BASE64;
    private int quality = 90;
    private boolean shouldResize = false;
    private boolean shouldCorrectOrientation = true;
    private boolean saveToGallery = false;
    private boolean allowEditing = false;
    private int width = 0;
    private int height = 0;
    private CameraSource source = CameraSource.PROMPT;

    public CameraResultType getResultType() {
        return this.resultType;
    }

    public void setResultType(CameraResultType resultType) {
        this.resultType = resultType;
    }

    public int getQuality() {
        return this.quality;
    }

    public void setQuality(int quality) {
        this.quality = quality;
    }

    public boolean isShouldResize() {
        return this.shouldResize;
    }

    public void setShouldResize(boolean shouldResize) {
        this.shouldResize = shouldResize;
    }

    public boolean isShouldCorrectOrientation() {
        return this.shouldCorrectOrientation;
    }

    public void setShouldCorrectOrientation(boolean shouldCorrectOrientation) {
        this.shouldCorrectOrientation = shouldCorrectOrientation;
    }

    public boolean isSaveToGallery() {
        return this.saveToGallery;
    }

    public void setSaveToGallery(boolean saveToGallery) {
        this.saveToGallery = saveToGallery;
    }

    public boolean isAllowEditing() {
        return this.allowEditing;
    }

    public void setAllowEditing(boolean allowEditing) {
        this.allowEditing = allowEditing;
    }

    public int getWidth() {
        return this.width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return this.height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public CameraSource getSource() {
        return this.source;
    }

    public void setSource(CameraSource source) {
        this.source = source;
    }
}
