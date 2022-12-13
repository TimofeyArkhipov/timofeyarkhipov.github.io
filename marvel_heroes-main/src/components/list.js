import React from "react";
import { BrowserRouter, Switch, Route, NavLink } from "react-router-dom";
import HeroCard from "./HeroCard";


const List = ({items, loading}) =>{
    // console.log(items);

    return loading && items ? <h1>Loading</h1> :

    <div className="list">
        {
            items && items.results.map(item => (
                <HeroCard key={item.id} item={item}/>
            ))
        }
    </div>
       
}
   
export default List;
