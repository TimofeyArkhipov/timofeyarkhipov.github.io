import React from "react";
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import { Layout, Typography, Space } from "antd";

import {Navbar, Exchanges, Homepage, Cryptocurrency, News, CryptoDetails} from "./components";
import './App.css';
import 'antd/dist/antd.css';
const App = () => {
    return (
        <div className="app">
           <div className="navbar">
                <Navbar/>
           </div>
           <div className="main">
                <Layout>
                        <div className="routes">
                            <Routes>
                                <Route exact path="/" element={<Homepage/>}/>
                                <Route exact path="/exchanges" element={<Exchanges/>}/>
                                <Route exact path="/cryptocurrency" element={<Cryptocurrency/>}/>
                                <Route exact path="/crypto/:coinId" element={<CryptoDetails/>}/>
                                <Route exact path="/news" element={<News/>}/>
                            </Routes>
                        </div>
                </Layout>

                <div className="footer">
                    <Typography.Title level={5} style={{color: 'white', textAlign:'center'}}>
                        Cryptovers
                        <br/>
                        All right reserved
                    </Typography.Title>
                    <Space>
                        <Link to='/'>Home</Link>
                        <Link to='/exchanges'>Exchanges</Link>
                        <Link to='/news'>News</Link>
                    </Space>
                </div>
           </div>
        </div>
    )
}

export default App;