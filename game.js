    let n;
    try{
        n = parseInt(localStorage.getItem("gridSize"));
    }catch(e){
        n = 0;
    }
    
    document.getElementById("gameBox").innerHTML = "";
    for(let i = 0;i<n*n;i++) document.getElementById("gameBox").innerHTML+= "<div class='box'></div>";

    document.getElementById("gameBox").style.gridTemplateColumns = `repeat(${n},1fr)`;
    document.getElementById("gameBox").style.gridTemplateRows = `repeat(${n},1fr)`;
   
    let player_name = ["Player 1","Player 2","Player 3","Player 4","Player 5","Player 6","Player 7","Player 8"];
    
    let boxArray = document.querySelectorAll(".box"); 
    let countArray = new Array(n*n).fill(0);
    let HolderArray = new Array(n*n).fill(null);
    let undoCount =  new Array(n*n);
    let undoHolder = new Array(n*n);
    let undoPlayer = new Array(8);
    let positionArray = new Array(n*n).fill(2);
    let blastVals = [1, 2, 3];
    let color_name = ["#f63636","#A2F636","#369af6","#f63687","#f6c136","#7436f6","#ff4d00","#d4d4d4"];
    let playerEligible = new Array(8).fill(1);
    var turn = 0;
    var count_click = 0;
    var freeze = 0;
    let number_of_player;
    try {
        number_of_player = parseInt(localStorage.getItem("count"));
    } catch (e) {
        number_of_player = 0;
    }
    let lastStatus;
    let lastTurn;
    let statusBtn = document.getElementById("status");
    let Info = document.getElementById("gameInfo");

    let box_clicked = (index) => {
        
        HolderArray[index] = player_name[turn];
        if (blastVals[positionArray[index]] > countArray[index]) {
            countArray[index]++;
        } else {
            countArray[index] = 0;
            HolderArray[index] = null;

            if(positionArray[index] == 2){
                box_clicked(index-1);
                box_clicked(index+1);
                box_clicked(index+n);
                box_clicked(index-n);
            }else if(positionArray[index] == 1){
                if((index>0 && index<n-1) || (index<(n*n-1) && index >(n*n-n))){
                    box_clicked(index-1);
                    box_clicked(index+1);
                    if(index+n > positionArray.length-1){
                        box_clicked(index-n);
                    }else{
                        box_clicked(index+n);
                    }
                }else{
                    box_clicked(index+n);
                    box_clicked(index-n);
                    if(index%n == 0){
                        box_clicked(index+1);
                    }else{
                        box_clicked(index-1);
                    }
                }
            }else{
                if(index == 0){
                    box_clicked(index+1);
                    box_clicked(index+n);
                }else if(index == n-1){
                    box_clicked(index-1);
                    box_clicked(index+n);
                }else if(index == (n*n-1)){
                    box_clicked(index-1);
                    box_clicked(index-n);
                }else if(index == (n*n-n)){
                    box_clicked(index+1);
                    box_clicked(index-n);
                }
            }
        }
    };

    let changeturn = () => {
        turn = (turn+1) % number_of_player;
        if(playerEligible[turn] != 1){
            changeturn();
        }
        statusBtn.innerHTML = "Turn: " + player_name[turn];
        boxArray.forEach((box)=>{
            let color = color_name[turn];
            box.style.border = `0.5px Solid ${color}`;
        });
    };


    let checkLoser = ()=>{
        if(count_click>number_of_player){
            for(let player of player_name){
                if(HolderArray.indexOf(player) == -1 && playerEligible[player_name.indexOf(player)] == 1){
                    alert(`${player} has lost the Game`);
                    playerEligible[player_name.indexOf(player)] = 0;
                }
            }
        }
    };

    let checkWinner = () => {
        for (let holder of HolderArray) {
            if (holder != player_name[turn] && holder != null) {
                return 0;
            }
        }
        return 1;
    };

    let displayVals = () => {
        boxArray.forEach((box, index) => {
            let count = countArray[index];
            let color = color_name[player_name.indexOf(HolderArray[index])];
            if (count != 0 && color != null) {
                box.innerHTML = "";
                for(let i = 0 ; i<count;i++){
                    box.innerHTML += `<div class="ball" style = "background-color:${color}"></div>`;
                }
            } else {
                box.innerHTML = ''; 
            }
        });
    };

    let reset = () =>{
        countArray.fill(0);
        HolderArray.fill(null);
        count_click = 0 ;
        turn = 0;
        displayVals();
        statusBtn.innerHTML = "Turn: " + player_name[turn];
        boxArray.forEach((box)=>{
            let color = color_name[turn];
            box.style.border = `0.5px Solid ${color}`;
        });
        Info.innerHTML = "Game Starts";
        playerEligible.fill(1);
        define_eligibility();
        freeze = 0;
    }

    let undo = () =>{
        countArray = undoCount.slice();
        HolderArray = undoHolder.slice();
        playerEligible = undoPlayer.slice();
        Info.innerHTML = lastStatus;
        turn = lastTurn;
        count_click--;
        displayVals();
        statusBtn.innerHTML = "Turn: " + player_name[turn];
        boxArray.forEach((box)=>{
            let color = color_name[turn];
            box.style.border = `0.5px Solid ${color}`;
        });
        if(freeze == 1){
            freeze = 0;
        }
    }

    function define_eligibility(){
        for(let i = number_of_player; i<8;i++){
            playerEligible[i] = 0;
        }
    }

    function define_positions() {
        positionArray[0] = 0;
        positionArray[n - 1] = 0;
        positionArray[n * n - 1] = 0;
        positionArray[n * n - n] = 0;

        for (let i = 1; i < n - 1; i++) {
            positionArray[i] = 1;
            positionArray[n * i] = 1;
            positionArray[(n * (i + 1) - 1)] = 1;
            positionArray[(n * n - n + i)] = 1;
        }
    }

    reset();
    define_positions();
    define_eligibility();

    boxArray.forEach((box, index) => {
        box.addEventListener("click", () => {
            let currentHolder = HolderArray[index];
            if ((currentHolder === null || currentHolder === player_name[turn]) && freeze == 0 ) {
                undoHolder = HolderArray.slice();
                undoCount = countArray.slice();
                undoPlayer = playerEligible.slice();
                lastStatus = Info.innerHTML;
                lastTurn = turn;
                count_click++;
                box_clicked(index);
                displayVals();
                checkLoser();
                if(checkWinner() == 1 && count_click > number_of_player){
                    Info.innerHTML= "Game Over"; 
                    alert(`Player ${turn + 1} won the game`);
                    freeze = 1;
                }else{
                    changeturn();
                }
            }
        });
    });

    document.getElementById("UndoBtn").addEventListener("click",()=>{
        undo();
    });

    document.getElementById("ResetBtn").addEventListener("click",()=>{
        reset();
    });            

