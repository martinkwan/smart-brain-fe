import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import './App.css';
import Particles from 'react-particles-js';

const particlesOptions = {
  particles: {
    color: '#2f54ac',
      number: {
        value: 100,
      },
    density: {
      enable: true,
      value_area: 80,
    }
  },
};

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = ({id, name, email, entries, joined}) => {
    this.setState({user: {
        id,
        name,
        email,
        entries,
        joined,
    }})
  }

  calculateFaceLocation = (data) => {
    console.log(data.outputs[0].data.regions[0].region_info.bounding_box)
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;

    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value })
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input});

      fetch('https://serene-dawn-01190.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input,
        })
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://serene-dawn-01190.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id,
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState({
                user: {...this.state.user, entries: count},
              });
            })
            .catch(console.log);
        }
        this.displayFaceBox(this.calculateFaceLocation(response));
      }).catch(console.log)
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }


  render() {
    const { isSignedIn, imageUrl, route, box, user } = this.state;
    console.log(this.state, 'this.state')

    return (
      <div className="App">
        <Particles
          className='particles' 
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {route === 'home'
        ? ( <div> 
          <Logo/>
        <Rank name={user.name} entries={user.entries} />
        <ImageLinkForm
          onInputChange={this.onInputChange}
          onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition box={box} imageUrl={imageUrl} />
      </div>)
        : (
          route === 'signin' 
        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        }

      }
      </div>
    )
  }
}

export default App;
