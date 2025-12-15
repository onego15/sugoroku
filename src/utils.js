// ユーティリティ関数

// サイコロを振る（1-6の値を返す）
function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

// 配列からランダムに要素を選択
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 数値をカンマ区切りでフォーマット
function formatMoney(amount) {
    return amount.toLocaleString('ja-JP') + '万円';
}

// 範囲内の乱数を生成
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 月の名前を取得
function getMonthName(month) {
    return month + '月';
}

// プレイヤーの色を取得
function getPlayerColor(playerId) {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
    return colors[playerId % colors.length];
}

// 距離を計算（最短経路）
function calculateDistance(from, to, boardSize) {
    const forward = (to - from + boardSize) % boardSize;
    const backward = (from - to + boardSize) % boardSize;
    return Math.min(forward, backward);
}
