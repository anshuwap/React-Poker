// import "@babel/polyfill";

// import 'core-js/es6/map';
// import 'core-js/es6/set';

import 'raf/polyfill';

import React, { Component } from 'react';
import './App.css';
import './Poker.css';
import './customstyle.css';

import Spinner from './Spinner';
import WinScreen from './WinScreen'

import Player from "./components/players/Player";
import ShowdownPlayer from "./components/players/ShowdownPlayer";
import ShowdownPlayer1 from "./components/players/ShowdownPlayer1";
import Card from "./components/cards/Card";

import { 
  generateDeckOfCards, 
  shuffle, 
  dealPrivateCards,
} from './utils/cards.js';

import { 
  generateTable, 
  beginNextRound,
  checkWin
} from './utils/players.js';

import { 
  determineBlindIndices, 
  anteUpBlinds, 
  determineMinBet,
  handleBet,
  handleFold, 
} from './utils/bet.js';

import {
  handleAI as handleAIUtil
} from './utils/ai.js';

import {
  renderShowdownMessages,
  renderActionButtonText,
  renderNetPlayerEarnings,
  renderActionMenu
} from './utils/ui.js';

import { cloneDeep } from 'lodash';

class App extends Component {
state = {
    loading: true,
    winnerFound: null,
    players: null,
    numPlayersActive: null,
    numPlayersFolded: null,
    numPlayersAllIn: null,
    activePlayerIndex: null,
    dealerIndex: null,
    blindIndex: null,
    deck: null,
    communityCards: [],
    pot: null,
    highBet: null,
    betInputValue: null,
    sidePots: [],
    minBet: 20,
    phase: 'loading',
    playerHierarchy: [],
    showDownMessages: [],
    playActionMessages: [],
    playerAnimationSwitchboard: {
      0: {isAnimating: false, content: null},
      1: {isAnimating: false, content: null},
      2: {isAnimating: false, content: null},
      3: {isAnimating: false, content: null},
      4: {isAnimating: false, content: null},
      5: {isAnimating: false, content: null}
    }
  }

  cardAnimationDelay = 0;
  
  loadTable = () => {

  }

  async componentDidMount() {
    const players = await generateTable();
    const dealerIndex = Math.floor(Math.random() * Math.floor(players.length));
    const blindIndicies = determineBlindIndices(dealerIndex, players.length);
    const playersBoughtIn = anteUpBlinds(players, blindIndicies, this.state.minBet);
    
    const imageLoaderRequest = new XMLHttpRequest();

imageLoaderRequest.addEventListener("load", e => {
    console.log(`${e.type}`);
    console.log(e);
    console.log("Image Loaded!");
    this.setState({
      loading: false,
    })
});

imageLoaderRequest.addEventListener("error", e => {
    console.log(`${e.type}`);
    console.log(e);
});


imageLoaderRequest.addEventListener("loadstart", e => {
    console.log(`${e.type}`);
    console.log(e);
});

imageLoaderRequest.addEventListener("loadend", e => {
    console.log(`${e.type}`);
    console.log(e);
});

imageLoaderRequest.addEventListener("abort", e => {
    console.log(`${e.type}`);
    console.log(e);
});

imageLoaderRequest.addEventListener("progress", e => {
    console.log(`${e.type}`);
    console.log(e);
});

imageLoaderRequest.open("GET", "./assets/table-nobg-svg-01.svg");
imageLoaderRequest.send();

    this.setState(prevState => ({
      // loading: false,
      players: playersBoughtIn,
      numPlayersActive: players.length,
      numPlayersFolded: 0,
      numPlayersAllIn: 0,
      activePlayerIndex: dealerIndex,
      dealerIndex,
      blindIndex: {
        big: blindIndicies.bigBlindIndex,
        small: blindIndicies.smallBlindIndex,
      },
      deck: shuffle(generateDeckOfCards()),
      pot: 0,
      highBet: prevState.minBet,
      betInputValue: prevState.minBet,
      phase: 'initialDeal',
    }))
    this.runGameLoop();
  }

  handleBetInputChange = (val, min, max) => {
    if (val === '') val = min
    if (val > max) val = max
      this.setState({
        betInputValue: parseInt(val, 10),
      });
  }
  
  changeSliderInput = (val) => {
    this.setState({
      betInputValue: val[0]
    })
  }

  pushAnimationState = (index, content) => {
    const newAnimationSwitchboard = Object.assign(
      {}, 
      this.state.playerAnimationSwitchboard,
      {[index]: {isAnimating: true, content}}     
    )
    this.setState({playerAnimationSwitchboard: newAnimationSwitchboard});
  }

  popAnimationState = (index) => {
    const persistContent = this.state.playerAnimationSwitchboard[index].content;
    const newAnimationSwitchboard = Object.assign(
      {}, 
      this.state.playerAnimationSwitchboard,
      {[index]: {isAnimating: false, content: persistContent}}     
    )
    this.setState({playerAnimationSwitchboard: newAnimationSwitchboard});
  }

  handleBetInputSubmit = (bet, min, max) => {
    const {playerAnimationSwitchboard, ...appState} = this.state;
    const { activePlayerIndex } = appState;
    this.pushAnimationState(activePlayerIndex, `${renderActionButtonText(this.state.highBet, this.state.betInputValue, this.state.players[this.state.activePlayerIndex])} ${(bet > this.state.players[this.state.activePlayerIndex].bet) ? (bet) : ""}`);
    const newState = handleBet(cloneDeep(appState), parseInt(bet, 10), parseInt(min, 10), parseInt(max, 10));
      this.setState(newState, () => {
        if((this.state.players[this.state.activePlayerIndex].robot) && (this.state.phase !== 'showdown')) {
          setTimeout(() => {
          
            this.handleAI()
          }, 1200)
        }
      });
  }

  handleFold = () => {
    const {playerAnimationSwitchboard, ...appState} = this.state
    const newState = handleFold(cloneDeep(appState));
      this.setState(newState, () => {
        if((this.state.players[this.state.activePlayerIndex].robot) && (this.state.phase !== 'showdown')) {
          setTimeout(() => {
          
            this.handleAI()
          }, 1200)
        }
      })
  }

  handleAI = () => {
    const {playerAnimationSwitchboard, ...appState} = this.state;
    const newState = handleAIUtil(cloneDeep(appState), this.pushAnimationState)

      this.setState({
            ...newState,
            betInputValue: newState.minBet
      }, () => {
        if((this.state.players[this.state.activePlayerIndex].robot) && (this.state.phase !== 'showdown')) {
          setTimeout(() => {
          
            this.handleAI()
          }, 1200)
        }
      })
  }

  renderBoard = () => {
    const { 
      players,
      activePlayerIndex,
      dealerIndex,
      clearCards,
      phase,
      playerAnimationSwitchboard
    } = this.state;
    // Reverse Players Array for the sake of taking turns counter-clockwise.
    const reversedPlayers = players.reduce((result, player, index) => {
      
      const isActive = (index === activePlayerIndex);
      const hasDealerChip = (index === dealerIndex);


      result.unshift(
          <Player
            key={index}
            arrayIndex={index}
            isActive={isActive}
            hasDealerChip={hasDealerChip}
            player={player}
            clearCards={clearCards}
            phase={phase}
            playerAnimationSwitchboard={playerAnimationSwitchboard}      
            endTransition={this.popAnimationState}
          />
      )
      return result
    }, []);
    return reversedPlayers.map(component => component);
  }

  renderCommunityCards = (purgeAnimation) => {
    return this.state.communityCards.map((card, index) => {
      let cardData = {...card};
      if (purgeAnimation) {
        cardData.animationDelay = 0;
      }
      return(
        <Card key={index} cardData={cardData}/>
      );
    });
  }

  runGameLoop = () => {
    const newState = dealPrivateCards(cloneDeep(this.state))
    this.setState(newState, () => {
      if((this.state.players[this.state.activePlayerIndex].robot) && (this.state.phase !== 'showdown')) {
        setTimeout(() => {
          this.handleAI()
        }, 1200)
      }
    })
  }

  renderRankTie = (rankSnapshot) => {
    return rankSnapshot.map(player => {
      return this.renderRankWinner(player);
    })
  }

  renderRankWinner = (player) => {
    const { name, bestHand, handRank } = player;
    const playerStateData = this.state.players.find(statePlayer => statePlayer.name === name);
    return (
    
      
      <tbody className='result-body' >
      <tr>
      <td  key={name}>   
      <ShowdownPlayer1
          name={name}
          avatarURL={playerStateData.avatarURL}
          cards={playerStateData.cards}
          roundEndChips={playerStateData.roundEndChips}
          roundStartChips={playerStateData.roundStartChips}
        />
        </td>
      <td className='color-black'>{ renderShowdownMessages(this.state.showDownMessages)} </td>
      <td>    
         {/* { this.renderCommunityCards(true) }  */}
         <div className='showdown-player--besthand--cards' style={{alignItems: 'center'}}>
         {
              bestHand.map((card, index) => {
                // Reset Animation Delay
                const cardData = {...card, animationDelay: 0}
                return <Card key={index} cardData={cardData}/>
              })
            }
            </div>
         </td>
      <td>{renderNetPlayerEarnings(playerStateData.roundEndChips, playerStateData.roundStartChips)}</td>
      <td className='color-black'> {handRank} </td>
    </tr>
   
  </tbody>

    
        // <ShowdownPlayer
        //   name={name}
        //   avatarURL={playerStateData.avatarURL}
        //   cards={playerStateData.cards}
        //   roundEndChips={playerStateData.roundEndChips}
        //    roundStartChips={playerStateData.roundStartChips}
        //  />  

      //  <div className="showdown-player--besthand--container">
      //     <h5 className="showdown-player--besthand--heading">
      //       Best Hand
      //     </h5>
      //     <div className='showdown-player--besthand--cards' style={{alignItems: 'center'}}>
      //       {
      //         bestHand.map((card, index) => {
      //           // Reset Animation Delay
      //           const cardData = {...card, animationDelay: 0}
      //           return <Card key={index} cardData={cardData}/>
      //         })
      //       }
      //     </div>
      //   </div> 
      //    <div className="showdown--handrank">
      //     {handRank}
      //   </div> 

       
      
      //     {renderNetPlayerEarnings(playerStateData.roundEndChips, playerStateData.roundStartChips)}  
    
  

    )
  }

  renderBestHands = () => {
    const { playerHierarchy } = this.state;

    return playerHierarchy.map(rankSnapshot => {
      const tie = Array.isArray(rankSnapshot);
      return tie ? this.renderRankTie(rankSnapshot) : this.renderRankWinner(rankSnapshot);
    })
  }

  handleNextRound = () => {
    this.setState({clearCards: true})
    const newState = beginNextRound(cloneDeep(this.state))
    // Check win condition
    if(checkWin(newState.players)) {
      this.setState({ winnerFound: true })
      return;
    }
      this.setState(newState, () => {
        if((this.state.players[this.state.activePlayerIndex].robot) && (this.state.phase !== 'showdown')) {
          setTimeout(() => this.handleAI(), 1200)
        }
      })
  }


  renderActionButtons = () => {
    const { highBet, players, activePlayerIndex, phase, betInputValue } = this.state
    const min = determineMinBet(highBet, players[activePlayerIndex].chips, players[activePlayerIndex].bet)
    const max = players[activePlayerIndex].chips + players[activePlayerIndex].bet
    return ((players[activePlayerIndex].robot) || (phase === 'showdown')) ? null : (
      <React.Fragment>
        
        <button className='fold-button' onClick={() => this.handleFold()}>
          Fold
        </button>
        <button className='action-button' onClick={() => this.handleBetInputSubmit(betInputValue, min, max)}>
          {renderActionButtonText(highBet, betInputValue, players[activePlayerIndex])}
        </button>
        {/* <button className='raise-button' onClick={() => this.handleBetInputSubmit( min, max)}>
          Raise
        </button> */}

<div className="modal fade w-30 ml-50" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabindex="-1">
  <div className="modal-dialog ">
    <div className="modal-content">
    <button type="button" className="btn-close close-bg" data-bs-dismiss="modal" aria-label="Close"></button>
      {/* <div className="modal-header">
    
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div> */}
      <div className="modal-body d-flex ">
      <div className=" w-75 d-flex1">
    <a className=" drop-text mb-3" href="#">0.3</a>
    <a className=" drop-button" href="#">Max</a>
    <a className=" drop-button" href="#">Min</a>
    <a className=" drop-button" href="#">+</a>
    <a className=" drop-button" href="#">-</a>


  </div>
  <div className=" slider-boi1 w-25">
            { (!this.state.loading)  && renderActionMenu(highBet, players, activePlayerIndex, phase, this.handleBetInputChange)}
          </div>
      </div>
     
    </div>
  </div>
</div>

<button className="raise-button" data-bs-toggle="modal" href="#exampleModalToggle" role="button"> Raise</button>
  
   {/* <div className="dropdown">
  <button className="raise-button dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
   Raise
  </button>
  <ul className="dropdown-menu">
  <li><a className="dropdown-item drop-button mb-3" href="#">0.3</a></li>
    <li><a className="dropdown-item drop-button" href="#">Max</a></li>
    <li><a className="dropdown-item drop-button" href="#">Min</a></li>
    <li><a className="dropdown-item drop-button" href="#">+</a></li>
    <li><a className="dropdown-item drop-button" href="#">-</a></li>

    <div className='slider-boi'>
            { (!this.state.loading)  && renderActionMenu(highBet, players, activePlayerIndex, phase, this.handleBetInputChange)}
          </div>
  </ul>
</div> */}
     
      </React.Fragment>
      )
  }


  renderShowdown = () => {
    return(
      <div className='showdown-container--wrapper result'>
       
        <div className='result-background'>
        <h4 className='float-left result-name'>Result | Game ID:</h4>
        <span className='float-right result-bg'><span className='result-icon'>X</span></span>
        </div>
      <div className='table-data'>
   <table className='w-100'>
  <thead className='result-header'>
    <tr className="red">
      <th>Username</th>
      <th>Result</th>
      <th>Cards</th>
      <th>Score</th>
      <th>Won</th>
    </tr>
  </thead>


     

        {/* <h5 className="showdown-container--title">
          Round Complete!
        </h5> */}


        {/* <div className="showdown-container--messages">
          { renderShowdownMessages(this.state.showDownMessages)}
        </div> */}
        {/* <h5 className="showdown-container--community-card-label">
          Community Cards
        </h5> */}
        {/* <div className='showdown-container--community-cards'>
          { this.renderCommunityCards(true) }
        </div> */}

          { this.renderBestHands() }
         
          </table>
          </div> 
          <div className='bg-green w-100 footer-height'>
            <div className='result-footer'>       
             <button className="showdown--nextRound--button" onClick={() => this.handleNextRound()}> Next Round </button></div>
          </div>
      </div>
    )
    
  }

  renderGame = () => {
    const { highBet, players, activePlayerIndex, phase } = this.state;
    return (
      <div className='poker-app--background'>
        <div className="poker-table--container" style={{backgroundImage: `url("./assets/assets1/Background.png")`}} >
         <img className="poker-table-position" src={"./assets/assets1/Roof.png"} alt="Poker Table" />
         <img className="poker-table-girl-position" src={"./assets/assets1/Girl.png"} alt="Poker Table" />
        {/* table-nobg-svg-01.svg */}
        {/* pocker-img.jpg */}
          <img  className="poker-table--table-image" src={"./assets/assets1/Floor.png"} alt="Poker Table" />
          {/* <img className="poker-table-position" src={"./assets/assets1/Girl.png"} alt="Poker Table" /> */}
          <img className="poker-table-position mt-32" src={"./assets/assets1/Table.png"} alt="Poker Table" />
          { this.renderBoard() }
          <div className='community-card-container' >
            { this.renderCommunityCards() }
          </div>
          <div className='pot-container'>
            {/* <img style={{height: 55, width: 55}} src={'./assets/pot.svg'} alt="Pot Value"/> */}
            <h4> {`${this.state.pot}`} </h4>
          </div>
        
        </div>
        { (this.state.phase === 'showdown') && this.renderShowdown() } 
        <div className='game-action-bar' >
          <div className='action-buttons'>
              { this.renderActionButtons() }
          </div>
          <div className='slider-boi'>
            {/* { (!this.state.loading)  && renderActionMenu(highBet, players, activePlayerIndex, phase, this.handleBetInputChange)} */}
          </div>
        </div>
      </div>
    )
  }
  render() {
    return (
      <div className="App">
        <div className='poker-table--wrapper'> 
          { 
             (this.state.loading) ? <Spinner/> : 
            (this.state.winnerFound) ? <WinScreen /> : 
            this.renderGame()
          }
        </div>
       
      </div>
   
      
    
    );
  }
}

export default App;
