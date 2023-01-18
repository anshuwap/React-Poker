import React from 'react';

const HiddenCard = (props) => {
  const { 
    cardData: {
      suit,
      cardFace,
      animationDelay
    },
    applyFoldedClassname
  } = props;
  return(
    // <img  key={`${suit} ${cardFace}`} 
    // className={` winner-img playing-card1 cardIn robotcard1${(applyFoldedClassname ? ' folded' : '')}`} 
    // style={{animationDelay: `${(applyFoldedClassname) ?  0 : animationDelay}ms`}}>
    //     src={"./assets/assets1/cards.jpg"} alt="winner" />
     <div 
      key={`${suit} ${cardFace}`} 
      className={`playing-card cardIn robotcard1${(applyFoldedClassname ? ' folded' : '')}`} 
      style={{animationDelay: `${(applyFoldedClassname) ?  0 : animationDelay}ms`}}>
      <img 
        src={"./assets/assets1/cards.jpg"} alt="Hidden card" />
    </div>
  )
}

export default HiddenCard;