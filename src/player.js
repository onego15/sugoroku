// プレイヤークラス
class Player {
    constructor(id, name, initialMoney) {
        this.id = id;
        this.name = name;
        this.money = initialMoney; // 所持金（万円）
        this.position = 0; // 現在位置（マス番号）
        this.properties = []; // 所有物件
        this.cards = []; // 所持カード
        this.debt = 0; // 借金
        this.hasBomby = false; // 貧乏神が憑いているか
        this.hasBarrier = false; // バリアを持っているか
        this.skipNextTurn = false; // 次のターンをスキップするか
    }

    // 総資産を計算
    getTotalAssets() {
        const propertyValue = this.properties.reduce((sum, prop) => sum + prop.price, 0);
        return this.money + propertyValue - this.debt;
    }

    // 年間収益を計算
    getYearlyIncome() {
        return this.properties.reduce((sum, prop) => sum + prop.income, 0);
    }

    // カードを使用
    useCard(cardId, game) {
        const cardIndex = this.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            return false;
        }

        const card = this.cards[cardIndex];
        const success = card.use(game, this);

        if (success) {
            // カードを削除
            this.cards.splice(cardIndex, 1);
        }

        return success;
    }

    // 物件を購入
    buyProperty(property) {
        return property.buy(this);
    }

    // 物件を売却
    sellProperty(property) {
        return property.sell(this);
    }

    // プレイヤーを移動
    move(steps, boardSize) {
        this.position = (this.position + steps) % boardSize;
    }

    // 借金をする
    borrow(amount) {
        this.money += amount;
        this.debt += amount;
    }

    // 借金を返済
    repayDebt(amount) {
        const repayAmount = Math.min(amount, this.debt);
        this.money -= repayAmount;
        this.debt -= repayAmount;
        return repayAmount;
    }

    // プレイヤーが破産しているか
    isBankrupt() {
        return this.money < 0 && this.properties.length === 0;
    }

    // 決算処理
    settlement(game) {
        // 物件からの収益
        const income = this.getYearlyIncome();
        if (income > 0) {
            this.money += income;
            game.addLog(`${this.name}は物件から${formatMoney(income)}の収益を得た！`, 'income');
        }

        // 借金の利息（10%）
        if (this.debt > 0) {
            const interest = Math.floor(this.debt * 0.1);
            this.debt += interest;
            game.addLog(`${this.name}の借金利息が${formatMoney(interest)}増えた！`, 'expense');
        }
    }
}
