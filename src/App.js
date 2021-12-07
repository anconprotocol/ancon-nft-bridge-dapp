import React, { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './views/footer/footer'
import './App.css';
import Header from './views/header/header';
import Transfer from './views/transfer/transfer'
import Products from './views/products/products'
import Create from './views/create/create'


function App() {



  return (
    <div className="App">
      <Header></Header>
      <body className="App-body">
        <BrowserRouter>
          <Routes>
            <Route 
              exact
              path="/"
              name="Home"
              element={<Products/>}
            />
            <Route 
              exact
              path="/Transfer"
              name="Transfer"
              element={<Transfer/>}
            />
            <Route 
              exact
              path="/Create"
              name="Create"
              element={<Create/>}
            />
            
          </Routes>
        </BrowserRouter>
      </body>
      
      <Footer></Footer>
    </div>

  );
}

export default App;
