// ゲームクラス
class Game {
    constructor(config) {
        this.config = config;
        this.board = new Board();
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentYear = 1;
        this.currentMonth = 4; // 4月開始
        this.totalMonths = 0;
        this.maxMonths = config.years * 12;
        this.bomby = new Bomby();
        this.logs = [];
        this.ui = null;
        this.currentStation = null;
        this.isGameOver = false;
        this.waitingForAction = false; // アクション待ち状態
    }

    // ゲームを初期化
    initialize() {
        // プレイヤーを作成
        for (let i = 0; i < this.config.playerCount; i++) {
            const player = new Player(i, `プレイヤー${i + 1}`, this.config.initialMoney);
            // 初期カードを配布
            for (let j = 0; j < 3; j++) {
                player.cards.push(generateRandomCard());
            }
            this.players.push(player);
        }

        // 最初の目的地を設定
        this.board.setNewDestination();

        // ログに記録
        this.addLog('ゲームを開始します！');
        this.addLog(`目的地: ${this.board.destination.name}`);
    }

    // 現在のプレイヤーを取得
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    // サイコロを振る
    rollDice() {
        if (this.waitingForAction) {
            return null;
        }

        const player = this.getCurrentPlayer();

        // ターンスキップチェック
        if (player.skipNextTurn) {
            player.skipNextTurn = false;
            this.addLog(`${player.name}は冬眠中のため1回休み！`);
            this.endTurn();
            return null;
        }

        const dice = rollDice();
        this.addLog(`${player.name}はサイコロで${dice}を出した！`);

        // プレイヤーを移動
        this.movePlayer(player, dice);

        return dice;
    }

    // プレイヤーを移動
    movePlayer(player, steps) {
        player.move(steps, this.board.squares.length);

        const square = this.board.getSquare(player.position);
        this.addLog(`${player.name}は${square.name}に止まった！`);

        // マスの効果を適用
        square.onLand(this, player);

        // 目的地到着チェック
        this.checkDestinationArrival(player);

        // UIを更新
        if (this.ui) {
            this.ui.update();
        }
    }

    // 目的地到着をチェック
    checkDestinationArrival(player) {
        if (this.board.destination && player.position === this.board.destination.id) {
            // 援助金を得る
            player.money += this.board.destinationReward;
            this.addLog(`${player.name}が目的地に到着！${formatMoney(this.board.destinationReward)}の援助金を得た！`, 'income');

            // 新しい目的地を設定
            this.board.setNewDestination();
            this.addLog(`新しい目的地: ${this.board.destination.name}`);

            // 貧乏神を更新
            this.bomby.updateTarget(this);
        }
    }

    // ターン終了
    endTurn() {
        const player = this.getCurrentPlayer();

        // 貧乏神の悪行
        if (player.hasBomby) {
            this.bomby.doEvil(this);
        }

        // 破産チェック
        if (player.isBankrupt()) {
            this.addLog(`${player.name}は破産した！`, 'expense');
        }

        // 次のプレイヤーへ
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        // 全プレイヤーが1ターン終了したら月を進める
        if (this.currentPlayerIndex === 0) {
            this.advanceMonth();
        }

        // UIを更新
        if (this.ui) {
            this.ui.update();
        }

        // ゲーム終了チェック
        if (this.isGameOver) {
            this.endGame();
        }
    }

    // 月を進める
    advanceMonth() {
        this.currentMonth++;
        this.totalMonths++;

        if (this.currentMonth > 12) {
            this.currentMonth = 1;
            this.currentYear++;
            this.addLog(`--- ${this.currentYear}年目に入りました ---`, 'event');
        }

        this.addLog(`--- ${this.currentYear}年${this.currentMonth}月 ---`);

        // 3月は決算
        if (this.currentMonth === 3) {
            this.settlement();
        }

        // ゲーム終了判定
        if (this.totalMonths >= this.maxMonths) {
            this.isGameOver = true;
        }

        // 貧乏神の更新（毎月）
        if (this.currentMonth % 3 === 0) {
            this.bomby.updateTarget(this);
        }
    }

    // 決算処理
    settlement() {
        this.addLog('=== 決算月（3月） ===', 'event');

        this.players.forEach(player => {
            player.settlement(this);
        });

        // 全プレイヤーの資産状況を表示
        this.showAssetReport();
    }

    // 資産報告を表示
    showAssetReport() {
        this.addLog('--- 資産状況 ---', 'event');

        const sortedPlayers = [...this.players].sort((a, b) => b.getTotalAssets() - a.getTotalAssets());

        sortedPlayers.forEach((player, index) => {
            const assets = player.getTotalAssets();
            this.addLog(`${index + 1}位: ${player.name} 総資産${formatMoney(assets)}`, 'event');
        });
    }

    // ゲーム終了
    endGame() {
        this.addLog('=== ゲーム終了 ===', 'event');

        // 最終順位を決定
        const sortedPlayers = [...this.players].sort((a, b) => b.getTotalAssets() - a.getTotalAssets());

        this.addLog('--- 最終結果 ---', 'event');
        sortedPlayers.forEach((player, index) => {
            const assets = player.getTotalAssets();
            this.addLog(`${index + 1}位: ${player.name} 総資産${formatMoney(assets)}`, 'event');
        });

        const winner = sortedPlayers[0];
        this.addLog(`優勝: ${winner.name}！`, 'income');

        // UIに結果を表示
        if (this.ui) {
            this.ui.showGameResult(sortedPlayers);
        }
    }

    // カードを使用
    useCard(cardId) {
        const player = this.getCurrentPlayer();
        const success = player.useCard(cardId, this);

        if (success && this.ui) {
            this.ui.update();
        }

        return success;
    }

    // 物件を購入
    buyProperty(propertyId) {
        const player = this.getCurrentPlayer();
        const property = this.findProperty(propertyId);

        if (!property) {
            return false;
        }

        const success = player.buyProperty(property);

        if (success) {
            this.addLog(`${player.name}は${property.name}を${formatMoney(property.price)}で購入した！`, 'event');

            if (this.ui) {
                this.ui.update();
            }
        } else {
            this.addLog(`${player.name}は${property.name}を購入できなかった！`, 'expense');
        }

        return success;
    }

    // 物件を売却
    sellProperty(propertyId) {
        const player = this.getCurrentPlayer();
        const property = player.properties.find(p => p.id === propertyId);

        if (!property) {
            return false;
        }

        const sellPrice = Math.floor(property.price / 2);
        const success = player.sellProperty(property);

        if (success) {
            this.addLog(`${player.name}は${property.name}を${formatMoney(sellPrice)}で売却した！`, 'event');

            if (this.ui) {
                this.ui.update();
            }
        }

        return success;
    }

    // 物件を検索
    findProperty(propertyId) {
        for (const square of this.board.squares) {
            const property = square.properties.find(p => p.id === propertyId);
            if (property) {
                return property;
            }
        }
        return null;
    }

    // ログを追加
    addLog(message, type = 'normal') {
        this.logs.push({ message, type, timestamp: Date.now() });

        // ログが多すぎる場合は古いものを削除
        if (this.logs.length > 100) {
            this.logs.shift();
        }

        // UIを更新
        if (this.ui) {
            this.ui.updateLog();
        }
    }
}
