// 貧乏神クラス
class Bomby {
    constructor() {
        this.targetPlayer = null; // 取り憑いているプレイヤー
        this.isKingBomby = false; // キングボンビーかどうか
        this.turnsAttached = 0; // 取り憑いているターン数
    }

    // 貧乏神を移動させる
    updateTarget(game) {
        // 目的地から最も遠いプレイヤーを探す
        let farthestPlayer = null;
        let maxDistance = -1;

        game.players.forEach(player => {
            // バリアを持っている場合はスキップ
            if (player.hasBarrier) {
                player.hasBarrier = false; // バリアを消費
                return;
            }

            const distance = game.board.getDistanceToDestination(player.position);
            if (distance > maxDistance) {
                maxDistance = distance;
                farthestPlayer = player;
            }
        });

        // 貧乏神を移動
        if (this.targetPlayer) {
            this.targetPlayer.hasBomby = false;
        }

        if (farthestPlayer) {
            this.targetPlayer = farthestPlayer;
            this.targetPlayer.hasBomby = true;
            this.turnsAttached = 0;
            game.addLog(`貧乏神が${this.targetPlayer.name}に取り憑いた！`, 'event');
        }
    }

    // 貧乏神の悪行
    doEvil(game) {
        if (!this.targetPlayer) {
            return;
        }

        this.turnsAttached++;

        // 10ターン経過でキングボンビーに変身
        if (this.turnsAttached >= 10 && !this.isKingBomby) {
            this.isKingBomby = true;
            game.addLog(`貧乏神がキングボンビーに変身した！`, 'event');
        }

        // 悪行の強度
        const evilPower = this.isKingBomby ? 3 : 1;

        // ランダムな悪行を実行
        for (let i = 0; i < evilPower; i++) {
            this.performRandomEvil(game);
        }
    }

    // ランダムな悪行を実行
    performRandomEvil(game) {
        const player = this.targetPlayer;
        if (!player) return;

        const evilActions = [
            // お金を減らす
            () => {
                const loss = randomInt(20, 100);
                player.money -= loss;
                game.addLog(`貧乏神が${player.name}から${formatMoney(loss)}を奪った！`, 'expense');
            },
            // カードを捨てる
            () => {
                if (player.cards.length > 0) {
                    const card = player.cards.pop();
                    game.addLog(`貧乏神が${player.name}の${card.name}を捨てた！`, 'expense');
                }
            },
            // 物件を勝手に売却
            () => {
                if (player.properties.length > 0) {
                    const property = randomChoice(player.properties);
                    property.sell(player);
                    game.addLog(`貧乏神が${player.name}の${property.name}を売却した！`, 'expense');
                }
            },
            // ランダムな場所に移動
            () => {
                const newPos = randomInt(0, game.board.squares.length - 1);
                player.position = newPos;
                game.addLog(`貧乏神が${player.name}をどこかに連れ去った！`, 'event');
            },
            // 借金を増やす
            () => {
                const debtIncrease = randomInt(50, 150);
                player.debt += debtIncrease;
                game.addLog(`貧乏神が${player.name}に${formatMoney(debtIncrease)}の借金を負わせた！`, 'expense');
            }
        ];

        // キングボンビーの場合はより悪質な行動
        if (this.isKingBomby) {
            evilActions.push(
                () => {
                    // 所持金を半分に
                    const halfMoney = Math.floor(player.money / 2);
                    player.money -= halfMoney;
                    game.addLog(`キングボンビーが${player.name}の所持金を半分にした！`, 'expense');
                },
                () => {
                    // 物件を2つ売却
                    for (let i = 0; i < 2; i++) {
                        if (player.properties.length > 0) {
                            const property = randomChoice(player.properties);
                            property.sell(player);
                            game.addLog(`キングボンビーが${player.name}の${property.name}を売却した！`, 'expense');
                        }
                    }
                }
            );
        }

        const action = randomChoice(evilActions);
        action();
    }

    // 貧乏神を外す
    remove(game) {
        if (this.targetPlayer) {
            this.targetPlayer.hasBomby = false;
            game.addLog(`${this.targetPlayer.name}から貧乏神が離れた！`, 'event');
            this.targetPlayer = null;
            this.isKingBomby = false;
            this.turnsAttached = 0;
        }
    }
}
