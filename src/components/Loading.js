import './Loading.css'
import React from 'react'
import brain from '../assets/brain.png'
import meta from '../assets/meta.png'
function Loading() {
  return (
    <div className='container'>
        <div className='card'>
            <div>
            <div className='img-container'><img src={brain} className="img-logo-brain" alt=""/></div>
            <div><h3 className='title'>Memory Game</h3></div>
            </div>

            <div>
            
            <img src={meta} className="img-logo-meta" alt=""/>
            <h5 className='title-link'>Link your Metamask wallet</h5>
            {/* <div className='btn-container'><button className='btn'>Play</button></div> */}
            </div>

        </div>
        
    </div>
  )
}

export default Loading