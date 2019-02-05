ular$(document).ready(function(){
    si2 = {
	played: 0, level: 1, score: 0, boardSize: 450, population: 200, speed: 900,
	expert: {1: 50},

	init : function(){
		si2.playable = true;
		si2.over = false;
		si2.board = new Array();
		si2.killed = new Array();
		si2.keyMap = new Array();
		si2.myInterval = 0;
		si2.starInterval = 0;
		si2.leftInterval = -1;
		si2.rightInterval = -1;
		si2.shotInterval = -1;
		si2.lines = 0;
		si2.shots = 0;
		si2.timer = 0;

		si2.expertise = parseFloat($('input[type=radio][name=gp]:hidden').val());


		si2.squareSize = si2.expert[si2.expertise];
		si2.nbSq = si2.boardSize/si2.squareSize;
		si2.maxLines = 50+si2.level*10;

		si2.mySquare = { width: 50, height: 50, shotW: 10, shotH: 10 };
		si2.mySquare.left = (si2.boardSize/2)-(si2.mySquare.width/2)-(si2.squareSize/2)*(1-(si2.boardSize/si2.squareSize)%2);
		si2.mySquare.top = si2.boardSize-si2.mySquare.height-10;
		si2.mySquare.step = si2.squareSize;
		si2.population = si2.population-si2.level+1;

		// Joueur 2
		$('#played2').html("Parties: "+si2.played);
		$('#killed2').html("Tués: "+si2.killed.length);
		$('#shots2').html("Tirs: "+si2.shots);

		// Récupération de la taille de notre plateau
		$('#board2').css({ width: si2.boardSize+'px', height: si2.boardSize+'px' }).html('<div id="board_bg2"></div>');
		// Background en mouvement
		$('#board_bg2').css({ width: si2.boardSize+'px', height: si2.squareSize*si2.maxLines+'px', top: (-si2.squareSize*si2.maxLines+si2.boardSize) +'px' });
		// Petit canard
		$('#board2').append("<div id='mySquare2' style='left: " + si2.mySquare.left + "px; top: " + si2.mySquare.top + "px; width: " + si2.mySquare.width + "px; height: " + si2.mySquare.height + "px;'></div>");


		if(si2.played > 0){
			si2.gameRoutine();
		}
		else{
			si2.population = si2.nbSq;
			$('#gameObject2').append("<div id='info2'><img width='350' src='assets/img/canardPres.png' alt='canard'/><br><br><p class='presGame'>Bonjour! <br>JOUEUR 2<br /><br><a class='linkPresGame' id='restart2' href='#'>Alors allons-y!</a></p></div>");
			$('#restart2').click(function(){ si2.gameRestart(); });
		}
		si2.played++;
		si2.keyMapper();
		$('#stopBtn2').click(function(){ si2.gameOver() });
	},


	gameRoutine: function(){

		si2.addStars();
		si2.myInterval = setInterval(function() {

			if(si2.lines >= (si2.maxLines)) {
				si2.gameComplete();
			}
			else{
				si2.checkGameOver();
				si2.addSquareLine();
				si2.lines++;
			}
			$('#played2').html("Parties: "+si2.played);

		}, si2.speed-(si2.level*50*si2.expertise));

		si2.starInterval = setInterval(function() { $('#board_bg2').css({top: "+=1px"}); }, 120);
	},


	gameComplete: function(){

		clearInterval(si2.myInterval);
		clearInterval(si2.starInterval);
		si2.playable = false;
		si2.over = true;
		$('#restart2').click(function(){ si2.gameRestart(); });
	},


	gameOver: function(){
		if(si2.over == true) return false;
		clearInterval(si2.myInterval);
		clearInterval(si2.starInterval);
		$('#gameObject2').append("<div id='info2'><p>GAME OVER<br /><br /><a id='restart2' href='#'>Recommencer</a></p></div>");
		si2.score = 0;
		si2.over = true;
		si2.playable = false;
		$('#restart2').click(function(){ si2.gameRestart(); });
	},


	gameRestart : function(){
		si2.init();
		$('#info2').remove();
	},

	addSquareLine: function() {

		var aSq = new Array();

		for(var i=0; i<si2.nbSq; i++) {
			aSq[i] = Math.floor(Math.random()*si2.population);

		}

		si2.board.push(aSq);
		$('.invaders2').remove();

		for(var i=0; i<si2.board.length; i++) {
			for(var j=0; j<si2.nbSq; j++) {

				if(si2.board[i][j] === 1 && $.inArray("#i"+ i +"_"+ j, si2.killed) === -1){
					$('#board2').append("<div id='i"+ i +"_"+ j +"' class='invaders2' style='left: " + (j*si2.squareSize) + "px; top: " + ((si2.board.length-i)*si2.squareSize-si2.squareSize) + "px; width: "+si2.squareSize+"px; height: "+si2.squareSize+"px;'></div>");
				}
			}
		}
	},


	addStars: function() {

		for (var i=0; i<si2.maxLines*4; i++) {
				$('#board_bg2').append("<div class='star2' style='background: #fff; left: " + Math.floor(Math.random()*si2.boardSize) + "px; top: " + Math.floor(Math.random()*(si2.squareSize*si2.maxLines)) + "px; width: 1px; height: 1px;'></div>");
		}
	},


	checkGameOver: function() {

		if(si2.over == true || (si2.board.length < si2.nbSq)) return;

		var finalLine = si2.board.length-si2.nbSq;

		for(var j=0; j<si2.board[finalLine].length; j++) {

			if(si2.board[finalLine][j] == 1 && $.inArray("#i"+ finalLine +"_"+j, si2.killed) === -1){

				si2.gameOver();
			}
		}
	},


// TOUCHE CLAVIER FONCTIONS
	shotListener: function(){
        // Fleche du haut = 38 pour le tir du joueur 2
        // Fleche de gauche = 37 pour direction gauche du joueur 2
        // Fleche de droite = 39 pour direction droite du joueur 2
		if(si2.keyMap[38] == false || si2.playable != true) return;
		var gsl = si2.shots++;
		$('#shots2').html("Tirs: "+(gsl+1));
		var myPos = parseFloat($('#mySquare2').css("left"));
		shotPos = myPos + si2.mySquare.width/2 -2;
		var shotSquare = 0
		var shotTop = 0;

		$('.invaders2').each(function(){

			var id = '#'+$(this).attr("id");
			var idAry = id.split("_");
			var column = idAry[1];
			var line = idAry[0].substr(2, idAry[0].length-2);
			var pos = column*si2.squareSize;
			var posDiff = shotPos-pos;

			if(posDiff >= 0 && posDiff <= si2.squareSize){
				shotSquare = { id: id, column: column, line: line };
				return false;
			}
		});

		if(shotSquare !== 0 && $.inArray(shotSquare.id, si2.killed) === -1)
		{
			shotTop = parseFloat($(shotSquare.id).css("top"));
			si2.killed.push(shotSquare.id);

			setTimeout(function(){
				$(shotSquare.id).remove();
				$('#board2').append("<div class='fading2' style='left: " + (shotSquare.column*si2.squareSize) + "px; top: " + shotTop + "px; width: "+si2.squareSize+"px; height: "+si2.squareSize+"px;'></div>");
				$('.fading2').delay(50).fadeOut(70, function(){ $('.fading2').remove() });
			}, (si2.mySquare.top-shotTop)/2);
		}

		$('#board2').append("<div class='shot2' id='shot_"+gsl+"2' style='left: " + shotPos + "px; top: " + si2.mySquare.top + "px; width: "+si2.mySquare.shotW+"px; height: "+si2.mySquare.shotH+"px;'></div>");
		$('#shot_'+gsl+'2').animate({ top: shotTop }, (si2.mySquare.top-shotTop)/2, function(){ $('#shot_'+gsl+'2').remove(); });
		$('#killed2').html("Tués: "+si2.killed.length);
	},

	moveMySquareListener: function(dir){

		if(si2.playable != true) return;

		var myPos = parseFloat($('#mySquare2').css("left"));
		var halfSquareSize = si2.squareSize/2;
		var halfMySquare = si2.mySquare.width/2;

		if(dir == 37){
			(myPos <= halfSquareSize)?
				myPos = -halfMySquare+halfSquareSize : myPos = "-="+si2.mySquare.step+"px";
			$('#mySquare2').css("left", myPos);
		}
		else if(dir == 39) {
			(myPos >= si2.boardSize-halfMySquare-halfSquareSize)?
				myPos = si2.boardSize-halfMySquare-halfSquareSize : myPos = "+="+si2.mySquare.step+"px";
			$('#mySquare2').css("left", myPos);
		}
	},

	keyMapper: function(){

		keys = [38, 37, 39];
		si2.keyMap[38] = false;
		si2.keyMap[37] = false;
		si2.keyMap[39] = false;
		si2.moveMySquareListener();

		$(document).keydown(function(event) {
			if($.inArray(event.keyCode, keys) === -1) return;

			if(si2.keyMap[event.keyCode] == false){
				si2.keyMap[event.keyCode] = +new Date();
			}

			if(si2.keyMap[38] != false && si2.shotInterval === -1){
				si2.shotListener();
				si2.shotInterval = setInterval(function() {
					if(si2.keyMap[38] != false){
						si2.shotListener();
					} else clearInterval(si2.shotInterval);
				}, 250);
			}
			if(si2.keyMap[37] != false && si2.leftInterval === -1){
				if(si2.rightInterval === -1){
					si2.moveMySquareListener(37);
					si2.leftInterval = setInterval(function() {
						if(si2.keyMap[37] != false){
							si2.moveMySquareListener(37);
						} else clearInterval(si2.leftInterval);
					}, 100);
				}
			}
			else if(si2.keyMap[39] != false && si2.rightInterval === -1){
				if(si2.leftInterval === -1){
					si2.moveMySquareListener(39);
					si2.rightInterval = setInterval(function() {
						if(si2.keyMap[39] != false){
							si2.moveMySquareListener(39);
						} else clearInterval(si2.rightInterval);
					}, 100);
				}
			}
		});

		$(document).keyup(function(event) {
			if($.inArray(event.keyCode, keys) === -1) return;

			if(si2.keyMap[event.keyCode] != false){
				si2.keyMap[event.keyCode] = false;

				if(event.keyCode == 38){
					clearInterval(si2.shotInterval);
					si2.shotInterval = -1;
				}
				if(event.keyCode == 37){
					clearInterval(si2.leftInterval);
					si2.leftInterval = -1;
				}
				if(event.keyCode == 39){
					clearInterval(si2.rightInterval);
					si2.rightInterval = -1;
				}
			}
		});
	}
};
});
$(document).ready(function(){ si2.init(); });
