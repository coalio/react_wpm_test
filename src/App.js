import React, { Component } from 'react';

import Keybox from './components/Keybox/Keybox'

import './App.css';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { firstInput: true, wpm: 'Waiting for input...', timeSpent: 0, completed: false, lastUpdate: 0, documentInput: '' }
    this.sentence_id = 0
    this.sentences = [
      'C++ Creator said: "C makes it easy for you to shoot yourself on the foot, C++ makes it harder, but when you do, it blows your whole leg off',
      'WPM measures typing speed, you can calculate WPM by total of characters / 5 / fractional minutes, of course, mistakes do not count in total',
      'Someone: I have this issue where I do this and an error occurs; Someone else: I have this issue too, can someone bump this thread?; Nvm fixed! -- thread closed --'
    ]
    const sortSentence = () => {
      this.sentence_id = RandomInt(0, this.sentences.length - 1)
      this.stringArray = []
      for (var i = 0; i < this.sentences[this.sentence_id].length; i++) {
        this.stringArray = [...this.stringArray, this.sentences[this.sentence_id].charAt(i)]
      }
    }
    sortSentence()

    this.startTimer = this.startTimer.bind(this)
    this.checkErrors = this.checkErrors.bind(this)
  }

  startTimer() {
    this.timer = setInterval(() => this.setState({
      ...this.state,
      timeSpent: this.state.timeSpent + 1
    }), 1000)
  }

  stopTimer() {
    clearInterval(this.timer)
  }

  onKeyPressed = (e) => {
    if (this.state.completed) { return }
    let key = e.key

    if (key === 'Backspace') {
      this.setState({ ...this.state, documentInput: this.state.documentInput.substring(0, this.state.documentInput.length - 1) })
    }
    else if (key.length === 1 && this.state.documentInput.length <= this.sentences[this.sentence_id].length) {

      this.setState({ ...this.state, documentInput: this.state.documentInput + key })
      let fractmins = this.state.timeSpent
      if (fractmins === 0) {
        fractmins = 1
      }
      fractmins = fractmins / 60
      let mistakes = this.checkErrors()
      let currentWpm = Math.ceil(((this.state.documentInput.length / 5) - mistakes) / fractmins)
      if (currentWpm > 0) {
        if (this.state.timeSpent > this.state.lastUpdate) {
          this.setState({ ...this.state, wpm: currentWpm })
          this.setState({ ...this.state, lastUpdate: this.state.timeSpent })
        }
      } else {
        this.setState({ ...this.state, wpm: 'Adjusting' })
      }

      if (this.state.documentInput.length >= this.sentences[this.sentence_id].length) {
        this.stopTimer()
        this.setState({ ...this.state, completed: true })
      }
      if (this.state.firstInput === true) {
        this.setState({ ...this.state, firstInput: false })
        this.startTimer()
      }
    }
  }

  checkErrors = () => {
    let errors = 0
    for (var i = 0; i <= this.state.documentInput.length; i++) {
      if (this.state.documentInput.charAt(i) !== this.sentences[this.sentence_id].charAt(i)) {
        errors++;
      }
    }
    console.log(errors)
    return errors
  }

  componentWillMount() {
    document.addEventListener("keydown", this.onKeyPressed.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyPressed.bind(this));
  }

  render() {
    return (
      <div>
        <h2>Sentence: {this.sentence_id}</h2>
        {this.state.completed === false ?

          <div>
            <div className="display_box" onKeyDown>
              {this.stringArray.map((char, index) => {
                var classify = ''
                if (this.state.documentInput.charAt(index) === this.sentences[this.sentence_id].charAt(index)) {
                  classify = 2
                } else if (this.state.documentInput.charAt(index) === '') {
                  classify = 0
                } else if (this.state.documentInput.charAt(index) !== this.sentences[this.sentence_id].charAt(index)) {
                  classify = 1
                }
                if (index > this.state.documentInput.length - 5 && index < this.state.documentInput.length + 25) {
                  return (<Keybox classify={classify}>{char}</Keybox>)
                } else {
                  return null
                }
              })}
            </div>
            <h4>WPM: {this.state.wpm}</h4>
            <h4>Time: {this.state.timeSpent}</h4>
          </div> :
          <div>
            <h1>Test finished</h1>
            <h2>WPM: {this.state.wpm}</h2>
            <h2>Time: {this.state.timeSpent}</h2>
          </div>
        }


      </div>
    );
  }
}

function RandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default App
