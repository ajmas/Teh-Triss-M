

var TetrisModel = {

	theme: DefaultTheme,
	
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
	rowsCompleted: 0,
	gameover: true,
	
	
	eventHandlers: {
		gameStart: [],
		gameEnd: [],
		gamePaused: [],
		gameResumed: [],
		pieceDropped: [],
		rowCompletion: [],		
		levelChange: [],
		renderBoard: [],
		pieceRotated: []
	},

	initialise: function (elementId) {
	
	
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
		this.levels = this.theme.levels;
		
		
		for (row=0; row<this.boardHeight; row++) {
			this.board[row] = [];
			for (column=0; column<this.boardWidth; column++) {
				this.board[row][column] = -1;
			}
		}
	},
	
	getBoard: function () {
		return this.board;
	},

	clearBoard: function () {
		for (row=0; row<this.boardHeight; row++) {
			for (column=0; column<this.boardWidth; column++) {
				this.board[row][column] = -1;
			}
		}
	},
	
	on: function (eventName, handler) {
		if (this.eventHandlers[eventName]) {
			this.eventHandlers[eventName].push(handler);
		}

	},

	fireEvent: function (eventName, event) {
		var i=0;
		if (this.eventHandlers[eventName] && this.eventHandlers[eventName].length > 0) {
			for (i=0; i<this.eventHandlers[eventName].length; i++) {
				this.eventHandlers[eventName][i](event);
			}
		}
	},


	start: function () {
	    if (!this.running ) {
			this.running = true;
				
			if (this.gameover) {	
				this.clearBoard();
				this.drawBoard();
				this.level = 1;
				this.score = 0;
				this.piecesDropped = 0;
				this.startLevel(this.level);
			
				this.fireEvent('gameStart', {
					score: this.score,
					level: this.level,
					rowsCompleted: this.rowsCompleted,
					piecesDropped: this.piecesDropped
				});
	
				this.gameover = false;

			}			
						
			var self = this;
			this.interval = setInterval(function () {
				self.drop()
				}, 1000);
		}
	},
	
	pause: function () {
		if (!this.running && !this.gameover) {
			this.start();
			this.fireEvent('gameResumed', { } );
		}
		else {
			this.fireEvent('gamePaused', { } );

			if (this.interval) {
				window.clearInterval(this.interval);
			}
			this.running = false;
			this.interval = undefined;
		}
	},
	
	
	rotateClockwise: function () {    
		if (!this.running || !this.currentPiece) {
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

		if (this.currentRotation != previousRotation) {
			this.fireEvent('pieceRotated', {
				direction: 'clockwise'
			});
		}
	},

	rotateCounterClockwise: function () {
		if (!this.running || !this.currentPiece) {
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

		if (this.currentRotation != previousRotation) {
			this.fireEvent('pieceRotated', {
				direction: 'counterClockwise'
			});
		}		
	},

	moveLeft: function () {
		if (!this.running || !this.currentPiece) {
			return;
		}

	    var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
	    var canMove = false;
	    this.eraseBlock();

	    canMove = this.canMoveLeft(rotation);
	    if (canMove) {					
			this.pieceColumn--;
		}
		this.drawCurrentBlock();

		if (canMove) {
			this.fireEvent('pieceMoved', {
				direction: 'left'
			});
		}
	},
	
	moveRight: function () {
		if (!this.running || !this.currentPiece) {
			return;
		}

	    var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
	    var canMove = false;

	    this.eraseBlock();
	    canMove = this.canMoveRight(rotation);
	    if (canMove) {					
			this.pieceColumn++;
		}
		this.drawCurrentBlock();

		if (canMove) {
			this.fireEvent('pieceMoved', {
				direction: 'right'
			});
		}		
	},	
	
	startLevel: function (level) {
		this.fireEvent('levelChange', {
			score: this.score,
			level: this.level,
			rowsCompleted: this.rowsCompleted,
			piecesDropped: this.piecesDropped
		});		
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

			this.piecesDropped++;
		} else {	
			
	        var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
			this.eraseBlock();
					
			if (! this.canDrop(rotation)) {
				this.drawCurrentBlock();
				if (this.pieceRow < 0) {
					this.pause();
					console.log("game over");
					this.gameover = true;
					
					this.fireEvent('gameEnd', {
						score: this.score,
						level: this.level,
						rowsCompleted: this.rowsCompleted,
						piecesDropped: this.piecesDropped
					});						
					return;
				}
				this.currentPiece = undefined;

				// Detect row completions
				
				var rows = this.findCompletedRows();
				var columnIdx = 0;
				var i=0;
				
				this.fireEvent('pieceDropped', {
					rowCount: rows.length,
					rows: rows,
					score: this.score,
					level: this.level,
					rowsCompleted: this.rowsCompleted,
					piecesDropped: this.piecesDropped					
				});	

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
		if (this.currentPiece === undefined) {
			return;
		}
		var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];
			
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
		if (this.currentPiece === undefined) {
			return;
		}
		var rotation = this.pieces[this.currentPiece].rotations[this.currentRotation];		
		
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
		this.fireEvent("renderBoard", {
			board: this.board
		});  	
	}
};

