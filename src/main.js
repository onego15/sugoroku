// メインスクリプト

// グローバル変数
let game = null;

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', function() {
    // ゲーム設定モーダルを表示
    showSetupModal();

    // プレイヤー数が変更されたらAI設定を更新
    document.getElementById('player-count').addEventListener('change', updateAIControls);

    // 初期のAI設定を表示
    updateAIControls();

    // ゲーム開始ボタン
    document.getElementById('start-game-btn').addEventListener('click', startGame);
});

// ゲーム設定モーダルを表示
function showSetupModal() {
    const setupModal = document.getElementById('setup-modal');
    setupModal.classList.remove('hidden');
}

// AI設定コントロールを更新
function updateAIControls() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    const aiControlsContainer = document.getElementById('ai-player-controls');

    aiControlsContainer.innerHTML = '';

    for (let i = 0; i < playerCount; i++) {
        const controlDiv = document.createElement('div');
        controlDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 8px;';

        controlDiv.innerHTML = `
            <label style="min-width: 100px;">プレイヤー${i + 1}:</label>
            <label style="display: flex; align-items: center; gap: 5px;">
                <input type="checkbox" id="ai-player-${i}" ${i > 0 ? 'checked' : ''}>
                <span>AI</span>
            </label>
            <select id="ai-difficulty-${i}" ${i === 0 ? 'disabled' : ''} style="padding: 5px;">
                <option value="easy">簡単</option>
                <option value="normal" selected>普通</option>
                <option value="hard">難しい</option>
            </select>
        `;

        // チェックボックスの変更時に難易度選択を有効/無効化
        const checkbox = controlDiv.querySelector(`#ai-player-${i}`);
        const difficultySelect = controlDiv.querySelector(`#ai-difficulty-${i}`);

        checkbox.addEventListener('change', function() {
            difficultySelect.disabled = !this.checked;
        });

        aiControlsContainer.appendChild(controlDiv);
    }
}

// ゲームを開始
function startGame() {
    // 設定を取得
    const playerCount = parseInt(document.getElementById('player-count').value);
    const gameYears = parseInt(document.getElementById('game-years').value);
    const initialMoney = parseInt(document.getElementById('initial-money').value);

    // AI設定を取得
    const aiSettings = [];
    for (let i = 0; i < playerCount; i++) {
        const isAI = document.getElementById(`ai-player-${i}`).checked;
        const difficulty = document.getElementById(`ai-difficulty-${i}`).value;
        aiSettings.push({ isAI, difficulty });
    }

    // ゲーム設定
    const config = {
        playerCount: playerCount,
        years: gameYears,
        initialMoney: initialMoney,
        aiSettings: aiSettings
    };

    // ゲームを初期化
    game = new Game(config);
    game.initialize();

    // UIマネージャーを作成
    game.ui = new UIManager(game);
    game.ui.update();

    // グローバルに公開（モーダルのボタンから使用するため）
    window.game = game;

    // セットアップモーダルを非表示
    document.getElementById('setup-modal').classList.add('hidden');

    console.log('ゲーム開始！');

    // AIプレイヤーのターンを開始
    game.checkAndPlayAITurn();
}

// デバッグ用の関数
function debugGame() {
    if (!game) {
        console.log('ゲームが開始されていません');
        return;
    }

    console.log('=== ゲーム状態 ===');
    console.log('年月:', game.currentYear + '年' + game.currentMonth + '月');
    console.log('現在のプレイヤー:', game.getCurrentPlayer().name);
    console.log('プレイヤー一覧:');
    game.players.forEach(player => {
        console.log(`  ${player.name}:`);
        console.log(`    所持金: ${player.money}万円`);
        console.log(`    総資産: ${player.getTotalAssets()}万円`);
        console.log(`    物件数: ${player.properties.length}`);
        console.log(`    カード数: ${player.cards.length}`);
    });
    console.log('目的地:', game.board.destination ? game.board.destination.name : 'なし');
}

// デバッグ用：ゲームを進める
function skipTurns(n = 1) {
    if (!game) {
        console.log('ゲームが開始されていません');
        return;
    }

    for (let i = 0; i < n; i++) {
        game.rollDice();
        game.endTurn();
    }

    console.log(`${n}ターン進めました`);
}

// デバッグ用：お金を追加
function addMoney(amount = 1000) {
    if (!game) {
        console.log('ゲームが開始されていません');
        return;
    }

    const player = game.getCurrentPlayer();
    player.money += amount;
    game.ui.update();
    console.log(`${player.name}に${amount}万円追加しました`);
}

// コンソールにヘルプを表示
console.log(`
===========================================
双六不動産投資ゲーム - デバッグコマンド
===========================================

debugGame()         - ゲームの状態を表示
skipTurns(n)        - n ターン自動で進める
addMoney(amount)    - 現在のプレイヤーにお金を追加

例:
  debugGame()       - 現在の状態を確認
  skipTurns(10)     - 10ターン進める
  addMoney(500)     - 500万円追加

===========================================
`);
