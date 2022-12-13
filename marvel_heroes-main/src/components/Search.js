import React, {useState} from "react"

const Search = ({search}) => {

    let [text, setText] = useState('');

    let onSearch = (value) =>{
        setText(value);
        search(value);
    }

    return (
        <>
            <div className="search-block">
                <input 
                type='text' 
                className="search-block__input" 
                onChange={(e)=>onSearch(e.target.value)} 
                value={text} 
                placeholder="Find you hero"/>
            </div>
        </>
    )
  
}

export default Search;
