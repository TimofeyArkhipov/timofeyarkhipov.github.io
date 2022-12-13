import React from 'react'
import { Line } from 'react-chartjs-2'
import {Col, Row, Typography,} from 'antd';

import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale,  CategoryScale)




const LineChart = ({coinHistory, currentPrice, coinName}) => {
  // console.log(coinHistory, currentPrice, coinName);
  
  const coinPrice = [];
  const timeStamp = [];

  for(let i=0; i<coinHistory?.data?.history?.length; i+=1){
    timeStamp.push( new Date(coinHistory.data.history[i].timestamp * 1000).toLocaleDateString())
  }
 
  for(let i=0; i<coinHistory?.data?.history?.length; i+=1){
    coinPrice.push(coinHistory.data.history[i].price)
  }

  const data = {
    labels : timeStamp,
    datasets: [
      {
        label: 'Price in USD',
        data: coinPrice,
        fill: false,
        backgroundColor: "#0071bd", 
        borderColor: '#0071bd',
      },
    ],
  };

  const options = {
    scales: {
      yAxes: 
        {
          ticks: {
            beginAtZero: true,
          },
        },
    
    },
  };

  

  return (
   <>
      <Row className='chart-header'>
        <Typography.Title level={2} className='chart-title'>{coinName} chart price</Typography.Title>
        <Col>
          <Typography.Title level={5} className='price-change'>{coinHistory?.data?.change}%</Typography.Title>
          <Typography.Title level={5} className='current-price'>{currentPrice}$</Typography.Title>
        </Col>
      </Row>
      <Line data={data} options={options}/>
   </>
  )
}

export default LineChart