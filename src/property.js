// 物件クラス
class Property {
    constructor(id, name, price, income, stationId) {
        this.id = id;
        this.name = name;
        this.price = price; // 購入価格（万円）
        this.income = income; // 年間収益（万円）
        this.stationId = stationId; // どの駅に属するか
        this.owner = null; // 所有者（プレイヤーID）
    }

    // 物件を購入
    buy(player) {
        if (this.owner !== null) {
            return false; // 既に所有者がいる
        }
        if (player.money < this.price) {
            return false; // 資金不足
        }

        player.money -= this.price;
        this.owner = player.id;
        player.properties.push(this);
        return true;
    }

    // 物件を売却
    sell(player) {
        if (this.owner !== player.id) {
            return false; // 所有者でない
        }

        // 半額で売却
        const sellPrice = Math.floor(this.price / 2);
        player.money += sellPrice;
        this.owner = null;

        // プレイヤーの所有物件リストから削除
        const index = player.properties.findIndex(p => p.id === this.id);
        if (index !== -1) {
            player.properties.splice(index, 1);
        }

        return true;
    }

    // 決算時の収益を計算
    getYearlyIncome() {
        return this.income;
    }
}

// 駅の物件データを生成
function generateStationProperties(stationId, stationName, level) {
    const properties = [];
    const basePrice = 50 + level * 30;
    const baseIncome = 10 + level * 5;

    // 各駅に3-5個の物件を配置
    const propertyCount = randomInt(3, 5);
    const propertyTypes = ['商店', '飲食店', 'オフィス', '工場', 'ホテル'];

    for (let i = 0; i < propertyCount; i++) {
        const type = randomChoice(propertyTypes);
        const priceVariation = randomInt(-20, 20);
        const incomeVariation = randomInt(-5, 5);

        properties.push(new Property(
            `${stationId}_${i}`,
            `${stationName}${type}${i + 1}`,
            Math.max(30, basePrice + priceVariation),
            Math.max(5, baseIncome + incomeVariation),
            stationId
        ));
    }

    return properties;
}
