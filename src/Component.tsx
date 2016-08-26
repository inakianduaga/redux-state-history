import * as React from 'react';
import { connect } from 'react-redux';
import * as Actions from './Actions';
import { ITrackHistoryState } from './ITypes';
let Dropzone = require('react-dropzone');

interface IProps extends ITrackHistoryState {
  dispatch: Function;
};

function selectState(state: ITrackHistoryState) {
  return state;
};

class Component extends React.Component<IProps, any> {

  private static styles = {
    button: {
      backgroundColor: '#518D21',
      borderRadius: '3px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      fontSize: '20px',
      width: '26px',
      height: '22px',
      lineHeight: '20px',
      fontWeight: 'bold',
      padding: '0px 1px',
      boxSizing: 'content-box',
      color: 'white',
      textAlign: 'center',
      cursor: 'pointer'
    },
    disabled: {
      backgroundColor: 'rgb(102, 102, 102)',
      cursor: 'default'
    },
    input: {
      margin: '4px 0px',
      outline: 'none',
      border: 'none',
      overflow: 'hidden',
      width: '100%',
      height: '16px',
    },
    blueBg: {
      backgroundColor: 'rgb(33, 122, 141)',
    },
    clipboard: {
      backgroundColor: 'transparent',
      // color: 'rgb(33, 122, 141)',
      color: '#6FB3D2',
      borderColor: '#6FB3D2',
      borderStyle: 'dashed',
    },
    container: {
      width: '100%',
      position: 'fixed',
      bottom: 0,
      boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.3)',
      backgroundColor: '#2A2F3A',
      // maxWidth: '1000px',
      color: 'white',
      padding: '12px 12px 8px',
      left: 0,
      boxSizing: 'border-box',
      zIndex: 1000
    },
    links: {
      padding: '0px 6px'
    },
    actions: {
      fontSize: 'smaller',
      float: 'right',
      marginTop: '6px'
    },
  };

  private playback: { setTimeoutReference: number, isPlaying: boolean } = {
    setTimeoutReference: null,
    isPlaying: false,
  };

  private timeFromStart = (pos1: number) => {
    return Math.floor((this.props.stateHistory.timestamps[pos1] - this.props.stateHistory.timestamps[0 + 1]) / 1000);
  };

  private currentTime = () => this.timeFromStart(this.props.stateHistory.current);

  private totalTime = () => this.timeFromStart(this.props.stateHistory.timestamps.length - 1);

  private playUntilEnd = () => {
    if (this.props.stateHistory.current >= this.props.stateHistory.timestamps.length - 1) {
      return this.stopPlackback();
    } else {
      const nextActionInMiliseconds =
        this.props.stateHistory.timestamps[this.props.stateHistory.current + 1]
        - this.props.stateHistory.timestamps[this.props.stateHistory.current];

      // Dispatch action after gap and call self
      setTimeout(() => {
        this.props.dispatch(Actions.selectHistory(this.props.stateHistory.current + 1));
        this.playUntilEnd();
      }, nextActionInMiliseconds);
    }
  };

  private stopPlackback = () => {
    clearTimeout(this.playback.setTimeoutReference);
    this.playback.isPlaying = false;
    this.forceUpdate(); // refresh immediately to show new play button status, needed becuase we are cheating and not modifying props
  };

  private startPlayback = () => {
    this.playback.isPlaying = true;
    this.playUntilEnd();
    this.forceUpdate();
  };

  private selectHistory = (e) => {
    this.props.dispatch(Actions.selectHistory(parseInt(e.target.value, 10)));
  };

  private changeHistory = (step: number) => {
    let selected = this.props.stateHistory.current + step;

    // Upper & lower bound
    if (selected > this.props.stateHistory.history.length - 1) {
      selected = this.props.stateHistory.history.length - 1;
    } else if (selected < 1) {
      selected = 1;
    }

    this.props.dispatch(Actions.selectHistory(selected));
  };

  /**
   * Read uploaded json file and dispatch action
   */
  private uploadHistory = (files: File[]) => {
    const blob = files[0].slice(0);
    const reader = new FileReader();

    reader.onloadend = () => {
      const json = JSON.parse(reader.result);
      this.props.dispatch(Actions.uploadHistory(json));
    };
    reader.readAsText(blob);
  };

  private downloadHistory(e: any) {
    e.target.href = `data:text/json;charset=utf-8, ${encodeURIComponent(JSON.stringify(this.props.stateHistory)) }`;
  }

  public render() {
    return (
      <div style={ Component.styles.container }>
        <div>
          <div style={{ float: 'right' }}>

            <span style={ this.playback.isPlaying ? { marginRight: '10px', display: 'inline-block'} : {}}>
              { this.playback.isPlaying && `${this.currentTime()}s|${this.totalTime()}s` }
            </span>

            { this.props.stateHistory.current } / { this.props.stateHistory.history.length - 1 }
            &nbsp; &nbsp; &nbsp;
            <button onClick={ this.changeHistory.bind(this, -1)} title='Previous state' style={
              this.playback.isPlaying || this.props.stateHistory.current <= 1 ?
                Object.assign({}, Component.styles.button, Component.styles.disabled) : Component.styles.button
            }>{'<'}</button>

            &nbsp;&nbsp;

            <button onClick={ this.changeHistory.bind(this, 1) } title='Next state' style={
              this.playback.isPlaying || this.props.stateHistory.current >= this.props.stateHistory.history.length - 1 ?
                Object.assign({}, Component.styles.button, Component.styles.disabled) : Component.styles.button
            }>{'>'}</button>

            &nbsp;&nbsp;

            <button onClick={ this.playback.isPlaying ? this.stopPlackback : this.startPlayback } title='Realtime Playblack' style={
              this.props.stateHistory.current >= this.props.stateHistory.history.length - 1 ?
                Object.assign({}, Component.styles.button, Component.styles.disabled) : Component.styles.button
            }>{ this.playback.isPlaying ? '■' : '▸'}</button>

            &nbsp;&nbsp;

            <a
              href='#'
              onClick={ this.downloadHistory.bind(this) }
              download='state.json'
              title='Download state'
              style={ Object.assign({}, Component.styles.button, Component.styles.blueBg, Component.styles.links) }
              >⇓</a>

            &nbsp;&nbsp;

            <Dropzone
              multiple={false}
              title='Upload state'
              onDrop={ this.uploadHistory }
              style={ Object.assign({ float: 'right' }, Component.styles.button, Component.styles.clipboard) }>⇧</Dropzone>

          </div>

          <div style={{ width: 'auto', overflow: 'hidden', paddingRight: '19px' }}>
            <input
              type='range'
              step={1}
              min={1}
              style={ Component.styles.input }
              max={this.props.stateHistory.history.length - 1}
              value={ `${this.props.stateHistory.current}` }
              onChange={ this.selectHistory.bind(this) }
              />
          </div>

          <div style={ Component.styles.actions }>
            { this.props.stateHistory.actions[this.props.stateHistory.current] }
          </div>

        </div>

      </div>
    );
  }
}

export default connect(selectState)(Component);
