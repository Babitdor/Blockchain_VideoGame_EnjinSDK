import React, { Component } from 'react';
import Web3 from 'web3'
import 'react-medium-image-zoom/dist/styles.css'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import CARD_ARRAY from './NFT.json'
import Navbar from './Navbar';
import Loading from './Loading';

class App extends Component {

  

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }


  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts'});
    }
    else if (window.web3) {
      window.web3 = new Web3(window.ethereum.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    const balances = await web3.eth.getBalance(accounts[0])/Math.pow(10,18)
    this.setState({ balance: balances })
    this.setState({ account: accounts[0] })
    this.setState({ cardArray: CARD_ARRAY.sort(() => 0.5 - Math.random()) })

    
    // Load smart contract
    const networkData = MemoryToken.networks[await web3.eth.net.getId()]
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
        const tokensIDs = tokenURI.substring(21, tokenURI.length)
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokensIDs]
        })
      }
      this.setState({ loading: false})
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
      balance: '',
      loading: true,
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
      
      <div className='App'>
          { this.state.loading ? <Loading componentWillMount={this.componentWillMount}/> :
          
          <div className='main-container'>
            <div></div>
              <Navbar accounts={this.state.account} tokens={this.state.tokenURIs} balances={this.state.balance}/>
              <div className='row'>
                <div className="card-layout" >
                  { this.state.cardArray.map((card, key) => {
                    return(
                      <img alt='' key={key} src={this.chooseImage(key)} data-id={key} className="cards"
                          onClick={(event) => {
                          let cardId = event.target.getAttribute('data-id')
                          if(!this.state.cardsWon.includes(cardId.toString())) {
                            this.flipCard(cardId)}}}/>)})}
                  </div>
              </div>
          </div>}
      </div>
      
    );
  }
}

export default App;
