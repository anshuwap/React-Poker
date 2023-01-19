import React from 'react';
import { 
  renderUnicodeSuitSymbol 
} from '../../utils/ui';

const Card = (props) => {
  const { 
    cardData: {
      suit,
      cardFace,
      animationDelay
    },
    applyFoldedClassname
  } = props;
  return(
    <div 
      key={`${suit} ${cardFace}`} 
      className={`playing-card cardIn white-card ${(applyFoldedClassname ? ' folded' : '')}`} 
      style={{animationDelay: `${(applyFoldedClassname) ?  0 : animationDelay}ms`}}>
      <h6 className='white-card-format'
        style={{color: `${(suit === 'Diamond' || suit === 'Heart') ? 'red' : 'black'}`}}>
     {`${cardFace}`}  <span className='icon-font'>{` ${renderUnicodeSuitSymbol(suit)}`}</span>  
      </h6>
    </div>
  )
}

export default Card;