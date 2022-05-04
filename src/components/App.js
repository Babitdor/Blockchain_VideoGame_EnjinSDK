import React, { Component } from 'react';
import Web3 from 'web3'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import brain from '../brain.png'
import CARD_ARRAY from './NFT.json'

class App extends Component {

  

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    this.setState({ cardArray: CARD_ARRAY.sort(() => 0.5 - Math.random()) })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    
    // Load smart contract
    const networkId = await web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId]
    if(networkData) {
      const abi = MemoryToken.abi
      const address = networkData.address
      const token = new web3.eth.Contract(abi, address)
      this.setState({ token })
      const totalSupply = await token.methods.totalSupply().call()
      this.setState({ totalSupply })
      
      
      // Load Tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call()
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await token.methods.tokenURI(id).call()
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }
    } else {
      alert('Smart contract not deployed to detected network.')
    }
  }

  chooseImage = (cardId) => {
    cardId = cardId.toString()
    if(this.state.cardsWon.includes(cardId)) {
      return window.location.origin + '/images/white.png'
    }
    else if(this.state.cardsChosenId.includes(cardId)) {
      return CARD_ARRAY[cardId].img
    } else {
      return window.location.origin + '/images/Blank.jpeg'
    }
  }

  flipCard = async (cardId) => {
    let alreadyChosen = this.state.cardsChosen.length
    this.setState({
      cardsChosen: [...this.state.cardsChosen, this.state.cardArray[cardId].name],
      cardsChosenId: [...this.state.cardsChosenId, cardId]
    })

    if (alreadyChosen === 1) {
      setTimeout(this.checkForMatch, 100)
    }
  }


  checkForMatch = async () => {
    const optionOneId = this.state.cardsChosenId[0]
    const optionTwoId = this.state.cardsChosenId[1]

    if(optionOneId === optionTwoId) {
      alert('You have clicked the same image!')
    } else if (this.state.cardsChosen[0] === this.state.cardsChosen[1]) {
      alert('You found a match')
      this.state.token.methods.mint(
        this.state.account,
        window.location.origin + CARD_ARRAY[optionOneId].img.toString()
      )
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.setState({
          cardsWon: [...this.state.cardsWon, optionOneId, optionTwoId],
          tokenURIs: [...this.state.tokenURIs, CARD_ARRAY[optionOneId].img]
        })
      })
    } else {
      alert('Sorry, try again')
    }
    this.setState({
      cardsChosen: [],
      cardsChosenId: []
    })
    if (this.state.cardsWon.length === CARD_ARRAY.length) {
      alert('Congratulations! You found them all!')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: []
    }
  }


  render() {

    
    return (
      
      <div className='background'>
          
          <div className='internal-container'>
          <img src={brain} width="30" height="30" className="img-logo" alt=""></img>
          &nbsp;<h3 className='title-name'>Memory Game</h3>
          </div> 
          
          <div className='account-container'>
          <h2 className="text-muted">Account Linked: {this.state.account}</h2>
         </div> 
            
            <div className='row'>
                          <div className="card-layout" >
                            { this.state.cardArray.map((card, key) => {
                              return(
                                <img alt='' key={key} src={this.chooseImage(key)} data-id={key} className="cards"
                                    onClick={(event) => {
                                    let cardId = event.target.getAttribute('data-id')
                                    if(!this.state.cardsWon.includes(cardId.toString())) {
                                      this.flipCard(cardId)}}}/>)
                            })}
                          </div>

                
                            <div className='flip-box'>
                            <div className="flip-box-inner"> 
                              <div className="flip-box-front">
                                <h5 className='tokens-text'>NFTs Collected:<span id="result">&nbsp;{this.state.tokenURIs.length}</span></h5>
                              </div>

                                <div className="flip-box-back">
                                  
                                    {this.state.tokenURIs.map((tokenURI, key) => {
                                      return(
                                    <Zoom zoomMargin={30} overlayBgColorEnd='rgba(39, 39, 39, 0.87)'>
                                      <img alt='' key={key} src={tokenURI} className="img-collect"/>
                                      </Zoom>
                                      )})}
                                  
                                </div>
                              </div> 
                            </div>




            </div>

      </div>
      
    );
  }
}

export default App;
