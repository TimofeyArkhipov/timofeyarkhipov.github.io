import './App.css';
import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import Main from './components/Main';
import  './app.scss';


function App(){
 
  return (
    <Router>
      <Main/>
    </Router>
  );
}

export default App;
