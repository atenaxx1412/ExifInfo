class ExifInfoApp {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadButton = document.getElementById('uploadButton');
        this.fileInput = document.getElementById('fileInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.analysisResults = new Map(); // インデックスで分析結果を保存
        
        this.initEventListeners();
        console.log('ExifInfoApp initialized');
    }
    
    initEventListeners() {
        // ボタンクリックイベント
        if (this.uploadButton) {
            this.uploadButton.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Upload button clicked');
                this.fileInput.click();
            });
        }
        
        // アップロードエリアクリックイベント
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', (e) => {
                // ボタンクリック時は重複実行を避ける
                if (e.target === this.uploadButton || this.uploadButton.contains(e.target)) {
                    return;
                }
                console.log('Upload area clicked');
                this.fileInput.click();
            });
        }
        
        // ファイル選択イベント
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                console.log('File input changed:', e.target.files);
                if (e.target.files.length > 0) {
                    this.handleFiles(e.target.files);
                }
            });
        }
        
        // ドラッグ&ドロップイベント
        if (this.uploadArea) {
            this.uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.uploadArea.classList.add('dragover');
            });
            
            this.uploadArea.addEventListener('dragleave', () => {
                this.uploadArea.classList.remove('dragover');
            });
            
            this.uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                this.uploadArea.classList.remove('dragover');
                this.handleFiles(e.dataTransfer.files);
            });
        }
    }
    
    handleFiles(files) {
        console.log('Handling files:', files);
        
        if (!files || files.length === 0) {
            console.log('No files to process');
            return;
        }
        
        if (this.imagePreview) {
            this.imagePreview.innerHTML = '';
        }
        this.analysisResults.clear();
        
        Array.from(files).forEach((file, index) => {
            console.log('Processing file:', file.name, file.type);
            if (this.isImageFile(file)) {
                this.processImage(file, index);
            } else {
                console.log('File not supported:', file.name);
                this.showErrorMessage(file.name, 'サポートされていないファイル形式です');
            }
        });
    }
    
    createGoogleMapButton(lat, lon) {
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
        return `
            <button class="google-map-button" onclick="window.open('${googleMapsUrl}', '_blank')">
                <i class="fas fa-map-marker-alt"></i>
                Google Mapで表示
            </button>
        `;
    }
    
    isImageFile(file) {
        const imageTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp',
            'image/webp', 'image/tiff', 'image/svg+xml', 'image/heic', 'image/heif'
        ];
        
        const fileExtensions = [
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif',
            '.heic', '.heif', '.dng', '.cr2', '.cr3', '.nef', '.arw', '.raf',
            '.rw2', '.orf', '.pef', '.srw', '.3fr', '.fff', '.iiq', '.rwl', '.raw'
        ];
        
        const fileName = file.name.toLowerCase();
        const hasValidType = imageTypes.includes(file.type);
        const hasValidExtension = fileExtensions.some(ext => fileName.endsWith(ext));
        
        return hasValidType || hasValidExtension;
    }
    
    async processImage(file, index) {
        // HEIC/HEIF形式の処理
        if (file.name.toLowerCase().includes('.heic') || file.name.toLowerCase().includes('.heif')) {
            try {
                await this.processHeicImage(file, index);
            } catch (error) {
                console.error('HEIC処理エラー:', error);
                this.showErrorMessage(file.name, 'HEIC/HEIF形式の処理に失敗しました');
            }
            return;
        }
        
        // RAW形式の処理
        if (this.isRawFormat(file)) {
            this.processRawImage(file, index);
            return;
        }
        
        // 通常の画像処理
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageItem = this.createImagePreview(file, e.target.result, index);
            if (this.imagePreview) {
                this.imagePreview.appendChild(imageItem);
            }
            
            // EXIF処理を少し遅延させる
            setTimeout(() => {
                this.extractExifData(file, index);
            }, 100);
        };
        
        reader.readAsDataURL(file);
    }
    
    async processHeicImage(file, index) {
        if (typeof heic2any === 'undefined') {
            this.showErrorMessage(file.name, 'HEIC/HEIF形式のサポートライブラリが読み込まれていません');
            return;
        }
        
        try {
            const convertedBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.8
            });
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageItem = this.createImagePreview(file, e.target.result, index);
                if (this.imagePreview) {
                    this.imagePreview.appendChild(imageItem);
                }
                
                // EXIF処理を少し遅延させる
                setTimeout(() => {
                    this.extractExifData(file, index);
                }, 100);
            };
            reader.readAsDataURL(convertedBlob);
            
        } catch (error) {
            console.error('HEIC変換エラー:', error);
            this.showErrorMessage(file.name, 'HEIC/HEIF形式の変換に失敗しました');
        }
    }
    
    processRawImage(file, index) {
        // RAW形式の場合はプレビュー画像なしでEXIF情報のみ表示
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <div class="raw-placeholder">
                <div class="raw-icon">
                    <i class="fas fa-camera"></i>
                </div>
                <p>RAW形式</p>
            </div>
            <div class="image-title">${file.name}</div>
            <button class="analyze-button" onclick="window.exifApp.showAnalysisModal(${index})">
                <i class="fas fa-info-circle"></i>
                分析結果を表示
            </button>
        `;
        if (this.imagePreview) {
            this.imagePreview.appendChild(imageItem);
        }
        
        // EXIF処理を少し遅延させる
        setTimeout(() => {
            this.extractExifData(file, index);
        }, 100);
    }
    
    isRawFormat(file) {
        const rawExtensions = ['.dng', '.cr2', '.cr3', '.nef', '.arw', '.raf', 
                             '.rw2', '.orf', '.pef', '.srw', '.3fr', '.fff', 
                             '.iiq', '.rwl', '.raw'];
        const fileName = file.name.toLowerCase();
        return rawExtensions.some(ext => fileName.endsWith(ext));
    }
    
    showErrorMessage(fileName, message) {
        const errorItem = document.createElement('div');
        errorItem.className = 'image-item error-item';
        errorItem.innerHTML = `
            <div class="error-content">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="image-title">${fileName}</div>
                <div class="error-message">${message}</div>
            </div>
        `;
        if (this.imagePreview) {
            this.imagePreview.appendChild(errorItem);
        }
    }
    
    createImagePreview(file, src, index) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${src}" alt="${file.name}">
            <div class="image-title">${file.name}</div>
            <button class="analyze-button" onclick="window.exifApp.showAnalysisModal(${index})">
                <i class="fas fa-info-circle"></i>
                分析結果を表示
            </button>
        `;
        return imageItem;
    }
    
    extractExifData(file, index) {
        console.log(`Extracting EXIF data for file: ${file.name}, index: ${index}`);
        
        EXIF.getData(file, () => {
            console.log('EXIF.getData callback executed');
            const exifData = this.getAllExifData(file);
            console.log('EXIF data extracted:', exifData);
            this.displayExifInfo(exifData, file.name, index);
        });
    }
    
    getAllExifData(file) {
        const exifData = {};
        const allTags = EXIF.getAllTags(file);
        
        console.log('All EXIF tags:', allTags);
        
        // 必要な情報のみに絞り込み
        exifData.essential = {};
        
        // メーカー・機種
        if (allTags.Make) {
            exifData.essential['メーカー'] = allTags.Make;
            console.log('Make found:', allTags.Make);
        }
        if (allTags.Model) {
            exifData.essential['機種'] = allTags.Model;
            console.log('Model found:', allTags.Model);
        }
        
        // 撮影日時
        if (allTags.DateTime) {
            exifData.essential['撮影日時'] = allTags.DateTime;
            console.log('DateTime found:', allTags.DateTime);
        }
        
        // GPS情報
        if (allTags.GPSLatitude && allTags.GPSLongitude) {
            const lat = this.convertDMSToDD(allTags.GPSLatitude, allTags.GPSLatitudeRef);
            const lon = this.convertDMSToDD(allTags.GPSLongitude, allTags.GPSLongitudeRef);
            exifData.essential['座標'] = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            exifData.essential['Google Map'] = this.createGoogleMapButton(lat, lon);
            console.log('GPS coordinates found:', lat, lon);
        }
        if (allTags.GPSTimeStamp) {
            exifData.essential['GPS時刻'] = allTags.GPSTimeStamp;
            console.log('GPS timestamp found:', allTags.GPSTimeStamp);
        }
        if (allTags.GPSAltitude) {
            exifData.essential['高度'] = `${allTags.GPSAltitude}m`;
            console.log('GPS altitude found:', allTags.GPSAltitude);
        }
        
        console.log('Essential EXIF data:', exifData.essential);
        return exifData;
    }
    
    displayExifInfo(exifData, fileName, index) {
        // 分析結果を保存
        this.analysisResults.set(index, { exifData, fileName });
        console.log(`Analysis result saved for index ${index}`);
    }
    
    showAnalysisModal(index) {
        const result = this.analysisResults.get(index);
        if (result) {
            const modal = this.createExifModal(result.exifData, result.fileName, index);
            document.body.appendChild(modal);
        } else {
            console.error(`No analysis result found for index ${index}`);
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
            </div>
        `;
        
        return modal;
    }
    
    generateExifContent(essentialData) {
        return Object.keys(essentialData).map(key => `
            <div class="exif-item">
                <span class="exif-label">${key}:</span>
                <span class="exif-value">${essentialData[key]}</span>
            </div>
        `).join('');
    }
    
    getCategoryTitle(category) {
        const titles = {
            'basic': 'ファイル基本情報',
            'camera': 'カメラ情報',
            'settings': '撮影設定',
            'location': '位置情報',
            'image': '画像情報'
        };
        return titles[category] || category;
    }
    
    convertDMSToDD(dms, ref) {
        let dd = dms[0] + dms[1]/60 + dms[2]/3600;
        if (ref === 'S' || ref === 'W') dd = dd * -1;
        return dd;
    }
    
    getFlashStatus(flashValue) {
        const flashModes = {
            0: 'フラッシュなし',
            1: 'フラッシュあり',
            5: 'フラッシュあり（赤目軽減なし）',
            7: 'フラッシュあり（赤目軽減あり）',
            16: 'フラッシュなし（強制的）',
            24: 'フラッシュなし（自動）',
            25: 'フラッシュあり（自動）'
        };
        return flashModes[flashValue] || `不明 (${flashValue})`;
    }
    
    getWhiteBalanceStatus(wbValue) {
        const wbModes = {
            0: '自動',
            1: '手動'
        };
        return wbModes[wbValue] || `不明 (${wbValue})`;
    }
    
    getOrientationStatus(orientationValue) {
        const orientations = {
            1: '通常',
            2: '水平反転',
            3: '180度回転',
            4: '垂直反転',
            5: '90度反時計回り + 水平反転',
            6: '90度時計回り',
            7: '90度時計回り + 水平反転',
            8: '90度反時計回り'
        };
        return orientations[orientationValue] || `不明 (${orientationValue})`;
    }
    
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const app = new ExifInfoApp();
    
    // デバッグ用にグローバルに参照を保存
    window.exifApp = app;
});

// 追加のデバッグ用関数
function testFileInput() {
    console.log('Testing file input...');
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.click();
        console.log('File input click triggered');
    } else {
        console.error('File input not found');
    }
}