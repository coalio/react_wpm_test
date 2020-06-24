import React, { Component } from 'react';
import data from './data/quotes.json'

import DisplayBox from './components/DisplayBox/DisplayBox';

import './Styles.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sentences: data,
      firstInput: true,
      onQuote: false,
      completed: false,
      timeSpent: 0,
      lastUpdate: 0,
      wpm: 'Waiting for input...',
      accuracy: '100 %',
      rawMistakes: 0,
      rawCorrect: 0,
      documentInput: '',
      documentSelected: true,
      completeInput: '',
      idInput: 0,
      sentenceInput: ''
    }
    this.sentence_id = 0
    this.startTimer = this.startTimer.bind(this)
    this.checkErrors = this.checkErrors.bind(this)
    this.formatErrors = this.formatErrors.bind(this)
    this.restartTest = this.startTest.bind(this)

    this.sentence_id = RandomInt(1, this.state.sentences.length - 1)
    this.state.idInput = this.sentence_id // not initialized yet so modifying state directly is allowed
    this.stringArray = []
    for (var i = 0; i < this.state.sentences[this.sentence_id].text.length; i++) {
      this.stringArray = [...this.stringArray, this.state.sentences[this.sentence_id].text.charAt(i)]
    }

    // workaround that bind

    // this convention should not be taken in former projects
    // instead, have a workflow diagram to know which props
    // should children components of main app receive

    this.that = this
  }

  // startTimer() => Specifies an interval, function that will execute every arg[2] milliseconds
  startTimer() {
    this.timer = setInterval(() => this.setState({
      ...this.state,
      timeSpent: this.state.timeSpent + 1
    }), 1000)
  }

  // stopTimer() => Clears the current timer interval
  stopTimer() {
    clearInterval(this.timer)
  }

  // startTest() => Sets relevant state to default values, maps another sentence and starts a new test
  startTest(e) {
    if (typeof (e) == 'number') {
      this.sentence_id = e > 0 ? e : 1
    } else {
      this.sentence_id = RandomInt(1, this.state.sentences.length - 1)
    }

    this.stringArray = []
    for (var i = 0; i < this.state.sentences[this.sentence_id].text.length; i++) {
      this.stringArray = [...this.stringArray, this.state.sentences[this.sentence_id].text.charAt(i)]
    }
    this.stopTimer()
    this.setState({ ...this.state, firstInput: true, completed: false, wpm: 'Waiting for input...', timeSpent: 0, lastUpdate: 0, documentInput: '', completeInput: '', idInput: this.sentence_id, rawCorrect: 0, rawMistakes: 0, accuracy: ' 100 %' })
  }

  // onKeyPressed => Handles keypress events, this takes care of
  // 1. WPM measure (updates every second)
  // 2. Accuracy measure (percentage of total correct keypresses / total keypresses) * 100
  // 3. Input classification and conventions (parse input if dead key was a single quote)
  onKeyPressed = (e) => {
    console.log(e)
    if (this.state.completed || this.state.documentSelected !== true) { return }
    let key = e.key
    if (e.code === 'Quote' && e.key === 'Dead') {
      this.setState({ ...this.state, onQuote: true })
    }
    if (key === 'Backspace') {
      this.setState({ ...this.state, documentInput: this.state.documentInput.substring(0, this.state.documentInput.length - 1) })
    }
    else if (key.length === 1 && this.state.documentInput.length <= this.state.sentences[this.sentence_id].text.length) {
      if (this.state.onQuote === true && key !== '"') {
        key = "'" + key
        this.setState({ ...this.state, onQuote: false })
      }
      if (this.state.sentences[this.sentence_id].text.substring(this.state.documentInput.length, this.state.documentInput.length + key.length) !== key) {
        console.log(this.state.rawMistakes)
        console.log(this.state.sentences[this.sentence_id].text.substring(this.state.documentInput.length, this.state.documentInput.length + key.length))
        this.setState({ ...this.state, rawMistakes: this.state.rawMistakes + key.length})
      } else {
        this.setState({ ...this.state, rawCorrect: this.state.rawCorrect + key.length})
      }
      this.setState({ ...this.state, documentInput: this.state.documentInput + key, completeInput: this.state.completeInput + key })
      let fractmins = this.state.timeSpent
      if (fractmins === 0) {
        fractmins = 1
      }
      fractmins = fractmins / 60
      let mistakes = this.checkErrors()
      let correct = this.state.documentInput.length - this.checkErrors()
      let currentWpm = Math.ceil((((this.state.documentInput.length - mistakes) / 5) / fractmins))
      let currentAccuracy = Math.floor(this.state.rawCorrect/this.state.completeInput.length*100);
      if (typeof(currentAccuracy) !== 'number') {
        currentAccuracy = 0
      }
      if (currentWpm > 0) {
        if (this.state.timeSpent > this.state.lastUpdate) {
          if (correct < 5) {
            this.setState({ ...this.state, wpm: 0 })
          } else {
            this.setState({ ...this.state, wpm: currentWpm, accuracy: currentAccuracy + ' %' })
          }
          this.setState({ ...this.state, lastUpdate: this.state.timeSpent })
        }
      } else {
        this.setState({ ...this.state, wpm: 'Adjusting'})
      }
      if (this.state.documentInput.length >= this.state.sentences[this.sentence_id].text.length) {
        this.stopTimer()
        if (this.state.timeSpent < 1) {
          this.setState({ ...this.state, timeSpent: 0.5, wpm: Math.ceil((((this.state.documentInput.length - this.checkErrors()) / 5) / (this.state.timeSpent / 60)))})
        }
        this.setState({ ...this.state, completed: true })
      }
      if (this.state.firstInput === true) {
        this.setState({ ...this.state, firstInput: false })
        this.startTimer()
      }
    }
  }

  // checkErrors() => Returns the amount of uncorrected mistakes at the moment
  checkErrors() {
    let errors = 0
      for (var i = 0; i <= this.state.documentInput.length; i++) {
        if (this.state.documentInput.charAt(i) !== this.state.sentences[this.sentence_id].text.charAt(i)) {
          errors++;
        }
      }
    return errors
  }

  formatErrors() {
    let format = <h3 style={{ marginLeft: '20px', marginRight: '20px' }}>“{this.stringArray.map((char, i) => {
      if (char !== this.state.documentInput.charAt(i)) {
        return <span className="markincorrect">{char}</span>
      } else {
        return <span className="markcorrect">{char}</span>
      }
    })}”</h3>

    return format
  }

  // React lifecycle

  componentDidMount() {
    // bind a listener for keydown events
    document.addEventListener("keydown", this.onKeyPressed.bind(this));
  }

  componentWillUnmount() {
    // bind'nt
    document.removeEventListener("keydown", this.onKeyPressed.bind(this));
  }

  render() {
    return (
      <div>
        {this.state.completed === false ?
          <div>

            <div>
              <h6>Sentences: {this.state.sentences.length - 1}</h6>
              <span>ID: </span>
              <input
                type='number'
                min="0"
                onFocus={() => { this.setState({ ...this.state, documentSelected: false }) }}
                onChange={(e) => { this.setState({ ...this.state, idInput: Number(e.target.value) }) }} />
              <button 
                onFocus={() => { this.setState({ ...this.state, documentSelected: false }) }} 
                className="fluid-button" 
                onClick={() => {
                  if (Number(this.state.idInput) <= this.state.sentences.length - 1) {
                    this.startTest(this.state.idInput)
                  } else {
                    this.setState({ ...this.state, idInput: this.state.sentences.length - 1 })
                  }
                }}>Go</button>
            </div>

            <DisplayBox instanceBind={this.that}></DisplayBox>

            <h4>WPM: {this.state.wpm}</h4>
            <h4>Accuracy: {this.state.accuracy}</h4>
            <h4>Time: {this.state.timeSpent}</h4>
          </div> :

          <div>
            <h1>Test finished</h1>
            <div>
              <h2 style={{ display: 'inline-block', margin: '0 10px' }}>Net WPM: {this.state.wpm !== 'Adjusting' && this.state.wpm !== 0 ? Math.ceil((((this.state.documentInput.length - this.checkErrors()) / 5) / (this.state.timeSpent / 60))) : '0'}</h2>
              <h2 style={{ display: 'inline-block', margin: '0 10px' }}>Gross WPM: {Math.ceil((((this.state.completeInput.length) / 5) / (this.state.timeSpent / 60)))}</h2>
              <h2 style={{ display: 'inline-block', margin: '0 10px' }}>Accuracy: {Math.floor(this.state.rawCorrect/this.state.completeInput.length*100)}</h2>
            </div>
            <div>
              <h2 style={{ display: 'inline-block', margin: '0 10px' }}>Uncorrected Mistakes: {this.checkErrors()}</h2>
              <h2 style={{ display: 'inline-block', margin: '0 10px' }}>Total Mistakes: {this.state.rawMistakes}</h2>
              <h2 style={{ display: 'inline-block', margin: '0 10px' }}>Correct Keypresses: {this.state.rawCorrect}</h2>
            </div>
            <h2 style={{ display: 'inline-block', margin: '0 10px' }}>Time: {this.state.timeSpent}</h2>
            {this.formatErrors()}
            <h4><em>— {this.state.sentences[this.sentence_id].author}</em></h4>
            <button className='common-button' onClick={() => { this.startTest(this.sentence_id) }}>Take this same test! (ID: {this.sentence_id})</button>
            <button className='common-button' onClick={() => { this.startTest() }}>Take another test!</button>
          </div>
        }
        <h9>Made with very very love by coal (<a href="https://github.com/coalio/">@coalio</a>)</h9>
      </div>
    );
  }
}

function RandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default App
