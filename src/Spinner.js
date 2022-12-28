import React from 'react';

const Spinner = props => {
	return(
		<div className="loading-container">
			<div className='spinner-container' >
			<img src={"./assets/assets1/Splashscreen.png"} alt="Loading..."/>
				{/* <img src={'/assets/chip.svg'} alt="Loading..."/> */}
			</div>
		</div>
	)
}

export default Spinner