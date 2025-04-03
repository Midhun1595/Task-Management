import React, { useState, useEffect } from 'react';
import 'antd/dist/reset.css';
import { Button, Modal, Input, Select, DatePicker, Table, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import './App.css';

const { Option } = Select;

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskData, setTaskData] = useState({ title: '', description: '', dueDate: '', priority: 'low' });

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(savedTasks);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
  }, [isDarkMode]);

  const handleSaveTask = () => {
    if (!taskData.title.trim() || !taskData.description.trim()) {
      return message.error('Title and Description are required');
    }
    const newTask = { ...taskData, completed: false, id: editingTask ? editingTask.id : Date.now() };
    let updatedTasks;
    if (editingTask) {
      updatedTasks = tasks.map(task => (task.id === editingTask.id ? newTask : task));
      setEditingTask(null);
    } else {
      updatedTasks = [...tasks, newTask];
    }

    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks)); 
    setTaskData({ title: '', description: '', dueDate: '', priority: 'low' });
    setShowModal(false);
  };


  const handleDelete = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks)); 
  };

  const handleComplete = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks)); // ✅ Save tasks after completion toggle
  };



  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const filteredTasks = filterPriority === 'all' ? tasks : tasks.filter(task => task.priority === filterPriority);
  const searchFilteredTasks = filteredTasks.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
    { 
      title: 'Priority', 
      dataIndex: 'priority', 
      key: 'priority',
      render: (priority) => (
        <span className={`priority-${priority}`}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
      )
    },
    { 
      title: 'Status', dataIndex: 'completed', key: 'completed',
      render: (completed) => completed ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <CloseCircleTwoTone twoToneColor="#eb2f96" />
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          <Button icon={<EditOutlined />} onClick={() => { setEditingTask(record); setTaskData(record); setShowModal(true); }} />
          <Button type="primary" icon={record.completed ? <CloseCircleTwoTone twoToneColor="#eb2f96" /> : <CheckCircleTwoTone twoToneColor="#52c41a" />} 
            onClick={() => handleComplete(record.id)} style={{ marginLeft: 8 }} />
          <Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} style={{ marginLeft: 8 }} />
        </div>
      )
    }
  ];

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}> 
      <h1 className="app-title">Task Management Dashboard</h1>
      <div className="controls">
        <Switch checked={isDarkMode} onChange={toggleTheme} className="theme-switch" checkedChildren="Dark" unCheckedChildren="Light" />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)} className="add-task-button">Add Task</Button>
      </div>
      <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-bar" />
      <Select value={filterPriority} onChange={setFilterPriority} className="filter-select">
        <Option value="all">All</Option>
        <Option value="low">Low</Option>
        <Option value="medium">Medium</Option>
        <Option value="high">High</Option>
      </Select>
      <Table columns={columns} dataSource={searchFilteredTasks} rowKey="id" className="task-table" />
      <Modal title={editingTask ? 'Edit Task' : 'Add Task'} open={showModal} onCancel={() => setShowModal(false)} onOk={handleSaveTask} className="task-modal">
        <Input placeholder="Task Title" value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} className="input-field" />
        <Input.TextArea placeholder="Description" value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} className="input-field" />
        <DatePicker onChange={(date, dateString) => setTaskData({ ...taskData, dueDate: dateString })} className="date-picker" />
        <Select value={taskData.priority} onChange={(value) => setTaskData({ ...taskData, priority: value })} className="priority-select">
          <Option value="low">Low</Option>
          <Option value="medium">Medium</Option>
          <Option value="high">High</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default App;
