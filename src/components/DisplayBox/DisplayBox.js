import React from 'react' 
import Keybox from '../Keybox/Keybox'
import './DisplayBox.css'

const DisplayBox = props => {
  let that = props.instanceBind
  let displayClass = ''
  if (!that.state.documentSelected) {
    displayClass = 'inactive'
  }
  return (
    <div className={"display_box " + displayClass} onClick={() => {that.setState({...that.state, documentSelected: true})}}>
      {that.stringArray.map((char, index) => {
        var classify = ''
        if (that.state.documentInput.charAt(index) === that.state.sentences[that.sentence_id].text.charAt(index)) {
          classify = 2
        } else if (that.state.documentInput.charAt(index) === '') {
          classify = 0
        } else if (that.state.documentInput.charAt(index) !== that.state.sentences[that.sentence_id].text.charAt(index)) {
          classify = 1
        }
        if (index > that.state.documentInput.length - 5 && index < that.state.documentInput.length + 25) {
          return <Keybox classify={classify}>{char}</Keybox>
        }
        return null
      })}
      {
        that.state.documentInput.length < that.state.sentences[that.sentence_id].text.length - 25 ?
          <Keybox classify={0}>...</Keybox> : null
      }
    </div>
  )
}

export default DisplayBox