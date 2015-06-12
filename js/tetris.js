
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
	piecesDropped: 0,
	
	init: function (elementId) {
	
	
		// Array Remove - By John Resig (MIT Licensed)
		Array.prototype.remove = function(from, to) {
		  var rest = this.slice((to || from) + 1 || this.length);
		  this.length = from < 0 ? this.length + from : from;
		  return this.push.apply(this, rest);
		};

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
	    if (!this.running) {
			this.running = true;
			var self = this;
			this.interval = setInterval(function () {
				self.drop()
				}, 1000);
				
			this.level = 1;
			this.score = 0;
			this.piecesDropped = 0;
			this.startLevel(this.level);
		}
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
		
		var previousRotation = this.currentRotation;
		this.currentRotation++;
		if (this.currentRotation >= piece.rotations.length) {
			this.currentRotation = 0;
		}
		
		if (this.pieceRight() > -1 && this.pieceColumn + this.pieceRight() + 1 > this.boardWidth) {
			this.currentRotation = previousRotation;
		} else if (this.pieceLeft() > -1 && this.pieceColumn + this.pieceLeft() < 0) {
			this.currentRotation = previousRotation;
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
		
		if (this.pieceRight() > -1 && this.pieceColumn + this.pieceRight() + 1 > this.boardWidth) {
			this.currentRotation = previousRotation;
		} else if (this.pieceLeft() > -1 && this.pieceColumn + this.pieceLeft() < 0) {
			this.currentRotation = previousRotation;
		}
								
		this.drawCurrentBlock();
	},

	moveLeft: function () {
	    var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
	    this.eraseBlock();
	    if (this.canMoveLeft(rotation)) {					
			this.pieceColumn--;
		}
		this.drawCurrentBlock();

	},
	
	moveRight: function () {
	    var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
	    this.eraseBlock();
	    if (this.canMoveRight(rotation)) {					
			this.pieceColumn++;
		}
		this.drawCurrentBlock();
	},
	
	startLevel: function (level) {
		var idx=level-1;
		if (idx >= Levels.length ) { 
			idx = Levels % idx;
		}
		$('body').css('background', Levels[idx].background);
		if ( Levels[idx]['background-size'] ) {
			$('body').css('background-size', Levels[idx]['background-size'] );
		}
	},
	
	drop: function () {		
		if (!this.running) {
			return;
		}	
		if (this.currentPiece === undefined) {
			this.currentPiece = Math.floor(Pieces.length * Math.random());
			this.pieceColumn = 0;
			this.currentRotation = 0;
			
			var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
			this.pieceRow = 0 - rotation.length;

			if (this.piecesDropped > 0 && this.piecesDropped % 10 === 0) {
				this.level++;
				this.startLevel(this.level);
			}
			$('#piecesDropped').html('pieces dropped: ' + this.piecesDropped);
			$('#level').html('level: ' + this.level);
			$('#score').html('score: ' + this.score);
			this.piecesDropped++;
		} else {	
			
	        var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
			this.eraseBlock();
					
			if (! this.canDrop(rotation)) {
				this.drawCurrentBlock();
				if (this.pieceRow < 0) {
					console.log("game over");
					window.alert("game over");
					this.pause();
					return;
				}
				this.currentPiece = undefined;
				
				// Detect row completions
				
				var rows = this.findCompletedRows();
				var columnIdx = 0;
				var i=0;
				for (i=0; i<rows.length; i++) {
					var rowIdx = rows[i];
                    console.log("row to remove: " + rowIdx, rows.length, i);
					this.board.splice(rowIdx,1);
									
					var newRow = [];
					for (columnIdx=0; columnIdx<this.boardWidth; columnIdx++) {
					    newRow[columnIdx] = -1;
					}
					
					this.board.splice(0,0,newRow);
				}
				return;
			} else {
				this.pieceRow++;
			}			

		}
		this.drawCurrentBlock();
	},
	
	canDrop: function (rotation) {
		var row=0;
		var column=0;		
		for (row=rotation.length-1; row >= 0; row--) {
			for (column=0; column<rotation[0].length; column++) {
				if  (this.pieceRow + row+1 < 0) {
					continue;
				}
				if (rotation[row][column] !== 0 && this.pieceRow + row + 1>= this.boardHeight) {
					return false;
				} 
				else if (rotation[row][column] !== 0 && this.board[this.pieceRow + row+1][this.pieceColumn + column] !== -1) {
					return false;
				}
			}
		}
		return true;			
	},
	
	canMoveLeft: function (rotation) {
		var row=0;
		var column=0;		
		for (column=0; column<rotation[0].length; column++) {
			for (row=0; row < rotation.length; row++) {			
					
				if (rotation[row][column] !== 0 && this.pieceColumn + column - 1< 0) {
					return false;
				} 
				else if (rotation[row][column] !== 0 && this.board[this.pieceRow + row][this.pieceColumn + column - 1] !== -1) {
					return false;
				}
			}
		}
		return true;	
	},
	
	canMoveRight: function (rotation) {
		var row=0;
		var column=0;		
		for (column=rotation[0].length-1; column>=0; column--) {
			for (row=0; row < rotation.length; row++) {			
					
				if (rotation[row][column] !== 0 && this.pieceColumn + column + 1 > this.boardWidth) {
					return false;
				} 
				else if (rotation[row][column] !== 0 && this.board[this.pieceRow + row][this.pieceColumn + column + 1] !== -1) {
					return false;
				}
			}
		}
		return true;	
	},
	
    pieceLeft: function () {
        if (this.currentPiece  === undefined) {
            return -1;
        }    
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
        if (this.currentPiece  === undefined) {
            return -1;
        }
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
		var allFull=true;
		var completedRows=[];
    	for (row=0; row<this.boardHeight; row++) {
    		allFull=true;
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
		
		column = 0;
		row = 0;
		//this.board[row + this.pieceRow][column + this.pieceColumn] = 2;
		
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
					if (row + this.pieceRow >= 0 && row + this.pieceRow < this.boardHeight && rotation[row][column] !== 0) {
						this.board[row + this.pieceRow][column + this.pieceColumn] = -1;
					}
				}
			}
		}
	},	
	
	drawBoard: function () {
	    var row=0;
		var column=0;
    	for (row=0; row<this.boardHeight; row++) {
			for (column=0; column<this.boardWidth; column++) {
				if (this.board[row][column] >= 0) {
					$('#r' + (row) + 'c' + (column)).css('background-color', this.pieces[this.board[row][column]].color);				
					//$('#r' + (row) + 'c' + (column)).html(String.fromCharCode(this.board[row][column] + '98'));
					$('#r' + (row) + 'c' + (column)).addClass('active');
				} else {
					$('#r' + (row) + 'c' + (column)).css('background-color','rgba(0,0,0,0.8)');
					$('#r' + (row) + 'c' + (column)).removeClass('active');
					//$('#r' + (row) + 'c' + (column)).html('.');
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

				case 74:
				case 106:
					Board.moveLeft();
					break;

				case 75:
				case 107:
					Board.rotateClockwise();
					break;
				case 76:
				case 108:
					Board.moveRight();
					break;					
			}
		});
	}
}

