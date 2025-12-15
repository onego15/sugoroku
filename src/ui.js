// UI管理クラス
class UIManager {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');

        // UI要素
        this.elements = {
            currentYear: document.getElementById('current-year'),
            currentMonth: document.getElementById('current-month'),
            currentPlayer: document.getElementById('current-player'),
            playersList: document.getElementById('players-list'),
            destinationName: document.getElementById('destination-name'),
            destinationReward: document.getElementById('destination-reward'),
            propertiesList: document.getElementById('properties-list'),
            cardsList: document.getElementById('cards-list'),
            logMessages: document.getElementById('log-messages'),
            rollDiceBtn: document.getElementById('roll-dice-btn'),
            useCardBtn: document.getElementById('use-card-btn'),
            buyPropertyBtn: document.getElementById('buy-property-btn'),
            sellPropertyBtn: document.getElementById('sell-property-btn'),
            endTurnBtn: document.getElementById('end-turn-btn'),
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalConfirm: document.getElementById('modal-confirm'),
            modalCancel: document.getElementById('modal-cancel')
        };

        this.setupEventListeners();
    }

    // イベントリスナーを設定
    setupEventListeners() {
        // サイコロボタン
        this.elements.rollDiceBtn.addEventListener('click', () => {
            const dice = this.game.rollDice();
            if (dice !== null) {
                this.elements.rollDiceBtn.disabled = true;
                this.update();
            }
        });

        // ターン終了ボタン
        this.elements.endTurnBtn.addEventListener('click', () => {
            this.game.endTurn();
            this.elements.rollDiceBtn.disabled = false;
            this.update();
        });

        // カード使用ボタン
        this.elements.useCardBtn.addEventListener('click', () => {
            this.showCardSelection();
        });

        // 物件売却ボタン
        this.elements.sellPropertyBtn.addEventListener('click', () => {
            this.showPropertySale();
        });

        // モーダルのキャンセルボタン
        this.elements.modalCancel.addEventListener('click', () => {
            this.hideModal();
        });
    }

    // UI全体を更新
    update() {
        this.updateGameInfo();
        this.updatePlayersList();
        this.updateDestination();
        this.updateCurrentPlayerInfo();
        this.updateBoard();
        this.updateButtons();
    }

    // ゲーム情報を更新
    updateGameInfo() {
        this.elements.currentYear.textContent = `${this.game.currentYear}年目`;
        this.elements.currentMonth.textContent = `${this.game.currentMonth}月`;

        const currentPlayer = this.game.getCurrentPlayer();
        this.elements.currentPlayer.textContent = `${currentPlayer.name}のターン`;
    }

    // プレイヤーリストを更新
    updatePlayersList() {
        this.elements.playersList.innerHTML = '';

        this.game.players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-card';
            if (player.id === this.game.currentPlayerIndex) {
                card.classList.add('active');
            }

            card.style.borderLeftColor = getPlayerColor(player.id);

            const totalAssets = player.getTotalAssets();
            const yearlyIncome = player.getYearlyIncome();

            card.innerHTML = `
                <h4>${player.name}</h4>
                <div class="player-stats">
                    <div>所持金: ${formatMoney(player.money)}</div>
                    <div>借金: ${formatMoney(player.debt)}</div>
                    <div>総資産: ${formatMoney(totalAssets)}</div>
                    <div>年間収益: ${formatMoney(yearlyIncome)}</div>
                    <div>物件数: ${player.properties.length}</div>
                    <div>カード数: ${player.cards.length}</div>
                    ${player.hasBomby ? '<div style="color: red;">貧乏神憑き</div>' : ''}
                </div>
            `;

            this.elements.playersList.appendChild(card);
        });
    }

    // 目的地情報を更新
    updateDestination() {
        if (this.game.board.destination) {
            this.elements.destinationName.textContent = this.game.board.destination.name;
            this.elements.destinationReward.textContent = `援助金: ${formatMoney(this.game.board.destinationReward)}`;
        }
    }

    // 現在のプレイヤーの情報を更新
    updateCurrentPlayerInfo() {
        const player = this.game.getCurrentPlayer();

        // 所有物件リスト
        this.elements.propertiesList.innerHTML = '';
        if (player.properties.length === 0) {
            this.elements.propertiesList.innerHTML = '<p>物件なし</p>';
        } else {
            player.properties.forEach(property => {
                const item = document.createElement('div');
                item.className = 'property-item';
                item.innerHTML = `
                    <div class="name">${property.name}</div>
                    <div class="value">価格: ${formatMoney(property.price)} / 収益: ${formatMoney(property.income)}</div>
                `;
                this.elements.propertiesList.appendChild(item);
            });
        }

        // カードリスト
        this.elements.cardsList.innerHTML = '';
        if (player.cards.length === 0) {
            this.elements.cardsList.innerHTML = '<p>カードなし</p>';
        } else {
            player.cards.forEach(card => {
                const item = document.createElement('div');
                item.className = 'card-item';
                item.innerHTML = `
                    <div class="name">${card.name}</div>
                    <div class="description">${card.description}</div>
                `;
                item.addEventListener('click', () => {
                    if (confirm(`${card.name}を使用しますか？`)) {
                        this.game.useCard(card.id);
                    }
                });
                this.elements.cardsList.appendChild(item);
            });
        }
    }

    // ボードを描画
    updateBoard() {
        this.game.board.draw(this.ctx, this.game.players);
    }

    // ボタンの状態を更新
    updateButtons() {
        const player = this.game.getCurrentPlayer();

        // カード使用ボタン
        this.elements.useCardBtn.disabled = player.cards.length === 0;

        // 物件売却ボタン
        this.elements.sellPropertyBtn.disabled = player.properties.length === 0;

        // ゲーム終了時はすべてのボタンを無効化
        if (this.game.isGameOver) {
            this.elements.rollDiceBtn.disabled = true;
            this.elements.useCardBtn.disabled = true;
            this.elements.buyPropertyBtn.disabled = true;
            this.elements.sellPropertyBtn.disabled = true;
            this.elements.endTurnBtn.disabled = true;
        }
    }

    // ログを更新
    updateLog() {
        // 最新の10件のログを表示
        const recentLogs = this.game.logs.slice(-10).reverse();

        this.elements.logMessages.innerHTML = '';
        recentLogs.forEach(log => {
            const logDiv = document.createElement('div');
            logDiv.className = `log-message ${log.type}`;
            logDiv.textContent = log.message;
            this.elements.logMessages.appendChild(logDiv);
        });
    }

    // 物件購入画面を表示
    showPropertyPurchase(station) {
        if (!station || station.properties.length === 0) {
            return;
        }

        const player = this.game.getCurrentPlayer();
        const availableProperties = station.properties.filter(p => p.owner === null);

        if (availableProperties.length === 0) {
            alert('購入可能な物件がありません。');
            return;
        }

        let html = '<h3>物件を購入しますか？</h3>';
        availableProperties.forEach(property => {
            html += `
                <div class="property-item" style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <div class="name">${property.name}</div>
                    <div>価格: ${formatMoney(property.price)}</div>
                    <div>年間収益: ${formatMoney(property.income)}</div>
                    <button onclick="window.game.buyProperty('${property.id}'); window.game.ui.hideModal();"
                            class="btn btn-success" style="margin-top: 5px;"
                            ${player.money < property.price ? 'disabled' : ''}>
                        購入
                    </button>
                </div>
            `;
        });

        this.showModal('物件購入', html, false);
    }

    // カード選択画面を表示
    showCardSelection() {
        const player = this.game.getCurrentPlayer();

        if (player.cards.length === 0) {
            alert('カードを持っていません。');
            return;
        }

        let html = '<h3>使用するカードを選択してください</h3>';
        player.cards.forEach(card => {
            html += `
                <div class="card-item" style="margin: 10px 0;">
                    <div class="name">${card.name}</div>
                    <div class="description">${card.description}</div>
                    <button onclick="window.game.useCard('${card.id}'); window.game.ui.hideModal();"
                            class="btn btn-primary" style="margin-top: 5px;">
                        使用
                    </button>
                </div>
            `;
        });

        this.showModal('カード使用', html, true);
    }

    // 物件売却画面を表示
    showPropertySale() {
        const player = this.game.getCurrentPlayer();

        if (player.properties.length === 0) {
            alert('売却できる物件がありません。');
            return;
        }

        let html = '<h3>売却する物件を選択してください</h3>';
        player.properties.forEach(property => {
            const sellPrice = Math.floor(property.price / 2);
            html += `
                <div class="property-item" style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <div class="name">${property.name}</div>
                    <div>購入価格: ${formatMoney(property.price)}</div>
                    <div>売却価格: ${formatMoney(sellPrice)}</div>
                    <button onclick="window.game.sellProperty('${property.id}'); window.game.ui.hideModal();"
                            class="btn btn-danger" style="margin-top: 5px;">
                        売却
                    </button>
                </div>
            `;
        });

        this.showModal('物件売却', html, true);
    }

    // ゲーム結果を表示
    showGameResult(sortedPlayers) {
        let html = '<h2>ゲーム終了！</h2>';
        html += '<h3>最終結果</h3>';

        sortedPlayers.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            html += `
                <div style="margin: 10px 0; padding: 15px; background: ${index === 0 ? '#fff3cd' : '#f8f9fa'}; border-radius: 5px;">
                    <h4>${medal} ${index + 1}位: ${player.name}</h4>
                    <div>総資産: ${formatMoney(player.getTotalAssets())}</div>
                    <div>所持金: ${formatMoney(player.money)}</div>
                    <div>物件価値: ${formatMoney(player.properties.reduce((sum, p) => sum + p.price, 0))}</div>
                    <div>借金: ${formatMoney(player.debt)}</div>
                </div>
            `;
        });

        html += '<button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">もう一度プレイ</button>';

        this.showModal('ゲーム終了', html, false);
    }

    // モーダルを表示
    showModal(title, body, showCancel = true) {
        this.elements.modalTitle.textContent = title;
        this.elements.modalBody.innerHTML = body;
        this.elements.modalConfirm.style.display = 'none';
        this.elements.modalCancel.style.display = showCancel ? 'block' : 'none';
        this.elements.modal.classList.remove('hidden');
    }

    // モーダルを非表示
    hideModal() {
        this.elements.modal.classList.add('hidden');
    }
}
