import React, { Component } from 'react';
import './custom.css';
import { TableComponent } from './components/TableComponent';


export default class App extends Component {
  static displayName = App.name;



  render() {

    return (
      <div>
        <div className='btn-primary'>
          <a>Тестовое задание</a>
        </div>
        <div className="site-layout-content" >
          <TableComponent></TableComponent>
        </div>
      </div>

    );
  }
}
