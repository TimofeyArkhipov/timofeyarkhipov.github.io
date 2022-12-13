import '../App.css';
import Header from '../components/Header';
import React, {useState, useEffect} from 'react';
import { BrowserRouter, Switch, Route, NavLink } from "react-router-dom";

import List from '../components/list';
import Search from '../components/Search';
import  '../app.scss';


const hash = '56fe2f5572d1eea0e787de8489daa269';


function Main(){
  const [searchElem, setSearchElem] = useState('');
 
  let [mainData, setMainData] = useState([]);
  let [isFething, setFething] = useState(true);

  let url = !searchElem ? `http://gateway.marvel.com/v1/public/characters?ts=1&apikey=a485caeb6e61554b91de33767b7c697e&hash=${hash}` :
                          `http://gateway.marvel.com/v1/public/characters?nameStartsWith=${searchElem}&ts=1&apikey=a485caeb6e61554b91de33767b7c697e&hash=${hash}`;

  useEffect(() => {
      fetch(url)
          .then(response => response.json())
          .then(data => {
              setMainData(data.data);
            //   console.log(data)
              setFething(false)
          })
          .catch("some error");
  }, [searchElem]);


  return (
    <div className='wrapper'>
      <Header/>
      <Search search={(elem)=>setSearchElem(elem)}/>
      <List items={mainData} loading={isFething}/>
    </div>
     
  );
}

export default Main;
