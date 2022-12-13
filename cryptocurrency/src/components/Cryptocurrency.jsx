import React, { useEffect, useState } from "react";
import millify from "millify";
import { Link } from "react-router-dom";
import {Card, Row, Col, Input} from 'antd';
import { useGetCryptosQuery } from "../serveces/cryptoAPI";

const Cryptocurrency = ({ simplified }) =>{
    const count = simplified ? 10 : 100;
    const {data: cryptoList, isFetching} = useGetCryptosQuery(count);
    const [cryptos, setCryptos] = useState([]);
    const [searchItem, setSearchItem] = useState('');


    useEffect(()=>{
        const fileredData = cryptoList?.data?.coins.filter((coin) => coin.name.toLowerCase().includes(searchItem.toLowerCase()) );

        setCryptos(fileredData);

    }, [cryptoList, searchItem]);


    if(isFetching) return 'Loading...'

    return(
        <>
            <div className="search-crypto">
                <Input onChange={(e)=>setSearchItem(e.target.value)} placeholder='Search crypto'/>
            </div>
            <Row gutter={[32, 32]} className='crypto-card-container'>
                {
                    cryptos?.map((item)=>(
                        <Col sx={24} sm={12} lg={6} className='crypto-card' key={item.uuid}>
                            <Link to={`/crypto/${item.uuid}`}>
                                <Card 
                                    title={`${item.rank}. ${item.name}`}
                                    extra = {<img className="crypto-image" src={item.iconUrl}/>}
                                    hoverable
                                >
                                    <p>Price: {millify(item.price)}</p>
                                    <p>Market Cap: {millify(item.marketCap)}</p>
                                    <p>Dialy Change: {millify(item.change)}</p>
                                </Card>
                            </Link>
                        </Col>
                    ))
                }

            </Row>
        </>
    )
}

export default Cryptocurrency;