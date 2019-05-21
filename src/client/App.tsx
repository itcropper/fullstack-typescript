
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { getVersion } from '../shared/utils';
import { About } from './components/About';
import SenateVoting from "./components/SenateVoting";
// Pages
import { Header } from './components/Header';
import { Home } from './components/Home';
import { UsersList } from './components/UsersList';
import Import from './components/Import';
import "./App.css";

console.log(`The App version is ${getVersion()}`);

const AppImpl = () => (
  <BrowserRouter>
    <div>
        <Header />
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/data' component={SenateVoting} />
          <Route path='/about' component={Import} />
          <Route path='/users-list' component={UsersList} />
        </Switch>
    </div>
  </BrowserRouter>
);

export const App = hot(module)(AppImpl);
