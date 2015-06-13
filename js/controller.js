var TetrisController = {
	model: undefined,
	
	initialise: function (model) {
		this.model = model;
		
		$(window).keypress( function (event) {
			switch (event.which) {
				case 32:
					model.drop();
					break;

				case 74:
				case 106:
					model.moveLeft();
					break;

				case 75:
				case 107:
					model.rotateClockwise();
					break;
				case 76:
				case 108:
					model.moveRight();
					break;					
			}
		});
	}
}
