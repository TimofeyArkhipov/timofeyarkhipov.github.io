import React, {useState} from "react";
import {Select, Typography, Row, Col, Avatar, Card} from 'antd';
import { useGetCryptoNewsQuery } from "../serveces/cryptoNewsApi";
import { useGetCryptosQuery } from "../serveces/cryptoAPI";
import moment from "moment";
import { Provider } from "react-redux";
import Operation from "antd/lib/transfer/operation";

const {Text, Title} = Typography;
const {Option} = Select;

const News = ({simplified}) =>{
   const [newsCategory, setNewsCategory] = useState('Cryptocurrecy');
   const {data: cryptoNews } = useGetCryptoNewsQuery({newsCategory, count: simplified ? 6 : 12});
   const {data} = useGetCryptosQuery(100);
   const demoImg = 'https://www.bing.com/th?id=OVFT.mpzuVZnv8dwIMRfQGPbOPC&pid=News';

  
   if(!cryptoNews) return 'Loading...';


    return(
        <Row gutter={[24, 24]}>

            {!simplified && (
                <Col span={24}>
                    <Select showSearch 
                            className="select-news" 
                            placeholder='select crypo' 
                            optionFilterProp="children"
                            onChange={(value)=> setNewsCategory(value)}
                            filterOption={(input, option)=> option.children.toLowerCase().indexOf(input.toLowerCase() >=0 )}
                    >
                        <Option value='Cryptocurrency'> Cryptocyrrency </Option>
                        {data?.data?.coins.map((coin)=><Option value={coin.name}>{coin.name}</Option> )}
                    </Select>
                    
                </Col>
            )}

           {cryptoNews.value.map((news, index)=>(
            <Col sx={24} sm={12} lg={8} key={index}>
                <Card hoverable className='news-card'>
                    <a href={news.url} target='_blank' rel='noreferrer'>
                        <div className="news-image-container">
                            <Title className="news-title" level={4}>{news.name}</Title>
                            <img  setyle={{maxWidth: '200px', maxHeight: '100px'}} src={news?.image?.thumbnail?.contentUrl || demoImg} alt='news'/>
                        </div>
                        <p>
                            {news.description > 100 ? `${news.description.subsctring(0, 100)} ...` : news.description}
                        </p>
                        <div className="provider-container">
                            <div>
                                <Avatar src={news.provider[0]?.image?.thumbnail?.contentUrl || demoImg} alt='news'/>
                                <Text className="provider-name">{news.provider[0]?.name}</Text>
                            </div>
                            <Text>{moment(news.datePublished).startOf('ss').fromNow()}</Text>
                        </div>
                    </a>
                </Card>
            </Col>
           ))}
        </Row>
    )
}

export default News;