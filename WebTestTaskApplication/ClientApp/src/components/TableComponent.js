import React, { Component } from 'react';
import { Table, Button, Popconfirm, Select, Input, Typography, Modal } from 'antd';
import '../custom.css';
import { stringify } from 'ajv';
import { and } from 'ajv/dist/compile/codegen';


export class TableComponent extends Component {

  constructor(props) {
    super(props);
    this.handleRowDelete = this.handleRowDelete.bind(this)
    this.handleRowAdding = this.handleRowAdding.bind(this)
    this.handleTool = this.handleTool.bind(this)
    this.handleUser = this.handleUser.bind(this)
    this.handleCountPerUser = this.handleCountPerUser.bind(this)
    this.isAdding = this.isAdding.bind(this)
    this.showModal = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.handleDeletedCount = this.handleDeletedCount.bind(this)
    this.save = this.save.bind(this)
    this.cancel = this.cancel.bind(this)
    this.state = {
      tableData: [], users: [], tools: [], loading: true,
      rowdeleted: false, rowdelId: -1, rowdelMaxCount: -1, rowdelCurCount: -1, rowdelUserName: '', rowdelToolName: '',
      visible: false, modalState: '', rowaddId: -1, addedrow:
      {
        id: 0,
        toolID: 0,
        userID: 0,
        countPerUser: 0
      }
    };

  }

  componentDidMount() {
    this.populateWeatherData();
  }


  showModal(record) {
    this.setState({
      visible: true, modalState: '', rowdelId: record.id, rowdelMaxCount: record.countPerUser,
      rowdelCurCount: record.countPerUser, rowdelToolName: record.toolName, rowdelUserName: record.userName
    })
  }


  closeModal() {
    this.setState({ visible: false, rowdelId: -1, rowdelMaxCount: -1, rowdelCurCount: -1 })
  }

  handleRowDelete() {
    console.log('cur: ' + this.state.rowdelCurCount)
    if (this.state.rowdelCurCount > 0) {
      let remainCount = this.state.rowdelMaxCount - this.state.rowdelCurCount
      console.log('trying delete element by id: ' + this.state.rowdelId);
      const deletedRow = {
        id: this.state.rowdelId,
        toolID: 0,
        userID: 0,
        countPerUser: remainCount
      }
      let newData = structuredClone(this.state.tableData)

      if (this.state.rowdelCurCount == this.state.rowdelMaxCount) {
        fetch('table/' + this.state.rowdelId, { method: 'DELETE' })
        newData = newData.filter(x => x.id != this.state.rowdelId)
      }
      else {

        fetch('/table', {
          method: 'PUT',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(deletedRow)
        })
        let changedRecord = newData.find(x => x.id == this.state.rowdelId)
        changedRecord.countPerUser = remainCount
        let index = newData.findIndex(x => x.id == this.state.rowdelId)
        newData[index] = changedRecord
      }
      this.setState({ tableData: newData, visible: false })
      this.populateWeatherData()
    }

  }

  handleRowAdding() {
    if (this.state.rowaddId == -1) {

      console.log('adding')
      let newData = []
      let newId = 1
      if (this.state.tableData.length < 1) {
        newData.push({
          countPerUser: '0',
          id: newId,
          toolName: "",
          userName: ""
        })
      }
      else {
        console.log(this.state.tableData.at(this.state.tableData.length - 1).id)
        newData = structuredClone(this.state.tableData)
        newId = newData.at(newData.length - 1).id + 1
        newData.push({
          countPerUser: '0',
          id: newId,
          toolName: "",
          userName: ""
        })
      }
      let newAddedrow = this.state.addedrow
      newAddedrow.id = newId
      this.setState({ addedrow: newAddedrow, rowaddId: newId, tableData: newData })
    }
  }


  isAdding = (record) => {
    console.log(record.id + '?' + this.state.rowaddId)
    return record.id === this.state.rowaddId;
  }

  save() {
    console.log(this.state.addedrow)
    let addedrow = this.state.addedrow
    if (addedrow.countPerUser != 0 && addedrow.toolID != 0 && addedrow.userID != 0) {
      fetch('/table/create', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(addedrow)
      })
      let newRecord = {
        id: addedrow.id,
        toolName: this.state.tools.find(x => x.id == addedrow.toolID).toolName,
        userName: this.state.users.find(x => x.id == addedrow.userID).userName,
        countPerUser: addedrow.countPerUser
      }
      let newData = structuredClone(this.state.tableData)
      newData[this.state.tableData.length - 1] = newRecord
      this.setState({ tableData: newData })
      console.log('saved')
      this.setState({ rowaddId: -1 })
      this.populateWeatherData()
    }


  }

  cancel() {
    console.log('canceled')
    console.log(this.state.tableData)
    let newData = structuredClone(this.state.tableData)
    newData.pop()
    console.log(newData)
    this.setState({ tableData: newData, rowaddId: -1 })
    console.log(this.state.tableData)
  }

  handleTool(value) {
    console.log('Tool: ' + value)
    console.log(this.state.addedrow)
    value ? console.log(value) : console.log('empty')
    let newTool = this.state.addedrow
    newTool.toolID = value
    this.setState({ addedrow: newTool })
    console.log(this.state.addedrow)
  }

  handleUser(value) {
    console.log('User: ' + value)
    console.log(this.state.addedrow)
    value ? console.log(value) : console.log('empty')
    let newUser = this.state.addedrow
    newUser.userID = value
    this.setState({ addedrow: newUser })
    console.log(this.state.addedrow)
  }

  handleCountPerUser(e) {
    console.log('Count: ' + e.target.value)
    console.log(this.state.addedrow)
    e.target.value = e.target.value.replace(/^0/, '')
    let editable = false
    this.state.tools.length > 0 ? editable = true : editable = false

    if (editable && this.state.addedrow.toolID != 0) {
      e ? console.log(e.target.value) : console.log('empty')
      let maxCount = this.state.tools.find(record => record.id == this.state.addedrow.toolID).count
      console.log(maxCount)
      let newCount = this.state.addedrow

      if (e.target.value >= 0 && e.target.value <= maxCount)
        newCount.countPerUser = e.target.value

      this.setState({ addedrow: newCount })
      console.log(this.state.addedrow)
    }
    else {
      e.target.value = 0
    }

  }

  handleDeletedCount(e) {

    console.log(e)
    e.target.value = e.target.value.replace(/^0/, '')
    if (e.target.value >= 0 && e.target.value <= this.state.rowdelMaxCount)
      this.setState({ rowdelCurCount: e.target.value })
    if (e.target.value <= 0)
      this.setState({ modalState: 'error' })
    else {
      this.setState({ modalState: '' })
    }

  }


  render() {

    const { Option } = Select;
    const tools = [];



    for (let i = 0; i < this.state.tools.length; i++) {
      tools.push(<Option key={this.state.tools.at(i).id}>{this.state.tools.at(i).toolName + ` (${this.state.tools.at(i).count})`}</Option>);
    }

    console.log(tools)

    const users = [];
    for (let i = 0; i < this.state.users.length; i++) {
      users.push(<Option key={this.state.users.at(i).id}>{this.state.users.at(i).userName}</Option>);
    }

    console.log(users)



    const columns =

      [
        {
          title: 'Инструмент',
          dataIndex: 'toolName',
          key: '1',
          editable: true,
          width: 300,

          render: (_, record) => {
            const adding = this.isAdding(record);
            return adding ? (
              <Select
                style={{ width: '100%' }}
                placeholder="Название инструмента"
                onChange={this.handleTool}

              >
                {tools}
              </Select>
            ) :
              (record.toolName)
          }



        },
        {
          title: 'Количество',
          dataIndex: 'countPerUser',
          key: '2',
          editable: true,
          width: 300,

          render: (_, record) => {
            const adding = this.isAdding(record);
            return adding ? (
              <Input placeholder='Введите количество больше нуля' value={this.state.addedrow.countPerUser} type='number' onChange={this.handleCountPerUser} >
              </Input>
            ) :
              (record.countPerUser)
          }


        },
        {
          title: 'Пользователь',
          dataIndex: 'userName',
          key: '3',
          editable: true,
          width: 300,

          render: (_, record) => {
            const adding = this.isAdding(record);
            return adding ? (
              <Select
                style={{ width: '100%' }}
                placeholder="ФИО пользователя"
                onChange={this.handleUser}

              >
                {users}
              </Select>) :
              (record.userName)
          }
        },



        {
          title: 'Операция',
          key: '4',
          dataIndex: 'operation',
          width: 300,

          render: (_, record) => {
            const adding = this.isAdding(record);
            return adding ? (
              <span>
                <Typography.Link
                  onClick={() => this.save(record)}
                  style={{
                    marginRight: 8,
                  }}
                >
                  Сохранить
                </Typography.Link>
                <Popconfirm okText='Да' cancelText='Нет' title="Отменить?" onConfirm={() => this.cancel(record)}>
                  <a>Отменить</a>
                </Popconfirm>
              </span>
            ) : (

              <div>
                <Button type="primary" onClick={() => this.showModal(record)}>
                  Удалить
                </Button>
              </div>

            )
          }


        },
      ];



    return (
      <div>

        <div className='Button'>
          <Button onClick={this.handleRowAdding}>{'Добавить запись'}</Button>
        </div>
        <Table dataSource={this.state.tableData} columns={columns} 
          pagination={{pageSize: 50,}} scroll={{y: 600,}}></Table>
        <Modal
          title="Удаление записи"
          open={this.state.visible}
          okText='Удалить'
          cancelText='Отменить'
          onOk={this.handleRowDelete}
          onCancel={this.closeModal}
        >
          <Input status={this.state.modalState} addonBefore={this.state.rowdelToolName} addonAfter={this.state.rowdelUserName}
            placeholder='Введите количество больше нуля' value={this.state.rowdelCurCount}
            type='number' onChange={this.handleDeletedCount}></Input>


        </Modal>
      </div>
    );
  }


  async populateWeatherData() {
    console.log('getting data')
    const response = await fetch('table');
    const data = await response.json();
    console.log(response.message)
    const responseusers = await fetch('table/getusers');
    const usersdata = await responseusers.json();
    const responsetools = await fetch('table/gettools');
    const toolsdata = await responsetools.json();
    this.setState({
      tableData: data, users: usersdata, tools: toolsdata, loading: false,
      rowdelCurCount: -1, rowdelMaxCount: -1,
      addedrow:
      {
        id: 0,
        toolID: 0,
        userID: 0,
        countPerUser: 0
      }
    });

  }
}