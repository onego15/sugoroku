// ボードクラス
class Board {
    constructor() {
        this.squares = generateBoardSquares();
        this.destination = null; // 目的地
        this.destinationReward = 0; // 目的地の報酬
    }

    // 新しい目的地を設定
    setNewDestination() {
        // 駅のマスからランダムに選択
        const stations = this.squares.filter(sq => sq.type.includes('station'));
        if (stations.length > 0) {
            this.destination = randomChoice(stations);
            this.destinationReward = randomInt(100, 500);
            return this.destination;
        }
        return null;
    }

    // マスを取得
    getSquare(position) {
        return this.squares[position % this.squares.length];
    }

    // 目的地までの距離を計算
    getDistanceToDestination(position) {
        if (!this.destination) {
            return 0;
        }
        return calculateDistance(position, this.destination.id, this.squares.length);
    }

    // ボードを描画
    draw(ctx, players) {
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // マスを描画
        this.squares.forEach((square, index) => {
            this.drawSquare(ctx, square, index);
        });

        // プレイヤーを描画
        players.forEach(player => {
            this.drawPlayer(ctx, player);
        });

        // 目的地マーカーを描画
        if (this.destination) {
            this.drawDestinationMarker(ctx, this.destination);
        }
    }

    // 個別のマスを描画
    drawSquare(ctx, square, index) {
        const size = 30;

        // マスの色を決定
        let color;
        switch (square.type) {
            case 'blue':
                color = '#3498db';
                break;
            case 'red':
                color = '#e74c3c';
                break;
            case 'yellow':
                color = '#f39c12';
                break;
            case 'station-plus':
                color = '#2ecc71';
                break;
            case 'station-minus':
                color = '#9b59b6';
                break;
            default:
                color = '#95a5a6';
        }

        // マスを描画
        ctx.fillStyle = color;
        ctx.fillRect(square.x - size / 2, square.y - size / 2, size, size);

        // 枠線
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(square.x - size / 2, square.y - size / 2, size, size);

        // 駅の場合は名前を表示
        if (square.type.includes('station')) {
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(square.name, square.x, square.y - size / 2 - 5);
        }

        // マス番号を表示（小さく）
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(index.toString(), square.x, square.y + 3);
    }

    // プレイヤーを描画
    drawPlayer(ctx, player) {
        const square = this.getSquare(player.position);
        const playerSize = 15;

        // プレイヤーの位置をずらす（重ならないように）
        const offset = (player.id % 4) * 10 - 15;
        const x = square.x + offset;
        const y = square.y + 20;

        // プレイヤーを円で描画
        ctx.fillStyle = getPlayerColor(player.id);
        ctx.beginPath();
        ctx.arc(x, y, playerSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // 枠線
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();

        // プレイヤー番号
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((player.id + 1).toString(), x, y + 3);

        // 貧乏神がいる場合
        if (player.hasBomby) {
            ctx.fillStyle = '#8b4513';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('貧', x, y - 15);
        }
    }

    // 目的地マーカーを描画
    drawDestinationMarker(ctx, destination) {
        ctx.save();

        // 星印を描画
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#ff6347';
        ctx.lineWidth = 2;

        const x = destination.x;
        const y = destination.y - 40;
        const outerRadius = 15;
        const innerRadius = 7;
        const points = 5;

        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / points - Math.PI / 2;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
