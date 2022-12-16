import Phaser from 'phaser'

import GameScene from './scenes/game-scene'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	dom: {
		createContainer: true
	},
	scene: [GameScene]
}

export default new Phaser.Game(config)
