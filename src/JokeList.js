import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";
import { ClipLoader } from 'react-spinners';

class JokeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: []
    }
  }

  getJokes = async () => {
    let j = [...this.state.jokes];
    let seenJokes = new Set();

    try {
      while (j.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { status, ...jokeObj } = res.data;

        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          j.push({ ...jokeObj, votes: 0 });
        } else {
          console.error("duplicate found!");
        }
      }
      this.setState({ jokes: j });
    } catch (e) {
      console.log(e);
    }

  }

  componentDidMount = () => {
    if (this.state.jokes.length === 0) this.getJokes();
  }

  componentDidUpdate = (prevProps) => {
    if (this.state.jokes.length === 0 ||
      prevProps.numJokesToGet !== this.props.numJokesToGet) {
      this.getJokes();
    }
  }

  generateNewJokes = () => {
    this.setState({ jokes: [] });
  }

  vote = (id, delta) => {
    this.setState(allJokes => ({
      jokes: allJokes.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j))
    }));
  }

  render = () => {
    if (this.state.jokes.length) {
      let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);

      return (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={this.generateNewJokes}>
            Get New Jokes
          </button>

          {sortedJokes.map(j => (
            <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />
          ))}
        </div>
      );
    }
    return (
      <div className="sweet-loading">
        <ClipLoader
          size={150}
          color={"#123abc"}
          loading={this.state.loading}
        />
      </div>
    );
  }
}

JokeList.defaultProps = {
  numJokesToGet: 10
};

export default JokeList;
