var TetrisViewer = {

	theme: DefaultTheme,
	model: undefined,
	elementId: undefined,

	audioPlayers: {
		"background-music": undefined,
		"piece-drop": undefined,
		"row-complete": undefined
	},

	initialise: function ( tetrisModel, elementId) {
		this.model = tetrisModel;
		this.elementId = elementId;

		this.registerEventHandlers();

		// TODO detect resource loading, to be able to display resource loading indicator
		if (this.theme['audio']) {
			if (this.theme.audio['background-music']) {
				this.audioPlayers['background-music'] = new Audio("themes/" + this.theme['audio']['background-music']);
			}
			if (this.theme.audio['drop']) {
				this.audioPlayers['piece-drop'] = new Audio("themes/" + this.theme['audio']['drop']);
			}
			if (this.theme.audio['row-complete']) {
				this.audioPlayers['row-complete'] = new Audio("themes/" + this.theme['audio']['row-complete']);
			}
		}	

		var board = tetrisModel.getBoard();
		var html = '';
		for (row=0; row<board.length; row++) {
			html += '<div>';
			for (column=0; column<board[0].length; column++) {
				html += '<div class="block" id="r' + row + 'c' + column +'"></div>';
			}
			html += '</div>';        
		}

		$('#'+elementId).html(html);
	},

	registerEventHandlers: function () {
		this.model.on('gameStart', this.onGameStart.bind(this));
		this.model.on('gameEnd', this.onGameEnd.bind(this));
		this.model.on('gamePaused', this.onGamePaused.bind(this));

		this.model.on('gameResumed', this.onGameResumed.bind(this));
		this.model.on('pieceDropped', this.onPieceDropped.bind(this));
		this.model.on('rowCompletion', this.onRowCompletion.bind(this));
		
		this.model.on('levelChange', this.onLevelChange.bind(this));
		this.model.on('renderBoard', this.renderBoard.bind(this));

		this.model.on('pieceRotated', this.onPieceRotated.bind(this));
		this.model.on('pieceMove', this.onPieceMove.bind(this));
	},

	onGameStart: function (event) {
		if (this.audioPlayers['background-music']) {
			this.audioPlayers['background-music'].currentTime = 0;
			this.audioPlayers['background-music'].play();
		}
	},

	onGameEnd: function (event) {
		// stop audio
		if (this.audioPlayers['background-music']) {
			this.audioPlayers['background-music'].pause();
		}
		window.alert('game over');
	},

	onGamePaused: function (event) {
		if (this.audioPlayers['background-music']) {
			this.audioPlayers['background-music'].pause();
		}
		// TODO display paused state
	},

	onGameResumed: function (event) {
		// resume audio
		if (this.audioPlayers['background-music']) {
			this.audioPlayers['background-music'].play();
		}
		//  TODO clear paused state
	},

	onPieceDropped: function (event) {
	
		$('#rowsCompleted').html('rows completed: ' + event.rowsCompleted);
		$('#piecesDropped').html('pieces dropped: ' + event.piecesDropped);
		$('#level').html('level: ' + event.level);
		$('#score').html('score: ' + event.score);

		if (this.audioPlayers['piece-drop']) {
			this.audioPlayers['piece-drop'].currentTime = 0;
			this.audioPlayers['piece-drop'].play();			
		}
		
	},

	onPieceRotated: function (event) {
		// Do nothing for now
	},

	onRowCompletion: function (event) {
		var rowCount = event.rowCount;
		// play audio
		if (this.audioPlayers['row-complete']) {
			this.audioPlayers['row-complete'].currentTime = 0;
			this.audioPlayers['row-complete'].play();		
		}
	},

	onPieceMove: function (event) {
		// Do nothing for now
	},

	onLevelChange: function (event) {
		var board = event.level;
		if (this.theme.levels[event.level-1]) {
			this.adjustBackground(this.theme.levels[event.level-1]);
		}
	},

	adjustBackground: function (config) {
	 	if (config['background']) {
			$('body').css('background', config['background']);
			if ( config['background-size'] ) {
				$('body').css('background-size',config['background-size'] );
			}
			if ( config['credits'] ) {
				$('#artCredit').html(config['credits']);
			} else {
				$('#artCredit').html('no message');
			}
		}					
	},

	renderBoard: function(event) {
		var board = event.board;
		// 
		this.drawBoard(event.board);
	},

	drawBoard: function (board) {
	    var row=0;
		var column=0;
    	for (row=0; row<board.length; row++) {
			for (column=0; column < board[0].length; column++) {
				if (board[row][column] >= 0) {
					$('#r' + (row) + 'c' + (column)).css('background', 
						this.theme.pieces[board[row][column]]['background']);
					$('#r' + (row) + 'c' + (column)).addClass('active');
				} else {
					$('#r' + (row) + 'c' + (column)).css('background','rgba(0,0,0,0.8)');
					$('#r' + (row) + 'c' + (column)).removeClass('active');
				}
			}
		}    	
	}	
};