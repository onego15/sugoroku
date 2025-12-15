// マスクラス
class Square {
    constructor(id, name, type, x, y) {
        this.id = id;
        this.name = name;
        this.type = type; // 'blue', 'red', 'yellow', 'station-plus', 'station-minus'
        this.x = x; // 描画用のX座標
        this.y = y; // 描画用のY座標
        this.properties = []; // 駅の場合の物件リスト
    }

    // マスに止まった時の処理
    onLand(game, player) {
        switch (this.type) {
            case 'blue':
                this.handleBlueSquare(game, player);
                break;
            case 'red':
                this.handleRedSquare(game, player);
                break;
            case 'yellow':
                this.handleYellowSquare(game, player);
                break;
            case 'station-plus':
                this.handleStationPlus(game, player);
                break;
            case 'station-minus':
                this.handleStationMinus(game, player);
                break;
        }
    }

    // 青マス: 収入
    handleBlueSquare(game, player) {
        const income = randomInt(10, 50);
        player.money += income;
        game.addLog(`${player.name}は${formatMoney(income)}を得た！`, 'income');
    }

    // 赤マス: 支出
    handleRedSquare(game, player) {
        const expense = randomInt(10, 50);
        player.money -= expense;
        game.addLog(`${player.name}は${formatMoney(expense)}を失った！`, 'expense');
    }

    // 黄色マス: カード入手
    handleYellowSquare(game, player) {
        const card = generateRandomCard();
        player.cards.push(card);
        game.addLog(`${player.name}は${card.name}を手に入れた！`, 'event');
    }

    // プラス駅: 物件購入、臨時収入
    handleStationPlus(game, player) {
        // 臨時収入
        const bonus = randomInt(20, 100);
        player.money += bonus;
        game.addLog(`${player.name}は${this.name}で${formatMoney(bonus)}のボーナスを得た！`, 'income');

        // 物件購入可能
        game.currentStation = this;
        game.ui.showPropertyPurchase(this);
    }

    // マイナス駅: 支出、悪行
    handleStationMinus(game, player) {
        // 支出
        const penalty = randomInt(20, 100);
        player.money -= penalty;
        game.addLog(`${player.name}は${this.name}で${formatMoney(penalty)}を失った！`, 'expense');

        // ランダムな悪行
        const badEvents = [
            () => {
                if (player.cards.length > 0) {
                    const card = player.cards.pop();
                    game.addLog(`${player.name}は${card.name}を失った！`, 'expense');
                }
            },
            () => {
                if (player.properties.length > 0) {
                    const prop = randomChoice(player.properties);
                    prop.sell(player);
                    game.addLog(`${player.name}は${prop.name}を売却させられた！`, 'expense');
                }
            },
            () => {
                const loss = randomInt(50, 150);
                player.money -= loss;
                game.addLog(`${player.name}は臨時出費で${formatMoney(loss)}を失った！`, 'expense');
            }
        ];

        const badEvent = randomChoice(badEvents);
        badEvent();
    }
}

// ボードのマスを生成
function generateBoardSquares() {
    const squares = [];
    const boardSize = 40; // 40マスのボード
    const width = 800;
    const height = 600;
    const margin = 50;

    // 矩形のボードを生成
    const squaresPerSide = 10;
    let squareId = 0;

    // マスの種類の配分
    const squareTypes = {
        'blue': 0.4,      // 40% 青マス
        'red': 0.25,      // 25% 赤マス
        'yellow': 0.15,   // 15% 黄色マス
        'station-plus': 0.12,  // 12% プラス駅
        'station-minus': 0.08  // 8% マイナス駅
    };

    // 上辺（左から右）
    for (let i = 0; i < squaresPerSide; i++) {
        const x = margin + (width - margin * 2) * (i / (squaresPerSide - 1));
        const y = margin;
        const type = getRandomSquareType(squareTypes);
        const name = type.includes('station') ? `${getStationName(squareId)}駅` : `マス${squareId}`;
        squares.push(new Square(squareId++, name, type, x, y));
    }

    // 右辺（上から下）
    for (let i = 1; i < squaresPerSide; i++) {
        const x = width - margin;
        const y = margin + (height - margin * 2) * (i / (squaresPerSide - 1));
        const type = getRandomSquareType(squareTypes);
        const name = type.includes('station') ? `${getStationName(squareId)}駅` : `マス${squareId}`;
        squares.push(new Square(squareId++, name, type, x, y));
    }

    // 下辺（右から左）
    for (let i = 1; i < squaresPerSide; i++) {
        const x = width - margin - (width - margin * 2) * (i / (squaresPerSide - 1));
        const y = height - margin;
        const type = getRandomSquareType(squareTypes);
        const name = type.includes('station') ? `${getStationName(squareId)}駅` : `マス${squareId}`;
        squares.push(new Square(squareId++, name, type, x, y));
    }

    // 左辺（下から上）
    for (let i = 1; i < squaresPerSide - 1; i++) {
        const x = margin;
        const y = height - margin - (height - margin * 2) * (i / (squaresPerSide - 1));
        const type = getRandomSquareType(squareTypes);
        const name = type.includes('station') ? `${getStationName(squareId)}駅` : `マス${squareId}`;
        squares.push(new Square(squareId++, name, type, x, y));
    }

    // 駅に物件を追加
    squares.forEach(square => {
        if (square.type.includes('station')) {
            const level = randomInt(1, 5);
            square.properties = generateStationProperties(square.id, square.name.replace('駅', ''), level);
        }
    });

    return squares;
}

// マスのタイプをランダムに決定
function getRandomSquareType(distribution) {
    const rand = Math.random();
    let cumulative = 0;

    for (const [type, probability] of Object.entries(distribution)) {
        cumulative += probability;
        if (rand < cumulative) {
            return type;
        }
    }

    return 'blue'; // デフォルト
}

// 駅名を生成
function getStationName(id) {
    const stationNames = [
        '東京', '大阪', '名古屋', '福岡', '札幌', '仙台', '広島', '神戸',
        '京都', '横浜', '千葉', 'さいたま', '金沢', '富山', '長野', '新潟',
        '静岡', '浜松', '岡山', '熊本', '鹿児島', '那覇', '青森', '秋田',
        '盛岡', '山形', '福島', '水戸', '宇都宮', '前橋', '甲府', '岐阜',
        '津', '大津', '奈良', '和歌山', '鳥取', '松江', '山口', '徳島'
    ];

    return stationNames[id % stationNames.length];
}
