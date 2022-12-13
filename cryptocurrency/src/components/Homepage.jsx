import React from "react";
import millify from "millify";
import {Typography, Row, Col, Statistic} from 'antd';
import {Link} from 'react-router-dom';
import { useGetCryptosQuery } from "../serveces/cryptoAPI";
import Cryptocurrency from "./Cryptocurrency";
import News from "./News";

const { Title } = Typography;

const Homepage = () =>{
    const {data, isFetching} = useGetCryptosQuery(10);
    const globalStats = data?.data?.stats;

    console.log(data)
    if(isFetching) return 'Loading...';

    return(
        <>
            <Title level={2} className='heading'> Global crypto stats</Title>
            <Row>
                <Col span={12}><Statistic title='Cryptocurrency' value={globalStats.total}/> </Col>
                <Col span={12}><Statistic title='Exchanges' value={millify(globalStats.totalExchanges)}/> </Col>
                <Col span={12}><Statistic title='Market cap' value={millify(globalStats.totalMarketCap)}/> </Col>
                <Col span={12}><Statistic title='24h volume' value={millify(globalStats.total24hVolume)}/> </Col>
                <Col span={12}><Statistic title='Markets' value={millify(globalStats.totalMarkets)}/> </Col>
            </Row>
            <div className="home-heading-container">
                <Title level={2} className='home-title'>Top 10 Cryptocurrencies in the world</Title>
                <Title level={3} className='show-more'><Link to='/cryptocurrency'>Show more</Link></Title>
            </div>
            <Cryptocurrency simplified/>
            <div className="home-heading-container">
                <Title level={2} className='home-title'>Lstet news</Title>
                <Title level={3} className='show-more'><Link to='/nrws'>Show more</Link></Title>
            </div>
            <News simplified/>
        </>

    )
}

export default Homepage;