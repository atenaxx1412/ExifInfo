# 写真EXIF情報表示ツール

シンプルで高速な写真メタデータ分析ツール

## 🌟 特徴

- **多様な形式対応**: JPEG、PNG、HEIC、WebP、RAW形式など
- **GPS連携**: 撮影位置をGoogle Mapで表示
- **モバイル対応**: iPhone/Android両対応
- **高速処理**: 圧縮済みJavaScriptで最適化
- **シンプルUI**: モノクロ・ミニマルデザイン

## 📸 対応形式

### 通常画像
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)
- TIFF (.tiff, .tif)

### モバイル形式
- HEIC (.heic) - iPhone
- HEIF (.heif) - iPhone

### RAW形式
- Canon: CR2, CR3
- Nikon: NEF
- Sony: ARW
- Fujifilm: RAF
- Olympus: ORF
- Adobe: DNG
- その他多数

## 🚀 使い方

1. **ファイル選択**
   - 「ファイルを選択」ボタンをクリック
   - または画像をドラッグ&ドロップ

2. **分析結果表示**
   - 画像カードの「分析結果を表示」ボタンをクリック
   - モーダルウィンドウで詳細情報を確認

3. **地図表示**
   - GPS情報がある場合「Google Mapで表示」ボタンが表示
   - クリックで撮影場所を地図で確認

## 📊 表示情報

- **メーカー・機種**: カメラの製造元と型番
- **撮影日時**: 写真が撮影された日時
- **GPS座標**: 緯度・経度（6桁精度）
- **GPS時刻**: GPS記録時刻
- **高度**: 撮影時の高度情報
- **Google Map**: 撮影場所の地図表示

## 💻 技術仕様

### フロントエンド
- HTML5
- CSS3 (Flexbox, Grid)
- JavaScript (ES6+)

### ライブラリ
- **EXIF.js**: メタデータ抽出
- **heic2any**: HEIC形式変換
- **Font Awesome**: アイコン表示

### パフォーマンス
- 圧縮JavaScript (3KB)
- レスポンシブデザイン
- モダンブラウザ対応

## 🛠️ セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>

# ディレクトリに移動
cd IICA_exifInfo

# ブラウザでindex.htmlを開く
open index.html
```

## 📁 ファイル構成

```
IICA_exifInfo/
├── index.html              # メインHTML
├── style.css               # スタイルシート
├── exifInfo.js             # 元JavaScriptファイル
├── exifInfo.optimized.js   # 最適化版
├── exifInfo.min.js         # 圧縮版（本番使用）
└── README.md               # このファイル
```

## 🔧 カスタマイズ

### スタイル変更
`style.css`でカラーテーマやレイアウトを変更可能

### 機能追加
`exifInfo.js`で新しい分析項目を追加可能

## 🌐 ブラウザサポート

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューをお気軽にどうぞ！

## 📞 サポート

質問や要望がありましたら、Issueを作成してください。

---

**注意**: このツールは写真のメタデータのみを読み取ります。画像ファイル自体は外部に送信されません。