// カードクラス
class Card {
    constructor(id, name, description, type, effect) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type; // 'move', 'money', 'attack', 'defense'
        this.effect = effect; // カードの効果（関数）
    }

    // カードを使用
    use(game, player) {
        if (this.effect) {
            this.effect(game, player);
            return true;
        }
        return false;
    }
}

// カードデータベース
const CARD_DATABASE = [
    {
        id: '急行カード',
        name: '急行カード',
        description: 'サイコロ+3のマス進む',
        type: 'move',
        effect: (game, player) => {
            const dice = rollDice() + 3;
            game.movePlayer(player, dice);
            game.addLog(`${player.name}は急行カードで${dice}マス進んだ！`);
        }
    },
    {
        id: '特急カード',
        name: '特急カード',
        description: 'サイコロ+5のマス進む',
        type: 'move',
        effect: (game, player) => {
            const dice = rollDice() + 5;
            game.movePlayer(player, dice);
            game.addLog(`${player.name}は特急カードで${dice}マス進んだ！`);
        }
    },
    {
        id: '新幹線カード',
        name: '新幹線カード',
        description: 'サイコロ×2のマス進む',
        type: 'move',
        effect: (game, player) => {
            const dice = rollDice() * 2;
            game.movePlayer(player, dice);
            game.addLog(`${player.name}は新幹線カードで${dice}マス進んだ！`);
        }
    },
    {
        id: '臨時収入カード',
        name: '臨時収入カード',
        description: '100万円を得る',
        type: 'money',
        effect: (game, player) => {
            player.money += 100;
            game.addLog(`${player.name}は臨時収入で100万円を得た！`, 'income');
        }
    },
    {
        id: '援助金カード',
        name: '援助金カード',
        description: '200万円を得る',
        type: 'money',
        effect: (game, player) => {
            player.money += 200;
            game.addLog(`${player.name}は援助金で200万円を得た！`, 'income');
        }
    },
    {
        id: 'ぶっとばしカード',
        name: 'ぶっとばしカード',
        description: '選んだプレイヤーをランダムな場所に飛ばす',
        type: 'attack',
        effect: (game, player) => {
            // 自分以外のプレイヤーをランダムに選択
            const targets = game.players.filter(p => p.id !== player.id);
            if (targets.length > 0) {
                const target = randomChoice(targets);
                const newPos = randomInt(0, game.board.squares.length - 1);
                target.position = newPos;
                game.addLog(`${player.name}が${target.name}をぶっとばした！`, 'event');
            }
        }
    },
    {
        id: 'バリアカード',
        name: 'バリアカード',
        description: '1ターンの間、貧乏神や攻撃を防ぐ',
        type: 'defense',
        effect: (game, player) => {
            player.hasBarrier = true;
            game.addLog(`${player.name}はバリアで守られている！`, 'event');
        }
    },
    {
        id: '冬眠カード',
        name: '冬眠カード',
        description: '選んだプレイヤーを1ターン休ませる',
        type: 'attack',
        effect: (game, player) => {
            const targets = game.players.filter(p => p.id !== player.id);
            if (targets.length > 0) {
                const target = randomChoice(targets);
                target.skipNextTurn = true;
                game.addLog(`${player.name}が${target.name}を冬眠させた！`, 'event');
            }
        }
    }
];

// ランダムなカードを生成
function generateRandomCard() {
    const cardData = randomChoice(CARD_DATABASE);
    return new Card(
        cardData.id + '_' + Date.now(),
        cardData.name,
        cardData.description,
        cardData.type,
        cardData.effect
    );
}
