class ExifInfoApp {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadButton = document.getElementById('uploadButton');
        this.fileInput = document.getElementById('fileInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.analysisResults = new Map();
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.uploadButton?.addEventListener('click', e => {
            e.stopPropagation();
            this.fileInput.click();
        });
        
        this.uploadArea?.addEventListener('click', e => {
            if (e.target === this.uploadButton || this.uploadButton.contains(e.target)) return;
            this.fileInput.click();
        });
        
        this.fileInput?.addEventListener('change', e => {
            if (e.target.files.length > 0) this.handleFiles(e.target.files);
        });
        
        if (this.uploadArea) {
            this.uploadArea.addEventListener('dragover', e => {
                e.preventDefault();
                this.uploadArea.classList.add('dragover');
            });
            
            this.uploadArea.addEventListener('dragleave', () => {
                this.uploadArea.classList.remove('dragover');
            });
            
            this.uploadArea.addEventListener('drop', e => {
                e.preventDefault();
                this.uploadArea.classList.remove('dragover');
                this.handleFiles(e.dataTransfer.files);
            });
        }
    }
    
    handleFiles(files) {
        if (!files?.length) return;
        
        if (this.imagePreview) this.imagePreview.innerHTML = '';
        this.analysisResults.clear();
        
        Array.from(files).forEach((file, index) => {
            this.isImageFile(file) ? this.processImage(file, index) : 
                this.showErrorMessage(file.name, 'サポートされていないファイル形式です');
        });
    }
    
    createGoogleMapButton(lat, lon) {
        return `<button class="google-map-button" onclick="window.open('https://www.google.com/maps?q=${lat},${lon}', '_blank')">
            <i class="fas fa-map-marker-alt"></i>Google Mapで表示</button>`;
    }
    
    isImageFile(file) {
        const types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml', 'image/heic', 'image/heif'];
        const exts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.heic', '.heif', '.dng', '.cr2', '.cr3', '.nef', '.arw', '.raf', '.rw2', '.orf', '.pef', '.srw', '.3fr', '.fff', '.iiq', '.rwl', '.raw'];
        const fileName = file.name.toLowerCase();
        return types.includes(file.type) || exts.some(ext => fileName.endsWith(ext));
    }
    
    async processImage(file, index) {
        if (file.name.toLowerCase().includes('.heic') || file.name.toLowerCase().includes('.heif')) {
            try {
                await this.processHeicImage(file, index);
            } catch (error) {
                this.showErrorMessage(file.name, 'HEIC/HEIF形式の処理に失敗しました');
            }
            return;
        }
        
        if (this.isRawFormat(file)) {
            this.processRawImage(file, index);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = e => {
            const imageItem = this.createImagePreview(file, e.target.result, index);
            this.imagePreview?.appendChild(imageItem);
            setTimeout(() => this.extractExifData(file, index), 100);
        };
        reader.readAsDataURL(file);
    }
    
    async processHeicImage(file, index) {
        if (typeof heic2any === 'undefined') {
            this.showErrorMessage(file.name, 'HEIC/HEIF形式のサポートライブラリが読み込まれていません');
            return;
        }
        
        try {
            const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
            const reader = new FileReader();
            reader.onload = e => {
                const imageItem = this.createImagePreview(file, e.target.result, index);
                this.imagePreview?.appendChild(imageItem);
                setTimeout(() => this.extractExifData(file, index), 100);
            };
            reader.readAsDataURL(convertedBlob);
        } catch (error) {
            this.showErrorMessage(file.name, 'HEIC/HEIF形式の変換に失敗しました');
        }
    }
    
    processRawImage(file, index) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <div class="raw-placeholder">
                <div class="raw-icon"><i class="fas fa-camera"></i></div>
                <p>RAW形式</p>
            </div>
            <div class="image-title">${file.name}</div>
            <button class="analyze-button" onclick="window.exifApp.showAnalysisModal(${index})">
                <i class="fas fa-info-circle"></i>分析結果を表示
            </button>`;
        this.imagePreview?.appendChild(imageItem);
        setTimeout(() => this.extractExifData(file, index), 100);
    }
    
    isRawFormat(file) {
        const exts = ['.dng', '.cr2', '.cr3', '.nef', '.arw', '.raf', '.rw2', '.orf', '.pef', '.srw', '.3fr', '.fff', '.iiq', '.rwl', '.raw'];
        return exts.some(ext => file.name.toLowerCase().endsWith(ext));
    }
    
    showErrorMessage(fileName, message) {
        const errorItem = document.createElement('div');
        errorItem.className = 'image-item error-item';
        errorItem.innerHTML = `
            <div class="error-content">
                <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="image-title">${fileName}</div>
                <div class="error-message">${message}</div>
            </div>`;
        this.imagePreview?.appendChild(errorItem);
    }
    
    createImagePreview(file, src, index) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${src}" alt="${file.name}">
            <div class="image-title">${file.name}</div>
            <button class="analyze-button" onclick="window.exifApp.showAnalysisModal(${index})">
                <i class="fas fa-info-circle"></i>分析結果を表示
            </button>`;
        return imageItem;
    }
    
    extractExifData(file, index) {
        EXIF.getData(file, () => {
            const exifData = this.getAllExifData(file);
            this.displayExifInfo(exifData, file.name, index);
        });
    }
    
    getAllExifData(file) {
        const allTags = EXIF.getAllTags(file);
        const essential = {};
        
        if (allTags.Make) essential['メーカー'] = allTags.Make;
        if (allTags.Model) essential['機種'] = allTags.Model;
        if (allTags.DateTime) essential['撮影日時'] = allTags.DateTime;
        
        if (allTags.GPSLatitude && allTags.GPSLongitude) {
            const lat = this.convertDMSToDD(allTags.GPSLatitude, allTags.GPSLatitudeRef);
            const lon = this.convertDMSToDD(allTags.GPSLongitude, allTags.GPSLongitudeRef);
            essential['座標'] = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            essential['Google Map'] = this.createGoogleMapButton(lat, lon);
        }
        if (allTags.GPSTimeStamp) essential['GPS時刻'] = allTags.GPSTimeStamp;
        if (allTags.GPSAltitude) essential['高度'] = `${allTags.GPSAltitude}m`;
        
        return { essential };
    }
    
    displayExifInfo(exifData, fileName, index) {
        this.analysisResults.set(index, { exifData, fileName });
    }
    
    showAnalysisModal(index) {
        const result = this.analysisResults.get(index);
        if (result) {
            const modal = this.createExifModal(result.exifData, result.fileName, index);
            document.body.appendChild(modal);
        }
    }
    
    createExifModal(exifData, fileName, index) {
        const modal = document.createElement('div');
        modal.className = 'exif-modal';
        modal.id = `exif-modal-${index}`;
        
        const hasData = exifData.essential && Object.keys(exifData.essential).length > 0;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-info-circle"></i> ${fileName} の分析結果</h3>
                    <button class="modal-close" onclick="this.closest('.exif-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${hasData ? this.generateExifContent(exifData.essential) : '<div class="no-exif">EXIF情報が見つかりませんでした</div>'}
                </div>
            </div>`;
        
        return modal;
    }
    
    generateExifContent(essentialData) {
        return Object.keys(essentialData).map(key => `
            <div class="exif-item">
                <span class="exif-label">${key}:</span>
                <span class="exif-value">${essentialData[key]}</span>
            </div>`).join('');
    }
    
    convertDMSToDD(dms, ref) {
        let dd = dms[0] + dms[1]/60 + dms[2]/3600;
        if (ref === 'S' || ref === 'W') dd = dd * -1;
        return dd;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.exifApp = new ExifInfoApp();
});