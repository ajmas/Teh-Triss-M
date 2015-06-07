
$(document).ready( function() {
    Board.init('board');
    TetrisController.initialise();
});

var Board = {

	score: 0,
	
	boardWidth: 10,
	boardHeight: 20,

	currentPiece: undefined,
	currentRotation: 0,

	previousPiece: 2,
	previousRotation: 0,

	pieceRow: 0,
	pieceColumn: 0,

	interval: undefined,
	running: false,
	
	pieces: [],
	levels: [],

	board: [],
	
	level: 1,
	
	init: function (elementId) {
	
		var row=0;
		var column=0;
		var html='';
		
		this.pieces = Pieces;
		this.levels = Levels;
		
		for (row=0; row<this.boardHeight; row++) {
			html += '<div>';
			this.board[row] = [];
			for (column=0; column<this.boardWidth; column++) {
				html += '<div class="block" id="r' + row + 'c' + column +'"></div>';
				this.board[row][column] = -1;
			}
			html += '</div>';        
		}
		$('#'+elementId).html(html);	
	},
	
	start: function () {
		this.running = true;
		var self = this;
		this.interval = setInterval(function () {
			self.drop()
			}, 1000);
	},
	
	pause: function () {
		if (this.interval) {
			window.clearInterval(this.interval);
		}
		this.running = false;
		this.interval = undefined;
	},
	
	
	rotateClockwise: function () {    
		if (!this.running) {
			return;
		}
		var piece = this.pieces[this.currentPiece];
				
		this.eraseBlock();
		
		this.previousRotation = this.currentRotation;
		this.currentRotation++;
		if (this.currentRotation >= piece.rotations.length) {
			this.currentRotation = 0;
		}
		
		while (this.pieceColumn + this.pieceRight() + 1 > this.boardWidth) {
			this.moveLeft();	
		}
		
		while (this.pieceColumn + this.pieceLeft() < 0) {
			this.moveRight();	
		}

		this.drawCurrentBlock();
	},

	rotateCounterClockwise: function () {
		if (!this.running) {
			return;
		}	
		var piece = this.pieces[this.currentPiece];
		
		this.eraseBlock();
		
		this.previousRotation = this.currentRotation;
		this.currentRotation--;
		if (this.currentRotation < 0) {
			this.currentRotation = piece.rotations.length - 1;
		}
		
		while (this.pieceColumn + this.pieceRight() + 1 > this.boardWidth) {
			this.moveLeft();	
		}
		
		while (this.pieceColumn + this.pieceLeft() < 0) {
			this.moveRight();	
		}
				
		this.drawCurrentBlock();
	},

	moveLeft: function () {
	    if (this.pieceColumn + this.pieceLeft() > 0) {
			this.eraseBlock();		
			this.pieceColumn--;
			this.drawCurrentBlock();
		}
	},
	
	moveRight: function () {
	    if (this.pieceColumn + this.pieceRight() + 1 < this.boardWidth) {	
			this.eraseBlock();
			this.pieceColumn++;
			this.drawCurrentBlock();	
		}
	},
	
	startLevel: function () {
		$('body').css('background', Levels[this.level-1].background);
		if ( Levels[this.level-1]['background-size'] ) {
			$('body').css('background-size', Levels[this.level-1]['background-size'] );
		}
	},
	
	drop: function () {		
		if (!this.running) {
			return;
		}	
		if (this.currentPiece === undefined) {
			this.currentPiece = Math.floor(Pieces.length * Math.random());
			this.pieceRow = -3;
			this.pieceColumn = 0;
			this.startLevel();
		} else {
			console.log(this.pieceRow, this.boardHeight, this.pieceRow > this.boardHeight);
			if (this.pieceRow > this.boardHeight-3) {
				this.currentPiece = undefined;
				return;
			}
			this.eraseBlock();

			this.pieceRow++;
		}
		this.drawCurrentBlock();
	},

	
    pieceLeft: function () {
        var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
        var row=0;
		var column=0;
		var leftMost=rotation[0].length;
		for (row=0; row<rotation.length; row++) {
			for (column=0; column<rotation[0].length; column++) {
				if (rotation[row][column] === 1 && leftMost > column) {
					leftMost = column;
				} 
			}
		}
		return leftMost;
    },
    
    pieceRight: function () {
        var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
        var row=0;
		var column=0;
		var rightMost=0;
		for (row=0; row<rotation.length; row++) {
			for (column=0; column<rotation[0].length; column++) {
				if (rotation[row][column] === 1 && rightMost < column) {
					rightMost = column;
				} 
			}
		}		
		return rightMost;
    }, 
    
    findCompletedRows: function () {
        var row=0;
		var column=0;
		var completedRows=[];
    	for (row=0; row<this.boardHeight; row++) {
    		var allFull=true;
			for (column=0; column<this.boardWidth; column++) {
				if (this.board[row][column] < 0) {
					allFull=false;
					break;
				}
			}
			if (allFull) {
				completedRows.push(row);
			}
		}
		return completedRows;
    },
    
	drawCurrentBlock: function () {
		var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
		
		if (rotation === undefined) {
			return
		}
				
		var row=0;
		var column=0;
		for (row=0; row<rotation.length; row++) {
			for (column=0; column<rotation[0].length; column++) {
				if (rotation[row][column] === 1) {
					if (row + this.pieceRow >= 0  && row + this.pieceRow < this.boardHeight) {
						this.board[row + this.pieceRow][column + this.pieceColumn] = this.currentPiece;
					}
				 }
			}
		}
		this.drawBoard();
	},

	eraseBlock: function () {
		var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
		
		if (rotation === undefined) {
			return
		}
		
		var row=0;
		var column=0;
		for (row=0; row<rotation.length; row++) {
			for (column=0; column<rotation[0].length; column++) {
				if (rotation[row][column] === 1) {        
					if (row + this.pieceRow >= 0 && row + this.pieceRow < this.boardHeight ) {
						this.board[row + this.pieceRow][column + this.pieceColumn] = -1;
					}
				}
			}
		}
		//this.drawBoard();
	},	
	
	drawBoard: function () {
	    var row=0;
		var column=0;
    	for (row=0; row<this.boardHeight; row++) {
			for (column=0; column<this.boardWidth; column++) {
				if (this.board[row][column] >= 0) {
					//$('#r' + (row) + 'c' + (column)).css('background-color', this.pieces[this.board[row][column]].color);				
					$('#r' + (row) + 'c' + (column)).html(String.fromCharCode(this.board[row][column] + '98'));
				} else {
					//$('#r' + (row) + 'c' + (column)).css('background-color','black');
					$('#r' + (row) + 'c' + (column)).html('.');
				}
			}
		}    	
	}
};

var TetrisController = {

	initialise: function () {
		$(window).keypress( function (event) {
			switch (event.which) {
				case 32:
					Board.drop();
					break;
// 				case 'j':
// 				case 'J':
				case 74:
				case 106:
					console.log('xx');
					Board.moveLeft();//rotateClockwise();
					break;
// 				case 'l':
// 				case 'L':
				case 75:
				case 107:
					Board.rotateClockwise();
					break;
				case 76:
				case 108:
					Board.moveRight();//rotateClockwise();
					break;					
			}
			console.log(event.which);
		});
	}
}

