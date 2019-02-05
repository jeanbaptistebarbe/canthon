$(document).ready(function(){
    si = {
	played: 0, level: 1, score: 0, boardSize: 450, population: 200, speed: 900,
	expert: {1: 50},

	init : function(){
		si.playable = true;
		si.over = false;
		si.board = new Array();
		si.killed = new Array();
		si.keyMap = new Array();
		si.myInterval = 0;
		si.starInterval = 0;
		si.leftInterval = -1;
		si.rightInterval = -1;
		si.shotInterval = -1;
		si.lines = 0;
		si.shots = 0;
		si.timer = 0;

		si.expertise = parseFloat($('input[type=radio][name=gp]:hidden').val());


		si.squareSize = si.expert[si.expertise];
		si.nbSq = si.boardSize/si.squareSize;
		si.maxLines = 50+si.level*10;

		si.mySquare = { width: 50, height: 50, shotW: 10, shotH: 10 };
		si.mySquare.left = (si.boardSize/2)-(si.mySquare.width/2)-(si.squareSize/2)*(1-(si.boardSize/si.squareSize)%2);
		si.mySquare.top = si.boardSize-si.mySquare.height-10;
		si.mySquare.step = si.squareSize;
		si.popluation = si.population-si.level+1;


		// Joueur 1
		$('#played').html("Parties: "+si.played);
		$('#killed').html("Tués: "+si.killed.length);
		$('#shots').html("Tirs: "+si.shots);
		
		// Récupération de la taille de notre plateau
		$('#board').css({ width: si.boardSize+'px', height: si.boardSize+'px' }).html('<div id="board_bg"></div>');
		// Background en mouvement
		$('#board_bg').css({ width: si.boardSize+'px', height: si.squareSize*si.maxLines+'px', top: (-si.squareSize*si.maxLines+si.boardSize) +'px' });
		// Petit canard tueur de formateur
		$('#board').append("<div id='mySquare' style='left: " + si.mySquare.left + "px; top: " + si.mySquare.top + "px; width: " + si.mySquare.width + "px; height: " + si.mySquare.height + "px;'></div>");


		if(si.played > 0){
			si.gameRoutine();
		}
		else{
			si.population = si.nbSq;
			$('#game_object').append("<div id='info'><img width='350' src='assets/img/canardPres2.png' alt='canard'/><br><br><p class='presGame'>Bonjour! <br>JOUEUR 1<br /><br><a class='linkPresGame' id='restart' href='#'>Alors allons-y!</a></p></div>");
			$('#restart').click(function(){ si.gameRestart(); });
		}
		si.played++;
		si.keyMapper();
		$('#stopBtn').click(function(){ si.gameOver() });
	},


	gameRoutine: function(){

		si.addStars();
		si.myInterval = setInterval(function() {

			if(si.lines >= (si.maxLines)) {
				si.gameComplete();
			}
			else{
				si.checkGameOver();
				si.addSquareLine();
				si.lines++;
			}
			$('#played').html("Parties: "+si.played);

		}, si.speed-(si.level*50*si.expertise));

		si.starInterval = setInterval(function() { $('#board_bg').css({top: "+=1px"}); }, 120);
	},


	gameComplete: function(){

		clearInterval(si.myInterval);
		clearInterval(si.starInterval);
		si.playable = false;
		si.over = true;
		$('#restart').click(function(){ si.gameRestart(); });
	},


	gameOver: function(){
		if(si.over == true) return false;
		clearInterval(si.myInterval);
		clearInterval(si.starInterval);
		$('#game_object').append("<div id='info'><p>GAME OVER<br /><br /><a id='restart' href='#'>Recommencer</a></p></div>");
		si.score = 0;
		si.over = true;
		si.playable = false;
		$('#restart').click(function(){ si.gameRestart(); });
	},


	gameRestart : function(){
		si.init();
		$('#info').remove();
	},

	addSquareLine: function() {

		var aSq = new Array();

		for(var i=0; i<si.nbSq; i++) {
			aSq[i] = Math.floor(Math.random()*si.population);

		}

		si.board.push(aSq);
		$('.invaders').remove();

		for(var i=0; i<si.board.length; i++) {
			for(var j=0; j<si.nbSq; j++) {

				if(si.board[i][j] === 1 && $.inArray("#i"+ i +"_"+ j, si.killed) === -1){
					$('#board').append("<div id='i"+ i +"_"+ j +"' class='invaders' style='left: " + (j*si.squareSize) + "px; top: " + ((si.board.length-i)*si.squareSize-si.squareSize) + "px; width: "+si.squareSize+"px; height: "+si.squareSize+"px;'></div>");
				}
			}
		}
	},


	addStars: function() {

		for (var i=0; i<si.maxLines*4; i++) {
				$('#board_bg').append("<div class='star' style='background: #fff; left: " + Math.floor(Math.random()*si.boardSize) + "px; top: " + Math.floor(Math.random()*(si.squareSize*si.maxLines)) + "px; width: 1px; height: 1px;'></div>");
		}
	},


	checkGameOver: function() {

		if(si.over == true || (si.board.length < si.nbSq)) return;

		var finalLine = si.board.length-si.nbSq;

		for(var j=0; j<si.board[finalLine].length; j++) {

			if(si.board[finalLine][j] == 1 && $.inArray("#i"+ finalLine +"_"+j, si.killed) === -1){

				si.gameOver();
			}
		}
	},


// TOUCHE CLAVIER FONCTIONS
	shotListener: function(){
        // La touche Z = 90 pour le tir du joueur 1
        // La touche D = 68 pour direction droite du joueur 1
        // La touche Q = 81 pour direction gauche du joueur 1
		if(si.keyMap[90] == false || si.playable != true) return;
		var gsl = si.shots++;
		$('#shots').html("Tirs: "+(gsl+1));
		var myPos = parseFloat($('#mySquare').css("left"));
		shotPos = myPos + si.mySquare.width/2 -2;
		var shotSquare = 0
		var shotTop = 0;

		$('.invaders').each(function(){

			var id = '#'+$(this).attr("id");
			var idAry = id.split("_");
			var column = idAry[1];
			var line = idAry[0].substr(2, idAry[0].length-2);
			var pos = column*si.squareSize;
			var posDiff = shotPos-pos;

			if(posDiff >= 0 && posDiff <= si.squareSize){
				shotSquare = { id: id, column: column, line: line };
				return false;
			}
		});

		if(shotSquare !== 0 && $.inArray(shotSquare.id, si.killed) === -1)
		{
			shotTop = parseFloat($(shotSquare.id).css("top"));
			si.killed.push(shotSquare.id);

			setTimeout(function(){
				$(shotSquare.id).remove();
				$('#board').append("<div class='fading' style='left: " + (shotSquare.column*si.squareSize) + "px; top: " + shotTop + "px; width: "+si.squareSize+"px; height: "+si.squareSize+"px;'></div>");
				$('.fading').delay(50).fadeOut(70, function(){ $('.fading').remove() });
			}, (si.mySquare.top-shotTop)/2);
		}

		$('#board').append("<div class='shot' id='shot_"+gsl+"' style='left: " + shotPos + "px; top: " + si.mySquare.top + "px; width: "+si.mySquare.shotW+"px; height: "+si.mySquare.shotH+"px;'></div>");
		$('#shot_'+gsl).animate({ top: shotTop }, (si.mySquare.top-shotTop)/2, function(){ $('#shot_'+gsl).remove(); });
		$('#killed').html("Tués: "+si.killed.length);
	},

	moveMySquareListener: function(dir){

		if(si.playable != true) return;

		var myPos = parseFloat($('#mySquare').css("left"));
		var halfSquareSize = si.squareSize/2;
		var halfMySquare = si.mySquare.width/2;

		if(dir == 81){
			(myPos <= halfSquareSize)?
				myPos = -halfMySquare+halfSquareSize : myPos = "-="+si.mySquare.step+"px";
			$('#mySquare').css("left", myPos);
		}
		else if(dir == 68) {
			(myPos >= si.boardSize-halfMySquare-halfSquareSize)?
				myPos = si.boardSize-halfMySquare-halfSquareSize : myPos = "+="+si.mySquare.step+"px";
			$('#mySquare').css("left", myPos);
		}
	},

	keyMapper: function(){

		keys = [90, 81, 68];
		si.keyMap[90] = false;
		si.keyMap[81] = false;
		si.keyMap[68] = false;
		si.moveMySquareListener();

		$(document).keydown(function(event) {
			if($.inArray(event.keyCode, keys) === -1) return;

			if(si.keyMap[event.keyCode] == false){
				si.keyMap[event.keyCode] = +new Date();
			}

			if(si.keyMap[90] != false && si.shotInterval === -1){
				si.shotListener();
				si.shotInterval = setInterval(function() {
					if(si.keyMap[90] != false){
						si.shotListener();
					} else clearInterval(si.shotInterval);
				}, 250);
			}
			if(si.keyMap[81] != false && si.leftInterval === -1){
				if(si.rightInterval === -1){
					si.moveMySquareListener(81);
					si.leftInterval = setInterval(function() {
						if(si.keyMap[81] != false){
							si.moveMySquareListener(81);
						} else clearInterval(si.leftInterval);
					}, 100);
				}
			}
			else if(si.keyMap[68] != false && si.rightInterval === -1){
				if(si.leftInterval === -1){
					si.moveMySquareListener(68);
					si.rightInterval = setInterval(function() {
						if(si.keyMap[68] != false){
							si.moveMySquareListener(68);
						} else clearInterval(si.rightInterval);
					}, 100);
				}
			}
		});

		$(document).keyup(function(event) {
			if($.inArray(event.keyCode, keys) === -1) return;

			if(si.keyMap[event.keyCode] != false){
				si.keyMap[event.keyCode] = false;

				if(event.keyCode == 90){
					clearInterval(si.shotInterval);
					si.shotInterval = -1;
				}
				if(event.keyCode == 81){
					clearInterval(si.leftInterval);
					si.leftInterval = -1;
				}
				if(event.keyCode == 68){
					clearInterval(si.rightInterval);
					si.rightInterval = -1;
				}
			}
		});
	}
};
});
$(document).ready(function(){ si.init(); });
