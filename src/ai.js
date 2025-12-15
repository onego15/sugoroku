// AI プレイヤークラス
class AIPlayer {
    constructor(player, difficulty = 'normal') {
        this.player = player;
        this.difficulty = difficulty; // 'easy', 'normal', 'hard'
        this.isThinking = false;
    }

    // AIのターンを実行
    async playTurn(game) {
        if (this.isThinking) return;

        this.isThinking = true;

        // 人間のように考えているように見せるための待機時間
        await this.wait(500);

        // ターンスキップチェック
        if (this.player.skipNextTurn) {
            this.player.skipNextTurn = false;
            game.addLog(`${this.player.name}(AI)は冬眠中のため1回休み！`);
            await this.wait(1000);
            game.endTurn();
            this.isThinking = false;
            return;
        }

        // カードを使用するか判断
        if (this.shouldUseCard(game)) {
            await this.useCard(game);
        }

        // サイコロを振る
        await this.wait(800);
        const dice = game.rollDice();

        if (dice === null) {
            this.isThinking = false;
            return;
        }

        // マスの効果を待つ
        await this.wait(1000);

        // 物件購入を判断
        if (game.currentStation) {
            await this.considerPropertyPurchase(game);
        }

        // 資金不足の場合、物件売却を検討
        if (this.player.money < 0) {
            await this.considerPropertySale(game);
        }

        // ターン終了
        await this.wait(500);
        game.endTurn();

        this.isThinking = false;
    }

    // 待機（非同期）
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // カードを使うべきか判断
    shouldUseCard(game) {
        if (this.player.cards.length === 0) return false;

        // 難易度による使用確率
        const useChance = {
            'easy': 0.2,
            'normal': 0.3,
            'hard': 0.5
        };

        return Math.random() < useChance[this.difficulty];
    }

    // カードを使用
    async useCard(game) {
        if (this.player.cards.length === 0) return;

        // ランダムにカードを選択（本当はもっと戦略的にすべき）
        const card = randomChoice(this.player.cards);

        await this.wait(500);
        game.useCard(card.id);
        game.addLog(`${this.player.name}(AI)は${card.name}を使用した！`, 'event');
    }

    // 物件購入を検討
    async considerPropertyPurchase(game) {
        const station = game.currentStation;
        if (!station || station.properties.length === 0) return;

        const availableProperties = station.properties.filter(p => p.owner === null);
        if (availableProperties.length === 0) return;

        // 購入する物件を選択
        for (const property of availableProperties) {
            if (this.shouldBuyProperty(property)) {
                await this.wait(800);
                const success = game.buyProperty(property.id);

                if (success) {
                    game.addLog(`${this.player.name}(AI)は${property.name}を購入した！`, 'event');

                    // 難易度が高いほど複数購入する可能性が高い
                    if (this.difficulty === 'hard' && Math.random() < 0.5) {
                        continue; // 次の物件も検討
                    } else {
                        break; // 1つだけ購入
                    }
                } else {
                    break; // 資金不足なら終了
                }
            }
        }

        game.currentStation = null;
    }

    // 物件を購入すべきか判断
    shouldBuyProperty(property) {
        // 資金不足
        if (this.player.money < property.price) return false;

        // 購入後に最低限の資金が残るか
        const minReserve = {
            'easy': 50,
            'normal': 100,
            'hard': 150
        };

        if (this.player.money - property.price < minReserve[this.difficulty]) {
            return false;
        }

        // 投資効率を計算（年間収益 / 価格）
        const roi = property.income / property.price;

        // 難易度による購入基準
        const roiThreshold = {
            'easy': 0.1,   // 10%以上なら購入
            'normal': 0.15, // 15%以上なら購入
            'hard': 0.2    // 20%以上なら購入
        };

        if (roi >= roiThreshold[this.difficulty]) {
            return Math.random() < 0.8; // 80%の確率で購入
        }

        // それ以外はランダム
        return Math.random() < 0.3;
    }

    // 物件売却を検討
    async considerPropertySale(game) {
        if (this.player.properties.length === 0) return;

        // 資金が正になるまで売却
        while (this.player.money < 0 && this.player.properties.length > 0) {
            // 最も収益の低い物件を売却
            const worstProperty = this.player.properties.reduce((worst, prop) => {
                return prop.income < worst.income ? prop : worst;
            });

            await this.wait(500);
            game.sellProperty(worstProperty.id);
            game.addLog(`${this.player.name}(AI)は資金不足のため${worstProperty.name}を売却した！`, 'expense');
        }
    }

    // 戦略的な判断（上級AI用）
    evaluatePosition(game) {
        // 目的地までの距離
        const distanceToDestination = game.board.getDistanceToDestination(this.player.position);

        // 資産状況
        const totalAssets = this.player.getTotalAssets();

        // 順位
        const rank = game.players
            .sort((a, b) => b.getTotalAssets() - a.getTotalAssets())
            .findIndex(p => p.id === this.player.id) + 1;

        return {
            distanceToDestination,
            totalAssets,
            rank,
            isLeader: rank === 1,
            isDanger: this.player.money < 100 || this.player.hasBomby
        };
    }
}
