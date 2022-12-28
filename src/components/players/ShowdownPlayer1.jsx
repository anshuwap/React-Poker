import React from 'react';

import Card from '../cards/Card';

const renderCards = (cards) => {
  return cards.map((card, index) => {
    const cardData = {...card, animationDelay: 0}
    return <Card key={index} cardData={cardData} />
  })
}
const ShowdownPlayer1 = (props) => {
  const {
    name,
    avatarURL,
    cards
  } = props;
  return (

    <div className="player-entity--container1">

      <div className='color-black'>   
    <span className='play-name'>{`${name}`} </span>   <img 
            className="player-avatar--image result-img" 
            src={avatarURL}  
            alt="Player Avatar"
        />
        </div>
    
   

    
    </div>
  )
}

export default ShowdownPlayer1;